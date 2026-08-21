"""Grounded question answering over the CV.

A visitor asks a question in plain language; the answer comes from cv.json and
nothing else. There is no vector database and no retrieval step — the whole CV
is a couple of thousand tokens, so it goes in the system prompt with a cache
point and Bedrock serves it at a fraction of the price on every request after
the first. Building a retrieval pipeline for a document this size would cost
more to run and more to maintain, and answer no better.

Cost is bounded by two independent limits. A per-visitor limit is a courtesy —
it stops one person monopolising the endpoint — but it does not bound spend,
because addresses are cheap and a determined caller has many. The global daily
limit is the actual ceiling on the bill.
"""

import hashlib
import json
import logging
import os
from datetime import datetime, timezone

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

logging.getLogger().setLevel(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger(__name__)

MODEL_ID = os.environ["MODEL_ID"]
LIMITS_TABLE = os.environ["LIMITS_TABLE"]
SITE_BUCKET = os.environ["SITE_BUCKET"]
CV_KEY = os.environ.get("CV_KEY", "cv.json")
HASH_SALT = os.environ.get("HASH_SALT", "")

PER_VISITOR_HOURLY = int(os.environ.get("PER_VISITOR_HOURLY", "5"))
GLOBAL_DAILY = int(os.environ.get("GLOBAL_DAILY", "100"))

MAX_QUESTION_CHARS = 400
MAX_ANSWER_TOKENS = 400

_dynamodb = boto3.resource("dynamodb")
_limits = _dynamodb.Table(LIMITS_TABLE)
_s3 = boto3.client("s3")
# Bedrock calls are slow relative to everything else here; one retry rather
# than the default three keeps a bad minute from pinning the function open.
_bedrock = boto3.client("bedrock-runtime", config=Config(retries={"max_attempts": 2}))

_cv_cache = None


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", "Cache-Control": "no-store"},
        "body": json.dumps(body),
    }


def _load_cv():
    """The same cv.json the site renders, fetched once per container."""
    global _cv_cache
    if _cv_cache is None:
        body = _s3.get_object(Bucket=SITE_BUCKET, Key=CV_KEY)["Body"].read()
        _cv_cache = json.loads(body)
    return _cv_cache


def build_system_prompt(cv):
    """Put the CV in the system prompt and state plainly what may be said about it.

    The instruction to refuse rather than infer is the whole point: this sits on
    a page a recruiter reads as authoritative, so a plausible-sounding invention
    about someone's employment history is the worst failure mode available.
    """
    return (
        "Du er en assistent på CV-nettsiden til "
        f"{cv['name']}. Du svarer på spørsmål fra besøkende — ofte rekrutterere "
        "— om hans bakgrunn.\n\n"
        "Regler:\n"
        "- Svar utelukkende ut fra CV-dataene nedenfor. Finn aldri på noe.\n"
        "- Står ikke svaret i dataene, si at det ikke framgår av CV-en. "
        "Ikke gjett, og ikke utled sannsynlige svar.\n"
        "- Spørsmål som ikke handler om denne CV-en: si kort at du bare svarer "
        "på spørsmål om Petters CV.\n"
        "- Svar kort, to til fire setninger, i samme språk som spørsmålet "
        "(norsk eller engelsk).\n"
        "- Omtal ham som Petter eller han. Ikke overdriv og ikke selg — "
        "gjengi det som faktisk står.\n\n"
        "CV-data (JSON):\n"
        f"{json.dumps(cv, ensure_ascii=False)}"
    )


def visitor_id(event):
    """A stable, non-reversible per-visitor key.

    CloudFront-Viewer-Address is set by CloudFront and cannot be forged by the
    client. X-Forwarded-For can be — CloudFront appends to whatever the client
    sent — so it is only a fallback for direct calls that bypass the CDN.

    The address is never stored. It is hashed with a per-stack salt and the
    current date, so the key rotates daily and yesterday's records cannot be
    correlated with today's.
    """
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}

    address = headers.get("cloudfront-viewer-address")
    if address:
        # "ip:port" — IPv6 addresses contain colons, so split from the right.
        address = address.rsplit(":", 1)[0]
    else:
        forwarded = headers.get("x-forwarded-for", "")
        address = forwarded.split(",")[0].strip() or (
            event.get("requestContext", {}).get("http", {}).get("sourceIp", "unknown")
        )

    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    digest = hashlib.sha256(f"{HASH_SALT}|{day}|{address}".encode()).hexdigest()
    return digest[:32]


def _refund(key):
    """Give back a claimed unit.

    Quota exists to bound cost and stop abuse. A failure on our side is neither,
    so a visitor should not lose one of their five questions because Bedrock was
    unavailable — otherwise a bad minute burns everyone's allowance for the hour
    and the whole day's global budget, while answering nothing.
    """
    try:
        _limits.update_item(
            Key={"pk": key},
            UpdateExpression="SET #n = #n - :one",
            ConditionExpression="#n > :zero",
            ExpressionAttributeNames={"#n": "n"},
            ExpressionAttributeValues={":one": 1, ":zero": 0},
        )
    except ClientError:
        # Best effort. Failing to refund must not turn a 502 into a 500.
        log.warning("could not refund %s", key)


def _consume(key, limit, ttl_seconds):
    """Atomically claim one unit against a limit. False when it is used up.

    A conditional update rather than read-then-write: two requests arriving
    together must not both see the same count and both be allowed through.
    """
    now = int(datetime.now(timezone.utc).timestamp())
    try:
        _limits.update_item(
            Key={"pk": key},
            UpdateExpression=(
                "SET #n = if_not_exists(#n, :zero) + :one, "
                "expiresAt = if_not_exists(expiresAt, :ttl)"
            ),
            ConditionExpression="attribute_not_exists(#n) OR #n < :limit",
            ExpressionAttributeNames={"#n": "n"},
            ExpressionAttributeValues={
                ":zero": 0,
                ":one": 1,
                ":limit": limit,
                ":ttl": now + ttl_seconds,
            },
        )
        return True
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return False
        raise


def lambda_handler(event, context):
    try:
        payload = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "Ugyldig forespørsel."})

    question = (payload.get("question") or "").strip()
    if not question:
        return _response(400, {"error": "Skriv et spørsmål."})
    if len(question) > MAX_QUESTION_CHARS:
        return _response(
            400, {"error": f"Spørsmålet må være under {MAX_QUESTION_CHARS} tegn."}
        )

    day = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    hour = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H")

    # Global first: it is the limit that actually protects the bill, and
    # checking it first means a saturated day costs one conditional write
    # rather than two.
    global_key = f"global#{day}"
    if not _consume(global_key, GLOBAL_DAILY, 172800):
        log.warning("global daily limit reached")
        return _response(
            429,
            {
                "error": "Dagens grense for spørsmål er nådd. Prøv igjen i morgen.",
                "limit": "global",
            },
        )

    visitor_key = f"visitor#{visitor_id(event)}#{hour}"
    if not _consume(visitor_key, PER_VISITOR_HOURLY, 7200):
        # The global unit was already claimed, so hand it back: this request
        # will not cost anything to serve.
        _refund(global_key)
        return _response(
            429,
            {
                "error": f"Du kan stille {PER_VISITOR_HOURLY} spørsmål per time. "
                "Prøv igjen om litt.",
                "limit": "visitor",
            },
        )

    try:
        result = _bedrock.converse(
            modelId=MODEL_ID,
            system=[
                {"text": build_system_prompt(_load_cv())},
                # Everything before this point is identical on every request,
                # so Bedrock serves it from cache after the first call.
                {"cachePoint": {"type": "default"}},
            ],
            messages=[{"role": "user", "content": [{"text": question}]}],
            inferenceConfig={"maxTokens": MAX_ANSWER_TOKENS, "temperature": 0},
        )
    except ClientError:
        log.exception("bedrock call failed")
        _refund(global_key)
        _refund(visitor_key)
        return _response(502, {"error": "Klarte ikke å svare akkurat nå."})

    answer = "".join(
        block.get("text", "") for block in result["output"]["message"]["content"]
    ).strip()

    usage = result.get("usage", {})
    log.info(
        "answered: in=%s out=%s cache_read=%s stop=%s",
        usage.get("inputTokens"),
        usage.get("outputTokens"),
        usage.get("cacheReadInputTokens"),
        result.get("stopReason"),
    )

    return _response(200, {"answer": answer})

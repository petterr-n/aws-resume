"""Scheduled result hydrator.

Fetches the F1 and Premier League feeds on a timer and writes a small
results.json to the site bucket, which CloudFront then serves directly. The
browser never triggers a Lambda invocation to read this data.

This inverts the original design, where each page load called a Lambda that
called a third-party API synchronously while the visitor waited. That failed in
three separate ways at once: the visitor paid the upstream latency, an upstream
outage became a visible site error, and every visitor consumed third-party API
quota.

Here, an upstream failure is invisible: the previous value is retained and the
page keeps showing the last known result with the timestamp it was fetched.
"""

import json
import logging
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

import boto3
from botocore.exceptions import ClientError

logging.getLogger().setLevel(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger(__name__)

# Ergast (ergast.com/api/f1) shut down after the 2024 season and returns 404.
# Jolpica is the maintained drop-in with the same response shape.
#
# Note the path: `current/last/results.json`, not `current.json`. The latter
# returns the season *schedule*, which has no Results key at all.
F1_URL = "https://api.jolpi.ca/ergast/f1/current/last/results.json"

# Team 64 is Liverpool. Asking the API for one team's last finished match beats
# fetching every finished match in the competition and filtering client-side.
FOOTBALL_URL = "https://api.football-data.org/v4/teams/64/matches?status=FINISHED&limit=1"

BUCKET = os.environ["SITE_BUCKET"]
KEY = os.environ.get("RESULTS_KEY", "data/results.json")
FOOTBALL_KEY_PARAM = os.environ.get("FOOTBALL_API_KEY_PARAMETER", "")

TIMEOUT_SECONDS = 8

_s3 = boto3.client("s3")
_ssm = boto3.client("ssm")


def _fetch(url, headers=None):
    request = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def _football_api_key():
    """None when the parameter is unset, so football degrades instead of failing."""
    if not FOOTBALL_KEY_PARAM:
        return None
    try:
        return _ssm.get_parameter(Name=FOOTBALL_KEY_PARAM, WithDecryption=True)["Parameter"]["Value"]
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ParameterNotFound":
            log.warning("%s is not set — skipping football", FOOTBALL_KEY_PARAM)
            return None
        raise


def fetch_f1():
    race = (_fetch(F1_URL).get("MRData", {}).get("RaceTable", {}).get("Races") or [None])[0]
    if not race:
        return None

    winner = (race.get("Results") or [None])[0]
    if not winner:
        return None

    return {
        "raceName": race.get("raceName"),
        "circuit": race.get("Circuit", {}).get("circuitName"),
        "winner": f"{winner['Driver']['givenName']} {winner['Driver']['familyName']}",
        "team": winner["Constructor"]["name"],
        "date": race.get("date"),
    }


def fetch_football():
    key = _football_api_key()
    if key is None:
        return None

    matches = _fetch(FOOTBALL_URL, headers={"X-Auth-Token": key}).get("matches") or []
    if not matches:
        return None

    match = matches[0]
    score = match.get("score", {}).get("fullTime", {})
    return {
        "home": match["homeTeam"]["name"],
        "away": match["awayTeam"]["name"],
        "homeScore": score.get("home"),
        "awayScore": score.get("away"),
        "competition": match.get("competition", {}).get("name"),
        "date": match.get("utcDate"),
    }


def read_previous():
    """Last published document, or an empty one if there isn't a usable one yet."""
    try:
        body = _s3.get_object(Bucket=BUCKET, Key=KEY)["Body"].read()
        return json.loads(body)
    except ClientError as exc:
        if exc.response["Error"]["Code"] in ("NoSuchKey", "404"):
            return {}
        raise
    except json.JSONDecodeError:
        log.warning("previous %s was not valid JSON — starting fresh", KEY)
        return {}


def lambda_handler(event, context):
    previous = read_previous()
    document = {"updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    failures = []

    for name, fetcher in (("f1", fetch_f1), ("football", fetch_football)):
        try:
            result = fetcher()
        except (urllib.error.URLError, TimeoutError, KeyError, ValueError) as exc:
            # Keep the previous value rather than publishing a hole. A feed
            # being down should not remove a result the page was showing.
            log.warning("%s fetch failed (%s) — keeping previous value", name, exc)
            failures.append(name)
            document[name] = previous.get(name)
            continue

        # A successful fetch that legitimately has nothing to report (no race
        # yet this season) publishes null, which is different from a failure.
        document[name] = result
        if result is not None:
            document.setdefault("fetchedAt", {})[name] = document["updatedAt"]
        elif previous.get("fetchedAt", {}).get(name):
            document.setdefault("fetchedAt", {})[name] = previous["fetchedAt"][name]

    for name in ("f1", "football"):
        if name in failures and previous.get("fetchedAt", {}).get(name):
            document.setdefault("fetchedAt", {})[name] = previous["fetchedAt"][name]

    _s3.put_object(
        Bucket=BUCKET,
        Key=KEY,
        Body=json.dumps(document).encode("utf-8"),
        ContentType="application/json",
        # CloudFront honours this, so the edge serves the file for five minutes
        # between origin fetches. The schedule runs every 30, so readers see
        # data at most ~35 minutes old while S3 is hit twelve times an hour.
        CacheControl="public, max-age=300",
    )

    log.info("published %s (failures: %s)", KEY, failures or "none")
    return {"published": KEY, "failures": failures}

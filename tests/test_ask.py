"""Tests for the CV question endpoint, with Bedrock and S3 mocked."""

import json

import boto3
import pytest
from moto import mock_aws

from conftest import load_handler

BUCKET = "test-site-bucket"
TABLE = "test-ask-limits"

CV = {
    "name": "Petter Rønning-Nyvold",
    "sections": [{"id": "utdanning", "title": "Utdanning", "entries": []}],
}


class FakeBedrock:
    """Records calls so the tests can assert on what was sent, not just what came back."""

    def __init__(self):
        self.calls = []

    def converse(self, **kwargs):
        self.calls.append(kwargs)
        return {
            "output": {"message": {"content": [{"text": "Ja, det stemmer."}]}},
            "usage": {"inputTokens": 2100, "outputTokens": 40, "cacheReadInputTokens": 2000},
            "stopReason": "end_turn",
        }


@pytest.fixture
def ask(aws_env, monkeypatch):
    monkeypatch.setenv("MODEL_ID", "eu.anthropic.claude-haiku-4-5-20251001-v1:0")
    monkeypatch.setenv("LIMITS_TABLE", TABLE)
    monkeypatch.setenv("SITE_BUCKET", BUCKET)
    monkeypatch.setenv("HASH_SALT", "test-salt")
    monkeypatch.setenv("PER_VISITOR_HOURLY", "3")
    monkeypatch.setenv("GLOBAL_DAILY", "5")

    with mock_aws():
        s3 = boto3.client("s3", region_name="eu-north-1")
        s3.create_bucket(
            Bucket=BUCKET,
            CreateBucketConfiguration={"LocationConstraint": "eu-north-1"},
        )
        s3.put_object(Bucket=BUCKET, Key="cv.json", Body=json.dumps(CV).encode())
        boto3.resource("dynamodb", region_name="eu-north-1").create_table(
            TableName=TABLE,
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )

        module = load_handler("ask_app", "ask")
        fake = FakeBedrock()
        module._bedrock = fake
        yield module, fake


def request(question, address="203.0.113.7:52000", body=None):
    return {
        "headers": {"CloudFront-Viewer-Address": address},
        "requestContext": {"http": {"method": "POST", "sourceIp": "198.51.100.1"}},
        "body": body if body is not None else json.dumps({"question": question}),
    }


def test_answers_a_question(ask):
    module, fake = ask
    response = module.lambda_handler(request("Har han jobbet med maskinsyn?"), None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["answer"] == "Ja, det stemmer."
    assert len(fake.calls) == 1


def test_cv_goes_in_the_system_prompt_with_a_cache_point(ask):
    """No retrieval step: the whole CV is the prompt, cached after the first call."""
    module, fake = ask
    module.lambda_handler(request("Hva har han studert?"), None)

    system = fake.calls[0]["system"]
    assert "Petter Rønning-Nyvold" in system[0]["text"]
    assert system[-1] == {"cachePoint": {"type": "default"}}


def test_answer_length_is_capped(ask):
    module, fake = ask
    module.lambda_handler(request("Fortell om ham"), None)
    assert fake.calls[0]["inferenceConfig"]["maxTokens"] == module.MAX_ANSWER_TOKENS


def test_per_visitor_limit(ask):
    """The fourth question from one address is refused; the limit is 3."""
    module, fake = ask
    for _ in range(3):
        assert module.lambda_handler(request("Hei"), None)["statusCode"] == 200

    response = module.lambda_handler(request("Hei igjen"), None)

    assert response["statusCode"] == 429
    assert json.loads(response["body"])["limit"] == "visitor"
    assert len(fake.calls) == 3, "a refused request must not reach the model"


def test_a_different_visitor_is_unaffected(ask):
    module, _ = ask
    for _ in range(3):
        module.lambda_handler(request("Hei", address="203.0.113.7:1"), None)

    other = module.lambda_handler(request("Hei", address="198.51.100.9:1"), None)
    assert other["statusCode"] == 200


def test_global_limit_stops_everyone(ask):
    """The limit that actually bounds the bill: new addresses do not evade it."""
    module, fake = ask
    for i in range(5):
        r = module.lambda_handler(request("Hei", address=f"203.0.113.{i}:1"), None)
        assert r["statusCode"] == 200

    response = module.lambda_handler(request("Hei", address="203.0.113.200:1"), None)

    assert response["statusCode"] == 429
    assert json.loads(response["body"])["limit"] == "global"
    assert len(fake.calls) == 5


def test_forged_forwarded_for_cannot_reset_the_visitor_limit(ask):
    """X-Forwarded-For is client-controllable; CloudFront-Viewer-Address is not.

    A caller rotating X-Forwarded-For must still be held to one visitor budget.
    """
    module, _ = ask
    for i in range(3):
        event = request("Hei")
        event["headers"]["X-Forwarded-For"] = f"10.0.0.{i}"
        assert module.lambda_handler(event, None)["statusCode"] == 200

    event = request("Hei")
    event["headers"]["X-Forwarded-For"] = "10.0.0.99"
    assert module.lambda_handler(event, None)["statusCode"] == 429


def test_addresses_are_not_stored(ask):
    """Only a salted hash is written, never the address itself."""
    module, _ = ask
    module.lambda_handler(request("Hei", address="203.0.113.7:52000"), None)

    items = boto3.resource("dynamodb", region_name="eu-north-1").Table(TABLE).scan()["Items"]
    keys = " ".join(i["pk"] for i in items)

    assert "203.0.113.7" not in keys
    assert any(i["pk"].startswith("visitor#") for i in items)
    assert all("expiresAt" in i for i in items), "counters must expire"


def test_empty_question_rejected(ask):
    module, fake = ask
    assert module.lambda_handler(request("   "), None)["statusCode"] == 400
    assert fake.calls == []


def test_overlong_question_rejected(ask):
    module, fake = ask
    response = module.lambda_handler(request("a" * 5000), None)
    assert response["statusCode"] == 400
    assert fake.calls == [], "an oversized prompt must not reach the model"


def test_malformed_body_rejected(ask):
    module, fake = ask
    assert module.lambda_handler(request(None, body="not json"), None)["statusCode"] == 400
    assert fake.calls == []


def test_bedrock_failure_is_502(ask):
    module, fake = ask

    def boom(**kwargs):
        from botocore.exceptions import ClientError

        raise ClientError({"Error": {"Code": "ThrottlingException"}}, "Converse")

    fake.converse = boom
    assert module.lambda_handler(request("Hei"), None)["statusCode"] == 502


def test_failed_answer_does_not_cost_the_visitor_a_question(ask):
    """Quota bounds cost and abuse. A failure on our side is neither.

    Without this, a bad minute at the upstream burns every visitor's hourly
    allowance and the whole day's global budget while answering nothing.
    """
    module, fake = ask

    def boom(**kwargs):
        from botocore.exceptions import ClientError

        raise ClientError({"Error": {"Code": "ThrottlingException"}}, "Converse")

    fake.converse = boom
    for _ in range(4):
        assert module.lambda_handler(request("Hei"), None)["statusCode"] == 502

    # Four failures, yet the visitor's three questions are all still available.
    fake.converse = FakeBedrock().converse
    for _ in range(3):
        assert module.lambda_handler(request("Hei"), None)["statusCode"] == 200


def test_visitor_limit_does_not_consume_global_budget(ask):
    """A rate-limited request costs nothing to serve, so it must not spend budget."""
    module, _ = ask
    for _ in range(3):
        module.lambda_handler(request("Hei", address="203.0.113.7:1"), None)
    for _ in range(3):
        module.lambda_handler(request("Hei", address="203.0.113.7:1"), None)

    table = boto3.resource("dynamodb", region_name="eu-north-1").Table(TABLE)
    globals_ = [i for i in table.scan()["Items"] if i["pk"].startswith("global#")]
    assert int(globals_[0]["n"]) == 3, "refused requests should not spend global budget"


def test_direct_calls_cannot_forge_an_identity_with_forwarded_for(ask):
    """The execute-api hostname is public, so direct calls must be limited too.

    Bypassing CloudFront means no CloudFront-Viewer-Address, and on a direct
    call X-Forwarded-For is entirely client-supplied. If it were trusted, a
    caller could mint a fresh allowance per request by varying the header.
    sourceIp is the TCP peer as API Gateway sees it and cannot be forged.
    """
    module, _ = ask

    def direct(xff):
        return {
            "headers": {"X-Forwarded-For": xff},  # no CloudFront-Viewer-Address
            "requestContext": {"http": {"method": "POST", "sourceIp": "198.51.100.5"}},
            "body": json.dumps({"question": "Hei"}),
        }

    for i in range(3):
        assert module.lambda_handler(direct(f"10.0.0.{i}"), None)["statusCode"] == 200

    # A fourth forged header, same real peer: refused.
    assert module.lambda_handler(direct("10.0.0.250"), None)["statusCode"] == 429

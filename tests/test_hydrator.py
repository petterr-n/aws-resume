"""Tests for the scheduled hydrator, against a mocked S3 bucket."""

import json
import urllib.error

import boto3
import pytest
from moto import mock_aws

from conftest import load_handler

BUCKET = "test-site-bucket"
KEY = "data/results.json"

F1_RAW = {
    "MRData": {
        "RaceTable": {
            "Races": [
                {
                    "raceName": "Belgian Grand Prix",
                    "date": "2026-07-26",
                    "Circuit": {"circuitName": "Circuit de Spa-Francorchamps"},
                    "Results": [
                        {
                            "Driver": {"givenName": "Oscar", "familyName": "Piastri"},
                            "Constructor": {"name": "McLaren"},
                        }
                    ],
                }
            ]
        }
    }
}

FOOTBALL_RAW = {
    "matches": [
        {
            "utcDate": "2026-05-24T15:00:00Z",
            "homeTeam": {"name": "Liverpool FC"},
            "awayTeam": {"name": "Crystal Palace"},
            "score": {"fullTime": {"home": 2, "away": 1}},
            "competition": {"name": "Premier League"},
        }
    ]
}


@pytest.fixture
def hydrator(aws_env, monkeypatch):
    monkeypatch.setenv("SITE_BUCKET", BUCKET)
    monkeypatch.setenv("RESULTS_KEY", KEY)
    monkeypatch.setenv("FOOTBALL_API_KEY_PARAMETER", "/petter-rn/football-api-key")

    with mock_aws():
        s3 = boto3.client("s3", region_name="eu-north-1")
        s3.create_bucket(
            Bucket=BUCKET,
            CreateBucketConfiguration={"LocationConstraint": "eu-north-1"},
        )
        boto3.client("ssm", region_name="eu-north-1").put_parameter(
            Name="/petter-rn/football-api-key", Value="test-key", Type="SecureString"
        )
        # Loaded inside the mock so the module-level boto3 clients it builds
        # at import time are the mocked ones.
        module = load_handler("hydrator_app", "hydrator")
        yield module, s3


def published(s3):
    return json.loads(s3.get_object(Bucket=BUCKET, Key=KEY)["Body"].read())


def test_publishes_both_feeds(hydrator, monkeypatch):
    module, s3 = hydrator
    monkeypatch.setattr(
        module, "_fetch",
        lambda url, headers=None: F1_RAW if "jolpi" in url else FOOTBALL_RAW,
    )

    module.lambda_handler({}, None)
    doc = published(s3)

    assert doc["f1"]["winner"] == "Oscar Piastri"
    assert doc["football"]["home"] == "Liverpool FC"
    assert doc["updatedAt"]


def test_published_object_is_cacheable(hydrator, monkeypatch):
    """CloudFront serves this from the edge; without the header it would not."""
    module, s3 = hydrator
    monkeypatch.setattr(module, "_fetch", lambda url, headers=None: F1_RAW)

    module.lambda_handler({}, None)
    head = s3.head_object(Bucket=BUCKET, Key=KEY)

    assert "max-age=300" in head["CacheControl"]
    assert head["ContentType"] == "application/json"


def test_upstream_failure_keeps_the_previous_value(hydrator, monkeypatch):
    """The central claim of this design: a dead feed does not blank the page."""
    module, s3 = hydrator

    monkeypatch.setattr(module, "_fetch", lambda url, headers=None: F1_RAW)
    module.lambda_handler({}, None)
    first = published(s3)
    assert first["f1"]["winner"] == "Oscar Piastri"

    def dead(url, headers=None):
        raise urllib.error.URLError("upstream down")

    monkeypatch.setattr(module, "_fetch", dead)
    result = module.lambda_handler({}, None)

    second = published(s3)
    assert "f1" in result["failures"]
    assert second["f1"]["winner"] == "Oscar Piastri", "previous result was discarded"
    # The retained value keeps the timestamp of when it was actually fetched,
    # so the page can say how stale it is rather than implying it is current.
    assert second["fetchedAt"]["f1"] == first["fetchedAt"]["f1"]


def test_timeout_also_retains(hydrator, monkeypatch):
    module, s3 = hydrator
    monkeypatch.setattr(module, "_fetch", lambda url, headers=None: F1_RAW)
    module.lambda_handler({}, None)

    def slow(url, headers=None):
        raise TimeoutError()

    monkeypatch.setattr(module, "_fetch", slow)
    module.lambda_handler({}, None)

    assert published(s3)["f1"]["winner"] == "Oscar Piastri"


def test_empty_feed_publishes_null_not_a_failure(hydrator, monkeypatch):
    """No race yet this season is a real answer, distinct from a broken feed."""
    module, s3 = hydrator
    monkeypatch.setattr(
        module, "_fetch",
        lambda url, headers=None: {"MRData": {"RaceTable": {"Races": []}}},
    )

    result = module.lambda_handler({}, None)

    assert result["failures"] == []
    assert published(s3)["f1"] is None


def test_first_run_with_no_previous_file(hydrator, monkeypatch):
    """read_previous must tolerate the object not existing yet."""
    module, s3 = hydrator

    def dead(url, headers=None):
        raise urllib.error.URLError("down")

    monkeypatch.setattr(module, "_fetch", dead)
    module.lambda_handler({}, None)

    doc = published(s3)
    assert doc["f1"] is None and doc["football"] is None


def test_missing_football_key_skips_football_but_still_publishes_f1(
    aws_env, monkeypatch
):
    """A missing SSM parameter must not take the whole run down."""
    monkeypatch.setenv("SITE_BUCKET", BUCKET)
    monkeypatch.setenv("RESULTS_KEY", KEY)
    monkeypatch.setenv("FOOTBALL_API_KEY_PARAMETER", "/petter-rn/football-api-key")

    with mock_aws():
        s3 = boto3.client("s3", region_name="eu-north-1")
        s3.create_bucket(
            Bucket=BUCKET,
            CreateBucketConfiguration={"LocationConstraint": "eu-north-1"},
        )
        # Deliberately no SSM parameter created.
        module = load_handler("hydrator_app", "hydrator")
        monkeypatch.setattr(module, "_fetch", lambda url, headers=None: F1_RAW)

        module.lambda_handler({}, None)
        doc = json.loads(s3.get_object(Bucket=BUCKET, Key=KEY)["Body"].read())

    assert doc["f1"]["winner"] == "Oscar Piastri"
    assert doc["football"] is None


def test_uses_maintained_f1_endpoint(hydrator):
    module, _ = hydrator
    assert "ergast.com" not in module.F1_URL
    assert module.F1_URL.endswith("/current/last/results.json")


def test_queries_liverpool_directly(hydrator):
    module, _ = hydrator
    assert "/teams/64/" in module.FOOTBALL_URL

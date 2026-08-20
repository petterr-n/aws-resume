"""Tests for the sports feeds, with both upstream APIs stubbed out."""

import json
import urllib.error

import pytest

from conftest import http_event, load_handler


@pytest.fixture
def sports_app(aws_env, monkeypatch):
    module = load_handler("sports_app", "sports")
    monkeypatch.setattr(module, "_football_key", "test-key")
    return module


F1_PAYLOAD = {
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

FOOTBALL_PAYLOAD = {
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


def test_f1_returns_winner(sports_app, monkeypatch):
    monkeypatch.setattr(sports_app, "_fetch", lambda url, headers=None: F1_PAYLOAD)

    body = json.loads(sports_app.lambda_handler(http_event("GET /f1"), None)["body"])

    assert body["result"]["winner"] == "Oscar Piastri"
    assert body["result"]["team"] == "McLaren"


def test_f1_uses_the_results_endpoint_not_the_schedule(sports_app):
    """`current.json` returns the season schedule and has no Results key.

    Requesting it was why the F1 panel could only ever say "Kommer senere...".
    """
    assert sports_app.F1_URL.endswith("/current/last/results.json")
    assert "ergast.com" not in sports_app.F1_URL


def test_football_returns_liverpool_not_manchester_city(sports_app, monkeypatch):
    """Team 64 is Liverpool. The old code filtered for Manchester City."""
    monkeypatch.setattr(sports_app, "_fetch", lambda url, headers=None: FOOTBALL_PAYLOAD)

    body = json.loads(sports_app.lambda_handler(http_event("GET /football"), None)["body"])

    assert body["result"]["home"] == "Liverpool FC"
    assert body["result"]["homeScore"] == 2
    assert "/teams/64/" in sports_app.FOOTBALL_URL


def test_empty_feed_is_a_cacheable_200(sports_app, monkeypatch):
    """No fixtures yet is a valid answer, not a failure."""
    monkeypatch.setattr(sports_app, "_fetch", lambda url, headers=None: {"matches": []})

    response = sports_app.lambda_handler(http_event("GET /football"), None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["result"] is None


def test_upstream_error_becomes_502(sports_app, monkeypatch):
    def boom(url, headers=None):
        raise urllib.error.HTTPError(url, 503, "Service Unavailable", {}, None)

    monkeypatch.setattr(sports_app, "_fetch", boom)

    assert sports_app.lambda_handler(http_event("GET /f1"), None)["statusCode"] == 502


def test_upstream_timeout_becomes_504(sports_app, monkeypatch):
    def slow(url, headers=None):
        raise TimeoutError()

    monkeypatch.setattr(sports_app, "_fetch", slow)

    assert sports_app.lambda_handler(http_event("GET /f1"), None)["statusCode"] == 504


def test_errors_are_not_cached(sports_app, monkeypatch):
    """A cached failure would outlive the failure itself."""
    def boom(url, headers=None):
        raise urllib.error.HTTPError(url, 500, "err", {}, None)

    monkeypatch.setattr(sports_app, "_fetch", boom)
    headers = sports_app.lambda_handler(http_event("GET /f1"), None)["headers"]

    assert "max-age=0" in headers["Cache-Control"]


def test_unknown_route_is_404(sports_app):
    """The old handler answered 200 with an error body for unknown paths."""
    response = sports_app.lambda_handler(http_event("GET /cricket"), None)
    assert response["statusCode"] == 404


def test_successful_response_is_cacheable(sports_app, monkeypatch):
    """CloudFront needs this to serve repeats without invoking Lambda."""
    monkeypatch.setattr(sports_app, "_fetch", lambda url, headers=None: F1_PAYLOAD)

    headers = sports_app.lambda_handler(http_event("GET /f1"), None)["headers"]

    assert "max-age=300" in headers["Cache-Control"]

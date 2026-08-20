"""F1 and Premier League result feeds.

Fetches from two upstream APIs and returns only the fields the page renders,
rather than forwarding whole payloads for the browser to sift through.

Uses urllib from the standard library so the function has no dependencies to
package. Routing is done on the API's routeKey, not by substring-matching a
path, so an unrecognised route fails loudly instead of falling through.
"""

import json
import logging
import os
import urllib.error
import urllib.request

import boto3

logging.getLogger().setLevel(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger(__name__)

# Ergast (ergast.com/api/f1) shut down after the 2024 season and now returns
# 404. Jolpica is the maintained drop-in with the same response shape.
#
# Note the path: `current/last/results.json`, not `current.json`. The latter
# returns the season *schedule*, which contains no Results key at all — so the
# old code would have shown "Kommer senere..." even while Ergast was alive.
F1_URL = "https://api.jolpi.ca/ergast/f1/current/last/results.json"
FOOTBALL_URL = (
    "https://api.football-data.org/v4/teams/64/matches"
    "?status=FINISHED&limit=1"
)

TIMEOUT_SECONDS = 6

_ssm = boto3.client("ssm")
_football_key = None


def _get_football_key():
    """Read the API key from SSM once per container, then cache it."""
    global _football_key
    if _football_key is None:
        name = os.environ["FOOTBALL_API_KEY_PARAMETER"]
        _football_key = _ssm.get_parameter(Name=name, WithDecryption=True)["Parameter"]["Value"]
    return _football_key


def _response(status, body, cache_seconds=300):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            # Lets CloudFront serve repeat requests without invoking Lambda.
            "Cache-Control": f"public, max-age={cache_seconds}",
        },
        "body": json.dumps(body),
    }


def _fetch(url, headers=None):
    request = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return json.loads(response.read().decode("utf-8"))


def get_f1():
    """Latest race winner, or None if the season has not started."""
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


def get_football():
    """Liverpool's most recent finished match, or None if there isn't one.

    Team 64 is Liverpool. The previous version asked for every finished match
    in the competition and then searched it for *Manchester City*, under a
    heading that read "Liverpool FC" — and took the season's first match
    rather than its most recent.
    """
    matches = _fetch(
        FOOTBALL_URL, headers={"X-Auth-Token": _get_football_key()}
    ).get("matches") or []
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


ROUTES = {
    "GET /f1": get_f1,
    "GET /football": get_football,
}


def lambda_handler(event, context):
    route = event.get("routeKey")
    handler = ROUTES.get(route)

    if handler is None:
        log.warning("no handler for route %r", route)
        return _response(404, {"error": "Not found."}, cache_seconds=0)

    try:
        result = handler()
    except urllib.error.HTTPError as exc:
        log.error("%s upstream returned %s", route, exc.code)
        return _response(502, {"error": "Upstream feed unavailable."}, cache_seconds=0)
    except (urllib.error.URLError, TimeoutError):
        log.exception("%s upstream unreachable", route)
        return _response(504, {"error": "Upstream feed timed out."}, cache_seconds=0)
    except Exception:
        log.exception("%s failed", route)
        return _response(500, {"error": "Could not load results."}, cache_seconds=0)

    if result is None:
        # A real, cacheable answer: the feed works, there is just no result yet.
        return _response(200, {"result": None})

    return _response(200, {"result": result})

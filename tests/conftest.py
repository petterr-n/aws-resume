import importlib.util
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent


def load_handler(alias, package):
    """Load src/<package>/app.py as a fresh module named <alias>.

    Both functions are packaged as `app.py`, so putting their directories on
    sys.path makes them collide in sys.modules — whichever imports first wins
    and the other test module silently gets the wrong handler. Loading from an
    explicit file path under a distinct alias keeps them separate, and
    re-executing gives each test a clean module-level state (the cached
    DynamoDB table handle, the cached SSM parameter).
    """
    path = ROOT / "src" / package / "app.py"
    spec = importlib.util.spec_from_file_location(alias, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[alias] = module
    spec.loader.exec_module(module)
    return module


@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    """Never let a test reach a real AWS account."""
    monkeypatch.setenv("AWS_ACCESS_KEY_ID", "testing")
    monkeypatch.setenv("AWS_SECRET_ACCESS_KEY", "testing")
    monkeypatch.setenv("AWS_SESSION_TOKEN", "testing")
    monkeypatch.setenv("AWS_DEFAULT_REGION", "eu-north-1")
    monkeypatch.setenv("TABLE_NAME", "test-visitors")
    monkeypatch.setenv("FOOTBALL_API_KEY_PARAMETER", "/petter-rn/football-api-key")


def http_event(route_key, path=None):
    """A minimal API Gateway HTTP API (payload format 2.0) event."""
    method, _, route_path = route_key.partition(" ")
    return {
        "version": "2.0",
        "routeKey": route_key,
        "rawPath": path or route_path,
        "requestContext": {"http": {"method": method, "path": path or route_path}},
    }

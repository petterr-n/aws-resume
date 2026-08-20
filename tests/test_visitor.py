"""Tests for the visitor counter, against a mocked DynamoDB table."""

import json

import boto3
import pytest
from moto import mock_aws

from conftest import http_event, load_handler


@pytest.fixture
def visitor_app(aws_env):
    """Import the handler inside the mock so its module-level table is mocked too."""
    with mock_aws():
        boto3.resource("dynamodb", region_name="eu-north-1").create_table(
            TableName="test-visitors",
            KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield load_handler("visitor_app", "visitor")


def test_first_visit_returns_one(visitor_app):
    """An empty table starts the count at 1, not at an error."""
    response = visitor_app.lambda_handler(http_event("GET /visitor"), None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"count": 1}


def test_count_increments_across_visits(visitor_app):
    for expected in (1, 2, 3):
        response = visitor_app.lambda_handler(http_event("GET /visitor"), None)
        assert json.loads(response["body"])["count"] == expected


def test_returns_json_content_type(visitor_app):
    response = visitor_app.lambda_handler(http_event("GET /visitor"), None)
    assert response["headers"]["Content-Type"] == "application/json"


def test_no_cors_headers_from_the_function(visitor_app):
    """CORS belongs to the API, not to every handler.

    Hand-written Allow-Origin headers were how the wildcard got everywhere;
    the HTTP API's CorsConfiguration owns this now.
    """
    headers = visitor_app.lambda_handler(http_event("GET /visitor"), None)["headers"]
    assert not any(h.lower().startswith("access-control-") for h in headers)


def test_handler_ignores_request_path(visitor_app):
    """The regression test for the outage.

    The old handler read `event["rawPath"]` and branched on it. Against a REST
    API that key is absent, so every request fell through to
    {"error": "Unsupported path: /"} with a 200 status. Routing is the API's
    job now: given an event with no path information at all, this must still
    return a count.
    """
    response = visitor_app.lambda_handler({}, None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["count"] == 1


def test_returns_500_when_table_is_missing(aws_env):
    """A broken backend must surface as 5xx so the CloudWatch alarm fires.

    The previous handler returned 200 with an error body, which no alarm and
    no uptime check would ever notice.
    """
    with mock_aws():
        module = load_handler("visitor_app", "visitor")
        response = module.lambda_handler(http_event("GET /visitor"), None)

    assert response["statusCode"] == 500
    assert "count" not in json.loads(response["body"])

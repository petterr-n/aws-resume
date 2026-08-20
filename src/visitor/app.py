"""Visitor counter.

Increments a single DynamoDB item and returns the new total. The table name
comes from the environment so nothing is pinned to a hand-created table, and
the CORS headers that used to be written here now live on the HTTP API.
"""

import json
import logging
import os

import boto3

logging.getLogger().setLevel(os.environ.get("LOG_LEVEL", "INFO"))
log = logging.getLogger(__name__)

TABLE_NAME = os.environ["TABLE_NAME"]
COUNTER_ID = "visitor-counter"

# Created at import time so it is reused across invocations on a warm container.
_table = boto3.resource("dynamodb").Table(TABLE_NAME)


def _response(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    """Return {"count": n} after incrementing.

    The previous version inspected the request path to decide what to do, and
    read it from `rawPath`, which only exists on HTTP API payloads — against a
    REST API it silently fell through to an error branch. Routing is now the
    API's job, so this function does exactly one thing and there is no path to
    read.
    """
    try:
        result = _table.update_item(
            Key={"id": COUNTER_ID},
            UpdateExpression="SET #c = if_not_exists(#c, :zero) + :one",
            ExpressionAttributeNames={"#c": "count"},
            ExpressionAttributeValues={":one": 1, ":zero": 0},
            ReturnValues="UPDATED_NEW",
        )
        count = int(result["Attributes"]["count"])
        log.info("visitor count incremented to %s", count)
        return _response(200, {"count": count})

    except Exception:
        # exception() logs the traceback; the client gets nothing internal.
        log.exception("failed to increment visitor count")
        return _response(500, {"error": "Could not read the visitor count."})

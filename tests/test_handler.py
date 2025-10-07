import sys
import os
import pytest
from moto import mock_dynamodb
import boto3

# Add src folder to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

# Import your Lambda app
from visitor_counter import app  # adjust this if your module is in a subfolder

TABLE_NAME = "VisitorCounter"

@mock_dynamodb
def test_lambda_handler():
    # Create mocked DynamoDB resource and table
    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    dynamodb.create_table(
        TableName=TABLE_NAME,
        KeySchema=[{"AttributeName": "id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )

    # Replace app.table with mocked table
    app.table = dynamodb.Table(TABLE_NAME)


    # Call Lambda handler
    response = app.lambda_handler({}, {})
    body = response.get("body")
    assert response["statusCode"] == 200
    assert '"count":' in body

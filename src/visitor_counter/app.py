import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VisitorCounter')  # your table name

def lambda_handler(event, context):
    try:
        response = table.update_item(
            Key={'id': 'visitor-counter'},
            UpdateExpression="SET #c = if_not_exists(#c, :start_val) + :inc_val",
            ExpressionAttributeNames={'#c': 'count'},
            ExpressionAttributeValues={
                ':inc_val': 1,
                ':start_val': 0
            },
            ReturnValues="UPDATED_NEW"
        )

        count = int(response['Attributes']['count'])

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({"count": count})
        }
    except Exception as e:
        print(e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to update visitor count"})
        }

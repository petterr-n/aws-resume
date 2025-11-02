import boto3
import json
import urllib3
import os

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('VisitorCounter')
http = urllib3.PoolManager()

def lambda_handler(event, context):
    path = event.get("rawPath", "/")
    print("Received path:", path)

    try:
        if path.endswith("/visitor"):
            # Visitor counter
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
            body = {"count": int(response['Attributes']['count'])}

        elif path.endswith("/f1"):
            try:
                f1_url = "https://ergast.com/api/f1/current.json"
                res = http.request("GET", f1_url, timeout=5.0)
                if res.status != 200:
                    body = {"error": f"F1 API returned {res.status}"}
                else:
                    try:
                        body = json.loads(res.data.decode("utf-8"))
                    except Exception:
                        body = {"error": "Failed to parse F1 API response"}
            except Exception as e:
                body = {"error": f"F1 API request failed: {str(e)}"}

        elif path.endswith("/football"):
            try:
                football_url = "https://api.football-data.org/v4/matches"
                headers = {"X-Auth-Token": os.environ.get("FOOTBALL_API_KEY")}
                res = http.request("GET", football_url, headers=headers, timeout=5.0)
                if res.status != 200:
                    body = {"error": f"Football API returned {res.status}"}
                else:
                    try:
                        body = json.loads(res.data.decode("utf-8"))
                    except Exception:
                        body = {"error": "Failed to parse football API response"}
            except Exception as e:
                body = {"error": f"Football API request failed: {str(e)}"}


        else:
            body = {"error": f"Unsupported path: {path}"}

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": json.dumps(body)
        }

    except Exception as e:
        print("Error:", e)
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }

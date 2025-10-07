import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from visitor_counter import app

def test_lambda_handler_returns_response():
    result = app.lambda_handler({}, {})
    assert "statusCode" in result
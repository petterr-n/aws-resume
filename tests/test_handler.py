from src.visitor_counter import app

def test_lambda_handler_returns_response():
    result = app.lambda_handler({}, {})
    assert "statusCode" in result
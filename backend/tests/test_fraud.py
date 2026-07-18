from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

transaction = {
        "amount": 10.0,
        "time": 0.0,
        "v1": 0.0, "v2": 0.0, "v3": 0.0, "v4": 0.0,
        "v5": 0.0, "v6": 0.0, "v7": 0.0, "v8": 0.0,
        "v9": 0.0, "v10": 0.0, "v11": 0.0, "v12": 0.0,
        "v13": 0.0, "v14": 0.0, "v15": 0.0, "v16": 0.0,
        "v17": 0.0, "v18": 0.0, "v19": 0.0, "v20": 0.0,
        "v21": 0.0, "v22": 0.0, "v23": 0.0, "v24": 0.0,
        "v25": 0.0, "v26": 0.0, "v27": 0.0, "v28": 0.0
    }

def test_fraud_score_legitimate():
    response = client.post("/fraud/score", json=transaction)
    assert "fraud_score" in response.json()
    assert "is_flagged" in response.json()
    assert "top_reasons" in response.json()

def test_fraud_score_high_amount():
    high_amount_transaction = {**transaction, "amount": 25000.0}
    response = client.post("/fraud/score", json=high_amount_transaction)
    assert "fraud_score" in response.json()
    assert response.json()["fraud_score"] > 0.0
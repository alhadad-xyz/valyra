from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@patch("app.services.valuation_service.valuation_service.model")
def test_analyze_valuation(mock_model):
    # Mock the response from Gemini
    mock_response = MagicMock()
    mock_response.text = '{"valuation_range": {"min": 500000, "max": 1000000}, "confidence": 0.85}'
    mock_model.generate_content.return_value = mock_response

    payload = {
        "revenue": 100000,
        "growth_rate": 0.5,
        "industry": "SaaS",
        "description": "A great project"
    }

    response = client.post("/api/v1/valuation/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "valuation_range" in data
    assert data["valuation_range"]["min"] == 500000
    assert data["valuation_range"]["max"] == 1000000
    assert data["confidence"] == 0.85

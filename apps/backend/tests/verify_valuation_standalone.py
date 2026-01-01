import sys
import os
import asyncio
from unittest.mock import MagicMock

# Ensure we can import 'app'
# Add the parent directory of 'tests' (which is 'apps/backend') to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock dependencies to avoid loading the whole app/config if not needed
sys.modules["app.core.config"] = MagicMock()
sys.modules["google.generativeai"] = MagicMock()

# Setup settings mock
from app.core import config
config.settings = MagicMock()
config.settings.gemini_api_key.get_secret_value.return_value = "fake_key"

# Now import the service (it imports genai and config)
# We need to make sure 'app' module is resolvable.
import os
sys.path.append(os.getcwd())

# Create a dummy valuation service file content if import fails due to other deps?
# No, let's try importing the real one. 
# But 'app.services.valuation_service' imports 'app.core.config'. We mocked it.

try:
    from app.services.valuation_service import ValuationService
except ImportError:
    # If standard import fails, we might need to adjust sys.path more carefully
    sys.path.append("apps/backend")
    from app.services.valuation_service import ValuationService

async def main():
    print("Testing ValuationService...")
    
    # Setup mock
    service = ValuationService()
    service.model = MagicMock()
    
    mock_response = MagicMock()
    mock_response.text = '{"valuation_range": {"min": 500000, "max": 1000000}, "confidence": 0.85}'
    service.model.generate_content.return_value = mock_response

    payload = {
        "revenue": 100000,
        "growth_rate": 0.5,
        "industry": "SaaS",
        "description": "A great project"
    }
    
    print(f"Payload: {payload}")
    result = await service.generate_valuation(payload)
    
    print(f"Result: {result}")
    
    assert result["valuation_range"]["min"] == 500000
    assert result["confidence"] == 0.85
    print("✅ ValuationService Verified Successfully!")

if __name__ == "__main__":
    asyncio.run(main())

import asyncio
import sys
import os
from unittest.mock import MagicMock, patch
import json

# Add the project root to the python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.services.valuation_service import valuation_service

async def main():
    metrics = {
        "revenue": 500000,
        "revenue_trend": "growing",
        "industry": "SaaS",
        "description": "A B2B SaaS platform for project management."
    }
    
    print(f"Testing valuation with metrics: {metrics}")
    
    # Mock the model
    mock_model = MagicMock()
    mock_response = MagicMock()
    mock_response.text = json.dumps({
        "valuation_range": {"min": 1500000, "max": 2500000},
        "confidence": 0.85
    })
    mock_model.generate_content.return_value = mock_response
    
    # Patch the service's model
    valuation_service.model = mock_model
    
    try:
        result = await valuation_service.generate_valuation(metrics)
        print("Valuation Result:")
        print(result)
        
        # Verify the prompt was constructed correctly with the new logic
        args, _ = mock_model.generate_content.call_args
        prompt_sent = args[0]
        print("\nPrompt Sent (Partial):")
        print(prompt_sent[:200] + "...")
        
        if "The revenue trend is described as: growing" in prompt_sent:
             print("\nSUCCESS: Prompt contains revenue trend description.")
        else:
             print("\nFAILURE: Prompt missing revenue trend description.")

        if 'valuation_range' in result and 'confidence' in result:
            print("SUCCESS: Result contains expected fields.")
        else:
            print("FAILURE: Result missing expected fields.")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())

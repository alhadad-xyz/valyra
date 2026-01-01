import pytest
from unittest.mock import MagicMock, patch, AsyncMock
import sys
import os

# Add apps/backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Mock config before importing app modules that use it
with patch("app.core.config.settings") as mock_settings:
    mock_settings.openai_api_key = "fake_key"
    mock_settings.cdp_api_key_name = "fake_name"
    mock_settings.cdp_api_key_private_key = "fake_key"
    
    from app.services.agent_service import AgentService

@pytest.mark.asyncio
async def test_agent_valuation_signing():
    # Setup Mocks
    mock_wallet = MagicMock()
    mock_wallet.sign_message.return_value = "0xValidSignature"
    
    mock_valuation_service = MagicMock()
    # Fix: Use AsyncMock or make return_value awaitable
    mock_valuation_service.generate_valuation = AsyncMock(return_value={
        "valuation_range": {"min": 100, "max": 200},
        "confidence": 0.9
    })

    # Patch dependencies
    with patch("app.services.agent_service.get_wallet_provider", return_value=mock_wallet), \
         patch("app.services.agent_service.valuation_service", mock_valuation_service):
        
        service = AgentService()
        
        # Test Data
        metrics = {"revenue": 50, "description": "Test Project"}
        
        # Execute
        result = await service.process_valuation(metrics)
        
        # Verify
        assert result["signature"] == "0xValidSignature"
        assert result["valuation_range"]["max"] == 200
        
        # Verify sign_message was called with expected content
        expected_msg_part = "Revenue: 50"
        mock_wallet.sign_message.assert_called_once()
        call_args = mock_wallet.sign_message.call_args[0][0]
        assert expected_msg_part in call_args
        assert "Valyra Agent Attestation" in call_args

@pytest.mark.asyncio
async def test_agent_signing_exception():
    # Test case where signing throws an exception
    mock_wallet = MagicMock()
    mock_wallet.sign_message.side_effect = Exception("Signing Error")

    mock_valuation_service = MagicMock()
    mock_valuation_service.generate_valuation = AsyncMock(return_value={
        "valuation_range": {"min": 100, "max": 200},
        "confidence": 0.9
    })

    with patch("app.services.agent_service.get_wallet_provider", return_value=mock_wallet), \
         patch("app.services.agent_service.valuation_service", mock_valuation_service):
        
        service = AgentService()
        result = await service.process_valuation({"revenue": 50})
        
        assert result["signature"] == "signature_error"
        assert "Signing failed: Signing Error" in result["warnings"][0]

@pytest.mark.asyncio
async def test_agent_signing_missing_method():
    # Test case where wallet provider lacks sign_message method
    mock_wallet = MagicMock()
    del mock_wallet.sign_message # Remove the method

    mock_valuation_service = MagicMock()
    mock_valuation_service.generate_valuation = AsyncMock(return_value={
        "valuation_range": {"min": 100, "max": 200},
        "confidence": 0.9
    })

    with patch("app.services.agent_service.get_wallet_provider", return_value=mock_wallet), \
         patch("app.services.agent_service.valuation_service", mock_valuation_service):
        
        service = AgentService()
        result = await service.process_valuation({"revenue": 50})
        
        assert result["signature"] == "signature_failed"
        assert "Wallet provider does not natively support 'sign_message'" in result["warnings"][0]

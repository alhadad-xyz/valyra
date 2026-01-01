from typing import Dict, Any, List
from app.services.valuation_service import valuation_service
from app.agent.config import get_wallet_provider

class AgentService:
    def __init__(self):
        self._wallet_provider = None

    @property
    def wallet_provider(self):
        if not self._wallet_provider:
             self._wallet_provider = get_wallet_provider()
        return self._wallet_provider

    async def process_valuation(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a valuation, applies guardrails, and signs the result.
        """
        # 1. Generate Valuation
        valuation_data = await valuation_service.generate_valuation(metrics)
        
        # 2. Apply Guardrails
        revenue = metrics.get("revenue", 0)
        max_allowed_valuation = revenue * 10
        
        warnings = []
        original_max = valuation_data["valuation_range"]["max"]
        
        if original_max > max_allowed_valuation:
            valuation_data["valuation_range"]["max"] = max_allowed_valuation
            # Adjust min if it exceeds new max (unlikely but possible)
            if valuation_data["valuation_range"]["min"] > max_allowed_valuation:
                valuation_data["valuation_range"]["min"] = max_allowed_valuation * 0.8 # heuristic fallback
            
            warnings.append(f"Valuation capped at 10x Revenue ({max_allowed_valuation}). Original max was {original_max}.")

        # 3. Create Attestation Message
        min_val = valuation_data["valuation_range"]["min"]
        max_val = valuation_data["valuation_range"]["max"]
        project_desc = metrics.get('description', 'Unknown Project')[:50] # truncated
        
        attestation_message = (
            f"Valyra Agent Attestation:\n"
            f"Project: {project_desc}...\n"
            f"Revenue: {revenue}\n"
            f"Valuation Range: {min_val} - {max_val} USD\n"
            f"Confidence: {valuation_data.get('confidence', 0.0)}"
        )
        
        # 4. Sign Message
        # The wallet provider has a `sign_message` method (standard in CDP/Web3 providers)
        # We need to verify the exact method name on CdpWalletProvider
        # From Coinbase AgentKit docs, it might be `sign_message(message)`
        
        signature = ""
        try:
             # Use the wallet provider to sign the message
             wallet = self.wallet_provider
             
             # Check if wallet provider is initialized
             if not wallet:
                 raise ValueError("Wallet provider not initialized")

             # Attempt to sign the message
             # Note: exact method depends on CdpWalletProvider version, assuming sign_message or similar
             if hasattr(wallet, "sign_message"):
                 signature = wallet.sign_message(attestation_message)
                 # If the result is an object, try to extract signature string
                 if hasattr(signature, "signature"):
                     signature = signature.signature
             else:
                 # If specific method not found, try to use the agent logic or throw
                 warnings.append("Wallet provider does not natively support 'sign_message'.")
                 signature = "signature_failed"

        except Exception as e:
            print(f"Signing failed: {e}")
            warnings.append(f"Signing failed: {str(e)}")
            signature = "signature_error"

        return {
            "valuation_range": valuation_data["valuation_range"],
            "confidence": valuation_data.get("confidence", 0.0),
            "signature": signature,
            "attestation_message": attestation_message,
            "warnings": warnings
        }

agent_service = AgentService()

from fastapi import Header, HTTPException, status
from eth_account import Account
from eth_account.messages import encode_defunct
import time
import logging

logger = logging.getLogger(__name__)

# Constants
TIMESTAMP_TOLERANCE_SECONDS = 300  # 5 minutes

async def verify_signature(
    x_wallet_address: str = Header(..., alias="X-Wallet-Address"),
    x_signature: str = Header(..., alias="X-Signature"),
    x_timestamp: str = Header(..., alias="X-Timestamp"),
):
    """
    Verifies the wallet signature of the request.
    
    The expected message format is: "Login to Valyra at {timestamp}"
    
    Args:
        x_wallet_address (str): The claiming wallet address.
        x_signature (str): The signature of the message.
        x_timestamp (str): The timestamp used in the message.
        
    Raises:
        HTTPException: If verification fails or timestamp is invalid.
        
    Returns:
        str: The verified wallet address (lowercase).
    """
    try:
        # 1. Validate Timestamp
        try:
            timestamp = int(x_timestamp)
        except ValueError:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid timestamp format"
            )
            
        current_time = int(time.time())
        if abs(current_time - timestamp) > TIMESTAMP_TOLERANCE_SECONDS:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Timestamp expired or invalid"
            )

        # 2. Reconstruct Message
        message_text = f"Login to Valyra at {x_timestamp}"
        encoded_message = encode_defunct(text=message_text)

        # 3. Recover Address
        recovered_address = Account.recover_message(encoded_message, signature=x_signature)
        
        # 4. Compare Addresses
        if recovered_address.lower() != x_wallet_address.lower():
            logger.warning(f"Signature verification failed. Claimed: {x_wallet_address}, Recovered: {recovered_address}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid signature"
            )
            
        return recovered_address.lower()

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signature verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Signature verification failed"
        )

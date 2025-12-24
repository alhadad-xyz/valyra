
import pytest
from fastapi import FastAPI, Depends, status
from fastapi.testclient import TestClient
from app.middleware.signature import verify_signature
from eth_account import Account
from eth_account.messages import encode_defunct
import time

# Create a dedicated app for testing the middleware to avoid side effects
test_app = FastAPI()

@test_app.get("/protected")
async def protected_route(address: str = Depends(verify_signature)):
    return {"status": "success", "address": address}

client = TestClient(test_app)

def test_verify_signature_success():
    # 1. Setup Wallet
    acct = Account.create()
    wallet_address = acct.address
    timestamp = str(int(time.time()))
    
    # 2. Sign Message
    message_text = f"Login to Valyra at {timestamp}"
    encoded_msg = encode_defunct(text=message_text)
    signature = acct.sign_message(encoded_msg).signature.hex()
    
    # 3. Request
    headers = {
        "X-Wallet-Address": wallet_address,
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    response = client.get("/protected", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"status": "success", "address": wallet_address.lower()}

def test_verify_signature_invalid_signature():
    # 1. Setup Wallet
    acct = Account.create()
    wallet_address = acct.address
    timestamp = str(int(time.time()))
    
    # 2. Sign Message (But sign something else)
    message_text = f"Login to Valyra at {timestamp} WRONG"
    encoded_msg = encode_defunct(text=message_text)
    signature = acct.sign_message(encoded_msg).signature.hex()
    
    # 3. Request
    headers = {
        "X-Wallet-Address": wallet_address,
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    response = client.get("/protected", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid signature"

def test_verify_signature_mismatched_address():
    # 1. Setup Wallets
    acct1 = Account.create() # Signer
    acct2 = Account.create() # Claimer
    timestamp = str(int(time.time()))
    
    # 2. Sign Message with Acct1
    message_text = f"Login to Valyra at {timestamp}"
    encoded_msg = encode_defunct(text=message_text)
    signature = acct1.sign_message(encoded_msg).signature.hex()
    
    # 3. Request (Claiming to be Acct2)
    headers = {
        "X-Wallet-Address": acct2.address, # Mismatch
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    response = client.get("/protected", headers=headers)
    assert response.status_code == 401
    assert "verification failed" in response.json()["detail"].lower() or "invalid signature" in response.json()["detail"].lower()

def test_verify_signature_stale_timestamp():
    # 1. Setup Wallet
    acct = Account.create()
    wallet_address = acct.address
    # Old timestamp (10 mins ago)
    timestamp = str(int(time.time()) - 600)
    
    # 2. Sign Message
    message_text = f"Login to Valyra at {timestamp}"
    encoded_msg = encode_defunct(text=message_text)
    signature = acct.sign_message(encoded_msg).signature.hex()
    
    # 3. Request
    headers = {
        "X-Wallet-Address": wallet_address,
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    response = client.get("/protected", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Timestamp expired or invalid"

def test_verify_signature_future_timestamp():
    # 1. Setup Wallet
    acct = Account.create()
    wallet_address = acct.address
    # Future timestamp (10 mins future)
    timestamp = str(int(time.time()) + 600)
    
    # 2. Sign Message
    message_text = f"Login to Valyra at {timestamp}"
    encoded_msg = encode_defunct(text=message_text)
    signature = acct.sign_message(encoded_msg).signature.hex()
    
    # 3. Request
    headers = {
        "X-Wallet-Address": wallet_address,
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    response = client.get("/protected", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Timestamp expired or invalid"

def test_missing_headers():
    response = client.get("/protected")
    assert response.status_code == 422 # Validation error for missing headers


import asyncio
import time
import random
import secrets
import sys
import os
from decimal import Decimal
import httpx
from eth_account import Account
from eth_account.messages import encode_defunct
from sqlalchemy.orm import Session

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.user import User
from app.models.credential import UserCredential # Needed for relationship mapping

# Constants
API_URL = "http://localhost:8000/api/v1"
NUM_LISTINGS = 20

# Test Data
CATEGORIES = ["saas", "ecommerce", "content", "community", "other"]
TRENDS = ["growing", "stable", "declining"]
TECH_STACKS = [
    {"frontend": "React", "backend": "Python"},
    {"frontend": "Vue", "backend": "Node.js"},
    {"frontend": "Flutter", "backend": "Firebase"},
    {"frontend": "Next.js", "backend": "Go"},
    {"cms": "WordPress", "language": "PHP"}
]

async def wait_for_backend():
    print("Waiting for backend to be ready...")
    async with httpx.AsyncClient() as client:
        for _ in range(30):
            try:
                response = await client.get(f"{API_URL}/health")
                if response.status_code == 200:
                    print("Backend is ready!")
                    return
            except httpx.RequestError:
                pass
            await asyncio.sleep(1)
    print("Backend failed to start.")
    exit(1)

def ensure_test_user(wallet_address: str):
    print(f"Ensuring user exists for wallet: {wallet_address}")
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.wallet_address == wallet_address).first()
        if not user:
            print("Creating new test user in DB...")
            user = User(
                wallet_address=wallet_address,
                basename="TestUser",
                email="test@example.com"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"User created with ID: {user.id}")
        else:
            print("User already exists.")
        return user
    except Exception as e:
        print(f"Database error: {e}")
        exit(1)
    finally:
        db.close()

def generate_listing_data():
    category = random.choice(CATEGORIES)
    stack = random.choice(TECH_STACKS)
    price = random.randint(1_000_000, 100_000_000)
    
    return {
        "asset_name": f"Test {category.title()} Asset {secrets.token_hex(2)}",
        "asset_type": category,
        "business_url": f"https://example-{secrets.token_hex(4)}.com",
        "description": f"A great {category} business with high potential.",
        "asking_price": price,
        "tech_stack": stack,
        "mrr": int(price * 0.1),
        "annual_revenue": int(price * 1.2),
        "monthly_profit": int(price * 0.05),
        "monthly_expenses": int(price * 0.05),
        "revenue_trend": random.choice(TRENDS),
        "domain_included": True,
        "source_code_included": True,
        "customer_data_included": random.choice([True, False]),
    }

async def create_listing(client, wallet):
    data = generate_listing_data()
    
    # Sign request
    timestamp = str(int(time.time()))
    message = encode_defunct(text=f"Login to Valyra at {timestamp}")
    signature = wallet.sign_message(message).signature.hex()
    
    headers = {
        "X-Wallet-Address": wallet.address,
        "X-Signature": signature,
        "X-Timestamp": timestamp
    }
    
    try:
        response = await client.post(
            f"{API_URL}/listings/",
            json=data,
            headers=headers
        )
        if response.status_code == 201:
            print(f"Created listing: {data['asset_name']}")
        else:
            print(f"Failed to create listing: {response.text}")
    except Exception as e:
        print(f"Error creating listing: {repr(e)}")
        import traceback
        traceback.print_exc()

async def main():
    await wait_for_backend()
    
    # Generate a random wallet for testing
    wallet = Account.create()
    print(f"Using test wallet: {wallet.address}")
    
    # Ensure user exists in DB directly
    ensure_test_user(wallet.address.lower())
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print(f"Creating {NUM_LISTINGS} listings sequentially...")
        for i in range(NUM_LISTINGS):
            await create_listing(client, wallet)
            await asyncio.sleep(0.5)

if __name__ == "__main__":
    asyncio.run(main())

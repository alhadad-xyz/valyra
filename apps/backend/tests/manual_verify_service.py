import asyncio
import sys
import os

# Create a mock for httpx and bs4 logic since we can't easily run the full app
from app.services.identity_verification import IdentityVerificationService

# Mocks
mock_github_response = {
    "created_at": "2020-01-01T00:00:00Z", # ~4 years old -> 30 points
    "public_repos": 10, # 10 points
    "followers": 5 # 5 points
    # Total activity: 15
    # Total age: 30
    # Total so far: 45
}

mock_linkedin_valid_500 = {
    "valid_scrape": True,
    "connections_count": 500 # 30 points
    # Total: 75
}

service = IdentityVerificationService()

def test_calculation():
    print("Testing calculation logic...")
    score, details = service.calculate_trust_score(mock_github_response, mock_linkedin_valid_500)
    print(f"Score: {score}")
    print(f"Details: {details}")
    
    expected_score = 30 + 10 + 5 + 30 # 75
    if score == expected_score:
        print("✅ Score calculation matches expected 75!")
    else:
        print(f"❌ Score mismatch. Expected {expected_score}, got {score}")

if __name__ == "__main__":
    # Add project root to path
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
    test_calculation()

import pytest
from app.main import app
from app.models.user import User, VerificationLevel
from app.dependencies import get_current_user
from uuid import uuid4

@pytest.fixture
def mock_user(db):
    user = User(
        wallet_address="0x1234567890abcdef1234567890abcdef12345678",
        reputation_score=50,
        verification_level=VerificationLevel.BASIC, 
        basename="original_name",
        email="original@example.com"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def test_get_my_profile(client, db, mock_user):
    # Authenticated request
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    response = client.get("/api/v1/users/me")
    assert response.status_code == 200
    data = response.json()
    assert data["wallet_address"] == mock_user.wallet_address
    assert data["basename"] == "original_name"
    assert data["reputation_score"] == 50
    
    app.dependency_overrides.clear()

def test_get_my_profile_unauthorized(client):
    # Unauthenticated request
    response = client.get("/api/v1/users/me")
    assert response.status_code == 422 # Missing headers results in 422

def test_update_my_profile_success(client, db, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    payload = {
        "basename": "new_name",
        "email": "new@example.com"
    }
    
    response = client.patch("/api/v1/users/me", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["basename"] == "new_name"
    assert data["email"] == "new@example.com"
    
    # Verify DB update
    db.refresh(mock_user)
    assert mock_user.basename == "new_name"
    assert mock_user.email == "new@example.com"
    
    app.dependency_overrides.clear()

def test_update_my_profile_partial(client, db, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Update only basename
    payload = {"basename": "only_name_change"}
    response = client.patch("/api/v1/users/me", json=payload)
    assert response.status_code == 200
    assert response.json()["basename"] == "only_name_change"
    assert response.json()["email"] == "original@example.com" # Should remain unchanged
    
    app.dependency_overrides.clear()

def test_update_my_profile_restricted_fields(client, db, mock_user):
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # Attempt to update restricted fields
    payload = {
        "basename": "valid_update",
        "reputation_score": 9000,
        "verification_level": "enhanced"
    }
    
    response = client.patch("/api/v1/users/me", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # Allowed field updated
    assert data["basename"] == "valid_update"
    
    # Restricted fields ignored
    db.refresh(mock_user)
    assert mock_user.reputation_score == 50
    assert mock_user.verification_level == VerificationLevel.BASIC
    
    app.dependency_overrides.clear()

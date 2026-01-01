"""Authentication routes for OAuth providers and Passkeys."""
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Body
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.services.auth_service import google_auth
from app.services.passkey_service import passkey_service
from app.models.user import User
from app.models.credential import UserCredential
import logging
import shortuuid
from webauthn.helpers import bytes_to_base64url, base64url_to_bytes

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)

# --- Passkey (WebAuthn) Flow ---

@router.post("/passkey/register/options")
async def register_options(
    user_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Generate WebAuthn registration options."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        options = passkey_service.generate_registration_options(user)
        # Store challenge temporarily in user record (simplified state management)
        user.challenge = bytes_to_base64url(options.challenge)
        db.commit()
        # Convert to JSON-serializable format
        from webauthn.helpers import options_to_json
        import json
        return json.loads(options_to_json(options))
    except Exception as e:
        logger.error(f"Passkey Register Options Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/passkey/register/verify")
async def register_verify(
    user_id: str = Body(...),
    response: dict = Body(...),
    db: Session = Depends(get_db)
):
    """Verify WebAuthn registration response."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.challenge:
        raise HTTPException(status_code=400, detail="Challenge not found")

    try:
        verification = passkey_service.verify_registration_response(
            user, response, user.challenge
        )
        
        # Save credential
        new_credential = UserCredential(
            credential_id=bytes_to_base64url(verification.credential_id),
            user_id=user.id,
            public_key=verification.credential_public_key,
            sign_count=verification.sign_count,
            transports="" # Optional: populate from response if available
        )
        db.add(new_credential)
        user.challenge = None # Clear challenge
        db.commit()
        
        return {"status": "success", "verified": True}
        
    except Exception as e:
        logger.error(f"Passkey Register Verify Error: {e}")
        raise HTTPException(status_code=400, detail=f"Verification failed: {str(e)}")


@router.post("/passkey/login/options")
async def login_options(
    user_id: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """Generate WebAuthn authentication options."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    try:
        options = passkey_service.generate_authentication_options(user)
        user.challenge = bytes_to_base64url(options.challenge)
        db.commit()
        # Convert to JSON-serializable format
        from webauthn.helpers import options_to_json
        import json
        try:
            options_json_str = options_to_json(options)
            return json.loads(options_json_str)
        except Exception as json_error:
            logger.error(f"JSON serialization error: {json_error}, options type: {type(options)}")
            raise
    except Exception as e:
        logger.error(f"Passkey Login Options Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/passkey/login/verify")
async def login_verify(
    user_id: str = Body(...),
    response_data: dict = Body(..., alias="response"),
    db: Session = Depends(get_db)
):
    """Verify WebAuthn authentication response."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if not user.challenge:
        raise HTTPException(status_code=400, detail="Challenge not found")
        
    # Find credential used
    credential_id = response_data.get("id")
    credential = db.query(UserCredential).filter(UserCredential.credential_id == credential_id).first()
    if not credential:
        raise HTTPException(status_code=400, detail="Credential not found")

    try:
        verification = passkey_service.verify_authentication_response(
            user, response_data, user.challenge, credential
        )
        
        # Update sign count
        credential.sign_count = verification.new_sign_count
        user.challenge = None
        db.commit()
        
        return {"status": "success", "verified": True}
        
    except Exception as e:
        logger.error(f"Passkey Login Verify Error: {e}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


# --- Google OAuth Flow (Preserved) ---

@router.get("/google/login")
async def login_google(
    user_id: str = Query(..., description="Internal User ID to link"),
    db: Session = Depends(get_db)
):
    """Initiate Google OAuth flow."""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate state
    state = str(user.id)
    url = google_auth.get_auth_url(state=state)
    return {"url": url}


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth callback."""
    try:
        user_id = state
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Exchange code for access token
        access_token = await google_auth.exchange_code(code)
        if not access_token:
             raise HTTPException(status_code=400, detail="Failed to retrieve access token")
             
        # Use token to get User ID immediately
        google_id = await google_auth.get_user_info(access_token)
        
        # Zero-storage: Save only google_id, discard token
        user.google_id = google_id
        db.commit()
        
        return {
            "status": "success",
            "message": "Google account linked",
            "google_id": google_id
        }

    except ValueError as e:
        logger.error(f"Google Auth Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Google Callback Failed: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

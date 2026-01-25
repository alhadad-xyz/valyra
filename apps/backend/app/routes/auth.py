"""Authentication routes for OAuth providers and Passkeys."""
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Body
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.services.auth_service import google_auth, stripe_auth

from app.models.user import User

import logging
import shortuuid

from app.core.config import settings
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = logging.getLogger(__name__)


# --- Google OAuth Flow (Preserved) ---

@router.get("/google/login")
async def login_google(
    user_id: str = Query(..., description="Internal User ID or Wallet Address to link"),
    db: Session = Depends(get_db)
):
    """Initiate Google OAuth flow."""
    # Verify user exists
    if user_id.startswith("0x"):
        user = db.query(User).filter(User.wallet_address == user_id.lower()).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate state
    state = str(user.id)
    url = google_auth.get_auth_url(state=state)
    # If the request came from frontend (e.g. via a button click that navigates), 
    # we might want to return a redirect response directly, but for now returning JSON {url} 
    # allows the frontend to control the redirection.
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
        
        # Redirect back to frontend
        return RedirectResponse(f"{settings.frontend_url}/app/settings?google_linked=success")

    except ValueError as e:
        logger.error(f"Google Auth Error: {e}")
        return RedirectResponse(f"{settings.frontend_url}/app/settings?google_linked=error&error={str(e)}")
    except Exception as e:
        logger.error(f"Google Callback Failed: {e}")
        return RedirectResponse(f"{settings.frontend_url}/app/settings?google_linked=error&error=server_error")


# --- Stripe OAuth Flow ---

@router.get("/stripe/login")
async def login_stripe(
    user_id: str = Query(..., description="Internal User ID or Wallet Address to link"),
    db: Session = Depends(get_db)
):
    """Initiate Stripe Connect OAuth flow."""
    # Verify user exists
    if user_id.startswith("0x"):
        user = db.query(User).filter(User.wallet_address == user_id.lower()).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate state (using user_id for simplicity, similar to Google flow)
    state = str(user.id)
    try:
        url = stripe_auth.get_auth_url(state=state)
        return {"url": url}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stripe/callback")
async def stripe_callback(
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """Handle Stripe OAuth callback."""
    try:
        user_id = state
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Exchange code for Stripe Account ID
        stripe_account_id = await stripe_auth.exchange_code(code)
        if not stripe_account_id:
             raise HTTPException(status_code=400, detail="Failed to retrieve Stripe account ID")
             
        # Zero-storage: Save only stripe_account_id, discard token
        user.stripe_account_id = stripe_account_id
        db.commit()
        
        return RedirectResponse(f"{settings.frontend_url}/app/settings?stripe_linked=success")

    except ValueError as e:
        logger.error(f"Stripe Auth Error: {e}")
        return RedirectResponse(f"{settings.frontend_url}/app/settings?stripe_linked=error&error={str(e)}")
    except Exception as e:
        logger.error(f"Stripe Callback Failed: {e}")
        return RedirectResponse(f"{settings.frontend_url}/app/settings?stripe_linked=error&error={str(e)}")


@router.post("/disconnect")
async def disconnect_provider(
    provider: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect an OAuth provider."""
    if provider == "google":
        current_user.google_id = None
    elif provider == "stripe":
        current_user.stripe_account_id = None
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")
    
    db.commit()
    return {"status": "success", "message": f"{provider} disconnected"}


"""Authentication Service for OAuth providers (Stripe, Google)."""
import httpx
from typing import Optional, Dict, Any
from app.core.config import settings




class GoogleAuthService:
    """Service for Google OAuth flow."""

    @staticmethod
    def get_auth_url(state: str) -> str:
        """Generate Google OAuth URL."""
        if not settings.google_client_id:
            raise ValueError("Google Client ID not configured")

        params = {
            "client_id": settings.google_client_id,
            "response_type": "code",
            "scope": "openid email profile",
            "redirect_uri": settings.google_redirect_uri,
            "state": state,
            "access_type": "online"
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"

    @staticmethod
    async def exchange_code(code: str) -> str:
        """Exchange code for access token."""
        if not settings.google_client_secret:
             raise ValueError("Google Client Secret not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret.get_secret_value(),
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.google_redirect_uri
                }
            )
            response.raise_for_status()
            return response.json().get("access_token")

    @staticmethod
    async def get_user_info(access_token: str) -> str:
        """Get Google User ID using access token."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            user_info = response.json()
            return user_info.get("id")


class StripeAuthService:
    """Service for Stripe Connect OAuth flow."""

    @staticmethod
    def get_auth_url(state: str) -> str:
        """Generate Stripe OAuth URL."""
        if not settings.stripe_client_id:
            raise ValueError("Stripe Client ID not configured")

        params = {
            "response_type": "code",
            "client_id": settings.stripe_client_id,
            "scope": "read_write",
            "redirect_uri": settings.stripe_redirect_uri,
            "state": state,
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://connect.stripe.com/oauth/authorize?{query_string}"

    @staticmethod
    async def exchange_code(code: str) -> str:
        """Exchange code for Stripe Account ID."""
        if not settings.stripe_api_key:
             raise ValueError("Stripe API Key not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://connect.stripe.com/oauth/token",
                data={
                    "client_secret": settings.stripe_api_key,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": settings.stripe_redirect_uri,
                }
            )
            
            if response.is_error:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Stripe Token Error: {response.text}")
                try:
                    error_data = response.json()
                    error_desc = error_data.get("error_description") or error_data.get("error") or response.text
                except Exception:
                    error_desc = response.text
                raise ValueError(f"Stripe Error: {error_desc}")

            response.raise_for_status()
            # Response contains 'stripe_user_id' which is the connected account ID (e.g. acct_12345)
            # Response also contains 'access_token', but we discard it (Zero-storage)
            return response.json().get("stripe_user_id")

# Global instances
google_auth = GoogleAuthService()
stripe_auth = StripeAuthService()

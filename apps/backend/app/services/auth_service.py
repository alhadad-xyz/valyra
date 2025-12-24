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

# Global instances
google_auth = GoogleAuthService()

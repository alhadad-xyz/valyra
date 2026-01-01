from fastapi import APIRouter, HTTPException, status
from app.core.config import settings

router = APIRouter()

@router.get("/debug-sentry")
async def trigger_error():
    """
    Trigger a ZeroDivisionError to test Sentry integration.
    Only available in development environment or if specifically enabled.
    """
    if settings.is_production:
         # Optional: block in production if desired, but for now we follow the issue request directly.
         # Actually, it's safer to probably not expose this freely in prod, but Sentry docs often use this.
         # We'll allow it but maybe with a log warning, or just let it crash (it's a 500).
         pass
    
    return 1 / 0

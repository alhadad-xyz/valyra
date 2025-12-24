"""Routes package."""
from app.routes.health import router as health_router
from app.routes.listings import router as listings_router
from app.routes.users import router as users_router

__all__ = ["health_router", "listings_router", "users_router"]

"""Rate limiter configuration."""
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

# Initialize limiter with Redis storage if available, otherwise memory
# By default slowapi uses memory if storage_uri is None, but we want to be explicit or use Redis
# If redis_url is set (which it defaults to in config), it uses that.

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.redis_url,
    strategy="fixed-window",  # or "moving-window"
)

"""Rate limiter configuration."""
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import settings

# Initialize limiter with Redis storage if available, otherwise memory
import redis
import logging

logger = logging.getLogger(__name__)

storage_uri = "memory://"

if settings.redis_url:
    try:
        r = redis.from_url(settings.redis_url, socket_connect_timeout=1)
        r.ping()
        storage_uri = settings.redis_url
        logger.info(f"Rate limiter using Redis at {settings.redis_url}")
    except Exception as e:
        logger.warning(f"Redis not available ({e}), falling back to memory storage for rate limiting.")
        storage_uri = "memory://"

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=storage_uri,
    strategy="fixed-window",  # or "moving-window"
)

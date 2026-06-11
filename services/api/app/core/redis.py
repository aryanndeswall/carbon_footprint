import redis
from app.core.config import settings

# Create a connection pool for Redis
pool = redis.ConnectionPool.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    max_connections=20
)

def get_redis_client() -> redis.Redis:
    """
    Returns a Redis client instance from the shared connection pool.
    """
    return redis.Redis(connection_pool=pool)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
import httpx
import jwt
from jwt import PyJWKClient
from app.core.config import settings
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# Cache JWKS locally to avoid repeated network calls
_jwks_cache = None

def get_jwks():
    global _jwks_cache
    if _jwks_cache is not None:
        return _jwks_cache
    if not settings.SUPABASE_URL or "your-project" in settings.SUPABASE_URL:
        return None
    try:
        url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/jwks"
        response = httpx.get(url, timeout=5.0)
        if response.status_code == 200:
            _jwks_cache = response.json()
            return _jwks_cache
    except Exception as e:
        logger.warning(f"Failed to fetch JWKS: {str(e)}")
    return None

def verify_supabase_jwt(token: str) -> dict:
    # 1. Try JWKS first (for production)
    try:
        jwks = get_jwks()
        if jwks:
            jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/jwks"
            jwk_client = PyJWKClient(jwks_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience="authenticated"
            )
            return payload
    except Exception as e:
        if isinstance(e, (jwt.ExpiredSignatureError, jwt.InvalidTokenError)):
            raise e
        # Connection/Resolving issues fallback to local validation (dev/testing)
        pass

    # 2. Local secret verification (HS256) (for tests and local dev mock auth)
    secret = getattr(settings, "SUPABASE_JWT_SECRET", None)
    if secret and secret != "your-supabase-jwt-secret-placeholder":
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    else:
        # Development mode signature-less decoding with expiration check
        payload = jwt.decode(
            token,
            options={"verify_signature": False},
            audience="authenticated"
        )
        exp = payload.get("exp")
        if exp:
            now = datetime.now(timezone.utc).timestamp()
            if now > exp:
                raise jwt.ExpiredSignatureError("Token has expired")
        return payload

class JWTAuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate Supabase JWT tokens. Attach identity to request.state.
    """
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # Allow health check, docs, and schema definitions without token validation
        if path in ["/health", "/docs", "/openapi.json", "/redoc"] or path.startswith("/static"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Missing Authorization header"
                    }
                }
            )

        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid Authorization header format. Must be Bearer <token>"
                    }
                }
            )

        token = auth_header.split(" ")[1]
        try:
            payload = verify_supabase_jwt(token)
            auth_user_id_str = payload.get("sub")
            if not auth_user_id_str:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={
                        "success": False,
                        "error": {
                            "code": "UNAUTHORIZED",
                            "message": "Invalid token payload: missing sub claim"
                        }
                    }
                )

            # Store the sub (auth_user_id) and email in the request state
            request.state.user_id = auth_user_id_str
            request.state.user_email = payload.get("email")
        except jwt.ExpiredSignatureError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Token has expired"
                    }
                }
            )
        except jwt.InvalidTokenError as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": f"Invalid token: {str(e)}"
                    }
                }
            )
        except Exception as e:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": f"Token verification failed: {str(e)}"
                    }
                }
            )

        return await call_next(request)

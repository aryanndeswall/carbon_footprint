import pytest
import jwt
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import text
from app.main import app
from app.database.session import SessionLocal
from app.core.config import settings

# Force the JWT secret to test-secret during tests
settings.SUPABASE_JWT_SECRET = "test-secret"

@pytest.fixture(scope="session", autouse=True)
def seed_test_database():
    """
    Seeds emission factors once before the test session starts.
    """
    import sys
    import os
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/carbon-core")))
    from app.services.seed import seed_emission_factors
    session = SessionLocal()
    try:
        session.execute(text("TRUNCATE TABLE emission_factors CASCADE;"))
        session.commit()
        seed_emission_factors(session)
    finally:
        session.close()

@pytest.fixture(scope="function", autouse=True)
def clean_database():
    """
    Truncates user-specific tables before each test to ensure a clean database state
    while preserving seeded emission factors.
    """
    session = SessionLocal()
    try:
        session.execute(text("TRUNCATE TABLE users CASCADE;"))
        session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

@pytest.fixture(scope="function")
def db():
    """
    Provides an independent database session for the test.
    """
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(scope="module")
def client():
    """
    Fixture that provides a FastAPI TestClient configured for the app.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture
def create_jwt():
    """
    Fixture that returns a function to generate mock JWT tokens for testing.
    """
    def _create_jwt(
        sub: str = "550e8400-e29b-41d4-a716-446655440000",
        email: str = "testuser@example.com",
        exp_delta: timedelta = timedelta(hours=1),
        audience: str = "authenticated",
        secret: str = "test-secret",
        algorithm: str = "HS256"
    ) -> str:
        payload = {
            "sub": sub,
            "email": email,
            "exp": datetime.now(timezone.utc) + exp_delta,
            "aud": audience
        }
        return jwt.encode(payload, secret, algorithm=algorithm)
    return _create_jwt

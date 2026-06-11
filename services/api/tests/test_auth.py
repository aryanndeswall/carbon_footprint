from fastapi.testclient import TestClient
from datetime import timedelta

def test_missing_jwt(client: TestClient):
    """
    Verifies that requests without an Authorization header are rejected with 401.
    """
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert response.json()["error"]["message"] == "Missing Authorization header"

def test_invalid_jwt_format(client: TestClient):
    """
    Verifies that requests with an invalid Authorization header format are rejected with 401.
    """
    response = client.get("/api/v1/users/me", headers={"Authorization": "InvalidToken"})
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert "Invalid Authorization header format" in response.json()["error"]["message"]

def test_invalid_jwt_signature(client: TestClient, create_jwt):
    """
    Verifies that requests with an invalid JWT signature are rejected with 401.
    """
    token = create_jwt(secret="wrong-secret")
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert "Invalid token" in response.json()["error"]["message"]

def test_expired_jwt(client: TestClient, create_jwt):
    """
    Verifies that requests with an expired JWT are rejected with 401.
    """
    token = create_jwt(exp_delta=timedelta(seconds=-10))
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert response.json()["success"] is False
    assert "Token has expired" in response.json()["error"]["message"]

def test_valid_jwt(client: TestClient, create_jwt):
    """
    Verifies that requests with a valid JWT succeed and load/create profile.
    """
    token = create_jwt()
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "data" in response.json()
    assert response.json()["data"]["email"] == "testuser@example.com"

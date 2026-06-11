from fastapi.testclient import TestClient
import uuid

def test_get_current_user_profile(client: TestClient, create_jwt):
    """
    Test GET /api/v1/users/me (returning profile data).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # First request: should create profile and default preferences (First Login Flow)
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["email"] == "alice@example.com"
    assert data["auth_user_id"] == user_id
    assert data["full_name"] is None

    # Second request: should load existing profile (Returning User Flow)
    response2 = client.get("/api/v1/users/me", headers=headers)
    assert response2.status_code == 200
    assert response2.json()["data"]["id"] == data["id"]

def test_patch_user_profile(client: TestClient, create_jwt):
    """
    Test PATCH /api/v1/users/me (updating profile fields).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="bob@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Initialize user
    client.get("/api/v1/users/me", headers=headers)
    
    # Update profile
    payload = {"full_name": "Bob Smith", "avatar_url": "https://example.com/bob.png"}
    response = client.patch("/api/v1/users/me", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["full_name"] == "Bob Smith"
    assert data["avatar_url"] == "https://example.com/bob.png"

def test_get_user_preferences(client: TestClient, create_jwt):
    """
    Test GET /api/v1/users/preferences (getting preferences).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="charlie@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create profile/preferences
    client.get("/api/v1/users/me", headers=headers)
    
    response = client.get("/api/v1/users/preferences", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["notification_enabled"] is True
    assert data["diet_type"] is None

def test_patch_user_preferences(client: TestClient, create_jwt):
    """
    Test PATCH /api/v1/users/preferences (updating preferences).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="dave@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create profile/preferences
    client.get("/api/v1/users/me", headers=headers)
    
    # Update preferences
    payload = {
        "state_code": "MH",
        "diet_type": "vegan",
        "transport_preference": "train",
        "housing_type": "apartment",
        "notification_enabled": False
    }
    response = client.patch("/api/v1/users/preferences", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["state_code"] == "MH"
    assert data["diet_type"] == "vegan"
    assert data["transport_preference"] == "train"
    assert data["housing_type"] == "apartment"
    assert data["notification_enabled"] is False

def test_onboarding_endpoint(client: TestClient, create_jwt):
    """
    Test POST /api/v1/users/onboarding (onboarding system).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="eve@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create profile/preferences
    client.get("/api/v1/users/me", headers=headers)
    
    # Post onboarding
    payload = {
        "state_code": "KA",
        "diet_type": "vegetarian",
        "transport_preference": "metro",
        "housing_type": "pg"
    }
    response = client.post("/api/v1/users/onboarding", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["state_code"] == "KA"
    assert data["diet_type"] == "vegetarian"
    assert data["transport_preference"] == "metro"
    assert data["housing_type"] == "pg"

def test_onboarding_validation_rules(client: TestClient, create_jwt):
    """
    Verifies that invalid diet and housing types are rejected with 422.
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="val@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create profile/preferences
    client.get("/api/v1/users/me", headers=headers)
    
    # Invalid diet_type should fail validation
    payload = {
        "state_code": "KA",
        "diet_type": "keto",  # Invalid diet
        "transport_preference": "car",
        "housing_type": "apartment"
    }
    response = client.post("/api/v1/users/onboarding", json=payload, headers=headers)
    assert response.status_code == 422
    
    # Invalid housing_type should fail validation
    payload2 = {
        "state_code": "KA",
        "diet_type": "vegan",
        "transport_preference": "car",
        "housing_type": "mansion"  # Invalid housing
    }
    response2 = client.post("/api/v1/users/onboarding", json=payload2, headers=headers)
    assert response2.status_code == 422

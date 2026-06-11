from fastapi.testclient import TestClient
from decimal import Decimal
import uuid

def test_create_activity_success(client: TestClient, create_jwt):
    """
    Test POST /api/v1/activities with valid data.
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Initialize user profile first
    client.get("/api/v1/users/me", headers=headers)
    
    payload = {
        "category": "transport",
        "activity_type": "metro",
        "quantity": 10.5,
        "unit": "km",
        "metadata": {"route": "Line 1"}
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["category"] == "transport"
    assert data["activity_type"] == "metro"
    assert Decimal(data["quantity"]) == Decimal("10.5")
    assert data["unit"] == "km"
    assert data["metadata"]["route"] == "Line 1"
    assert "id" in data

def test_create_activity_negative_quantity(client: TestClient, create_jwt):
    """
    Test POST /api/v1/activities with a negative quantity (fails validation).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "category": "transport",
        "activity_type": "metro",
        "quantity": -5.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_activity_invalid_category(client: TestClient, create_jwt):
    """
    Test POST /api/v1/activities with an invalid category (fails validation).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "category": "industrial", # Invalid category
        "activity_type": "factory_waste",
        "quantity": 10.0,
        "unit": "tons"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 422

def test_create_activity_invalid_type_for_category(client: TestClient, create_jwt):
    """
    Test POST /api/v1/activities with an invalid activity type for the category (fails validation).
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    payload = {
        "category": "food",
        "activity_type": "flight", # 'flight' belongs to transport, not food!
        "quantity": 1.0,
        "unit": "meal"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 422

def test_list_and_filter_activities(client: TestClient, create_jwt):
    """
    Test GET /api/v1/activities and history filtering/pagination.
    """
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="list_test@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)
    
    # Create several activities
    acts = [
        {"category": "transport", "activity_type": "car", "quantity": 15.0, "unit": "km"},
        {"category": "food", "activity_type": "vegan_meal", "quantity": 1.0, "unit": "meal"},
        {"category": "shopping", "activity_type": "clothing", "quantity": 2.0, "unit": "items"}
    ]
    for act in acts:
        client.post("/api/v1/activities", json=act, headers=headers)
        
    # Get all activities
    response = client.get("/api/v1/activities", headers=headers)
    assert response.status_code == 200
    res_data = response.json()
    assert len(res_data["data"]) == 3
    assert res_data["pagination"]["total_items"] == 3
    
    # Filter by category
    response_filter = client.get("/api/v1/activities?category=food", headers=headers)
    assert response_filter.status_code == 200
    assert len(response_filter.json()["data"]) == 1
    assert response_filter.json()["data"][0]["activity_type"] == "vegan_meal"

    # Check history endpoint
    response_history = client.get("/api/v1/activities/history?category=shopping", headers=headers)
    assert response_history.status_code == 200
    assert len(response_history.json()["data"]) == 1
    assert response_history.json()["data"][0]["activity_type"] == "clothing"

def test_activity_ownership_security(client: TestClient, create_jwt):
    """
    Test that a user cannot access another user's activities.
    """
    # User 1 creates an activity
    u1_id = str(uuid.uuid4())
    u1_token = create_jwt(sub=u1_id, email="user1@example.com")
    u1_headers = {"Authorization": f"Bearer {u1_token}"}
    client.get("/api/v1/users/me", headers=u1_headers)
    
    payload = {"category": "electricity", "activity_type": "electricity_usage", "quantity": 120.0, "unit": "kWh"}
    res_create = client.post("/api/v1/activities", json=payload, headers=u1_headers)
    activity_id = res_create.json()["data"]["id"]
    
    # User 2 tries to fetch User 1's activity by ID
    u2_id = str(uuid.uuid4())
    u2_token = create_jwt(sub=u2_id, email="user2@example.com")
    u2_headers = {"Authorization": f"Bearer {u2_token}"}
    client.get("/api/v1/users/me", headers=u2_headers)
    
    response = client.get(f"/api/v1/activities/{activity_id}", headers=u2_headers)
    assert response.status_code == 404 # Should return 404 Not Found to prevent data leaking
    
    # User 2 lists activities: should not contain User 1's activity
    res_list = client.get("/api/v1/activities", headers=u2_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()["data"]) == 0

import pytest
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.simulation import SimulationScenario, SimulationResult, SimulationHistory
from app.models.activity import ActivityEvent
from app.models.gamification import SustainabilityScore
from app.services.simulation import SimulationService, DecisionAssistantService
from app.services.forecast import ForecastService
from app.repositories.simulation import SimulationScenarioRepository

# =====================================================================
# UNIT TESTS - SIMULATION FORMULAS & DECISION ASSISTANT
# =====================================================================

def test_simulation_service_formulas(db: Session):
    # Setup a mock user
    user_id = uuid.uuid4()
    user = User(id=user_id, auth_user_id=uuid.uuid4(), email="unit_test@example.com")
    db.add(user)
    db.commit()

    service = SimulationService(db)

    # 1. Transport change: 3 car trips to metro
    res = service.run_projection(user_id, "transport_change", {"weekly_car_trips_to_metro": 3})
    assert res["current_footprint"] == 92.0
    assert res["projected_footprint"] == pytest.approx(92.0 - (3 * 4.67), 0.01)
    assert res["footprint_change"] == pytest.approx(-(3 * 4.67), 0.01)
    assert res["current_score"] == 82
    assert res["projected_score"] == 88  # 82 + 6
    assert res["score_change"] == 6
    assert res["confidence_score"] == 0.70  # no history

    # 2. Diet change: 2 veg meals
    res = service.run_projection(user_id, "diet_change", {"weekly_vegetarian_meals": 2})
    assert res["projected_footprint"] == pytest.approx(92.0 - (2 * 3.0), 0.01)
    assert res["projected_score"] == 85  # 82 + 3

    # 3. Electricity change: 15% reduction
    res = service.run_projection(user_id, "electricity_change", {"electricity_reduction_pct": 15.0})
    assert res["projected_footprint"] == pytest.approx(92.0 - ((15.0 / 100.0) * 40.0), 0.01)
    assert res["projected_score"] == 88  # 82 + 6

    # 4. Shopping change: 15% reduction
    res = service.run_projection(user_id, "shopping_change", {"shopping_reduction_pct": 15.0})
    assert res["projected_footprint"] == pytest.approx(92.0 - ((15.0 / 100.0) * 20.0), 0.01)
    assert res["projected_score"] == 85  # 82 + 3

    # 5. Goal based: 10% reduction
    res = service.run_projection(user_id, "goal_based", {"target_carbon_reduction_pct": 10.0})
    assert res["projected_footprint"] == pytest.approx(92.0 * 0.90, 0.01)
    assert res["projected_score"] == 87  # 82 + 5

    # 6. Mixed change: transport (3) + diet (2)
    res = service.run_projection(user_id, "mixed_change", {
        "weekly_car_trips_to_metro": 3,
        "weekly_vegetarian_meals": 2
    })
    assert res["projected_footprint"] == pytest.approx(92.0 - (3 * 4.67) - (2 * 3.0), 0.01)
    assert res["projected_score"] == 91  # 82 + 6 + 3 = 91


def test_confidence_score_based_on_history(db: Session):
    user_id = uuid.uuid4()
    user = User(id=user_id, auth_user_id=uuid.uuid4(), email="history_test@example.com")
    db.add(user)
    db.commit()

    service = SimulationService(db)

    # A. 0 logging days -> 0.70
    res = service.run_projection(user_id, "transport_change", {"weekly_car_trips_to_metro": 1})
    assert res["confidence_score"] == 0.70

    # B. Add 5 distinct days of logging -> 0.85
    today = datetime.now(timezone.utc).date()
    for i in range(5):
        ae = ActivityEvent(
            id=uuid.uuid4(),
            user_id=user_id,
            category="transport",
            activity_type="car",
            quantity=10.0,
            unit="km",
            created_at=datetime.combine(today - timedelta(days=i), datetime.min.time(), tzinfo=timezone.utc)
        )
        db.add(ae)
    db.commit()

    res = service.run_projection(user_id, "transport_change", {"weekly_car_trips_to_metro": 1})
    assert res["confidence_score"] == 0.85

    # C. Add 12 more distinct days (total 17 distinct days) -> 0.95
    for i in range(5, 17):
        ae = ActivityEvent(
            id=uuid.uuid4(),
            user_id=user_id,
            category="transport",
            activity_type="car",
            quantity=10.0,
            unit="km",
            created_at=datetime.combine(today - timedelta(days=i), datetime.min.time(), tzinfo=timezone.utc)
        )
        db.add(ae)
    db.commit()

    res = service.run_projection(user_id, "transport_change", {"weekly_car_trips_to_metro": 1})
    assert res["confidence_score"] == 0.95


def test_decision_assistant_ranking(db: Session):
    user_id = uuid.uuid4()
    user = User(id=user_id, auth_user_id=uuid.uuid4(), email="ranking_test@example.com")
    db.add(user)
    db.commit()

    assistant = DecisionAssistantService(db)

    scenarios = [
        {"scenario_type": "diet_change", "parameters": {"weekly_vegetarian_meals": 2}, "scenario_name": "Veg Diet"},
        {"scenario_type": "transport_change", "parameters": {"weekly_car_trips_to_metro": 3}, "scenario_name": "Metro Trips"},
        {"scenario_type": "electricity_change", "parameters": {"electricity_reduction_pct": 5.0}, "scenario_name": "Save Power"}
    ]

    compared = assistant.compare_scenarios(user_id, scenarios)
    # Ranks by footprint change ascending (most savings first)
    # Savings: Metro Trips = 14.01kg, Veg Diet = 6.0kg, Save Power = 2.0kg.
    # footprint_change is negative savings: Metro = -14.01, Veg = -6.0, Power = -2.0
    # Sorted order should be: Metro, Veg, Power
    assert compared[0]["scenario_name"] == "Metro Trips"
    assert compared[1]["scenario_name"] == "Veg Diet"
    assert compared[2]["scenario_name"] == "Save Power"


# =====================================================================
# INTEGRATION TESTS - ENDPOINTS
# =====================================================================

def test_simulation_workflow_endpoints(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="integration_flow@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)
    user_db = db.query(User).filter_by(email="integration_flow@example.com").first()

    # 1. POST /api/v1/simulations (Create simulation)
    payload = {
        "scenario_name": "Replace 3 weekly car trips",
        "scenario_type": "transport_change",
        "parameters": {"weekly_car_trips_to_metro": 3}
    }
    response = client.post("/api/v1/simulations", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()["data"]
    assert "scenario_id" in data
    assert data["scenario_name"] == "Replace 3 weekly car trips"
    assert data["current_footprint"] == 92.0
    assert data["projected_footprint"] == pytest.approx(92.0 - 14.01, 0.01)
    assert data["footprint_change"] == pytest.approx(-14.01, 0.01)
    assert data["current_score"] == 82
    assert data["projected_score"] == 88
    assert "explanation" in data

    scenario_id = data["scenario_id"]

    # Verify tables: scenario, result, and history records exist
    db.expire_all()
    scenario_record = db.query(SimulationScenario).filter_by(id=scenario_id).first()
    assert scenario_record is not None
    assert len(scenario_record.results) == 1
    assert scenario_record.results[0].predicted_footprint == pytest.approx(92.0 - 14.01, 0.01)

    history_record = db.query(SimulationHistory).filter_by(scenario_id=scenario_id).first()
    assert history_record is not None
    assert history_record.user_id == user_db.id

    # 2. GET /api/v1/simulations (List scenarios)
    list_response = client.get("/api/v1/simulations", headers=headers)
    assert list_response.status_code == 200
    list_data = list_response.json()["data"]
    assert len(list_data) == 1
    assert list_data[0]["scenario_id"] == scenario_id

    # 3. GET /api/v1/simulations/{id} (Get scenario details)
    detail_response = client.get(f"/api/v1/simulations/{scenario_id}", headers=headers)
    assert detail_response.status_code == 200
    detail_data = detail_response.json()["data"]
    assert detail_data["scenario_id"] == scenario_id
    assert detail_data["scenario_name"] == "Replace 3 weekly car trips"

    # 4. GET /api/v1/simulations/history (Retrieves simulation history logs)
    history_response = client.get("/api/v1/simulations/history", headers=headers)
    assert history_response.status_code == 200
    history_data = history_response.json()["data"]
    assert len(history_data) == 1
    assert history_data[0]["scenario_id"] == scenario_id

    # 5. POST /api/v1/simulations/compare (Compare scenarios)
    compare_payload = {
        "scenarios": [
            {"scenario_id": scenario_id},  # Saved scenario
            {
                "scenario_name": "Eat 2 vegetarian meals",
                "scenario_type": "diet_change",
                "parameters": {"weekly_vegetarian_meals": 2}
            }  # Ad-hoc scenario
        ]
    }
    compare_response = client.post("/api/v1/simulations/compare", json=compare_payload, headers=headers)
    assert compare_response.status_code == 200
    compare_data = compare_response.json()["data"]
    assert len(compare_data) == 2
    # Ranks by impact: Replace 3 weekly car trips (-14.01) should be first, Eat 2 veg (-6.0) second
    assert compare_data[0]["scenario_name"] == "Replace 3 weekly car trips"
    assert compare_data[1]["scenario_name"] == "Eat 2 vegetarian meals"

    # 6. GET /api/v1/simulations/recommendations (Dashboard impact recommendations)
    recommendations_response = client.get("/api/v1/simulations/recommendations", headers=headers)
    assert recommendations_response.status_code == 200
    rec_data = recommendations_response.json()["data"]
    assert len(rec_data) == 4
    # Check that it ranks recommendations by impact
    assert rec_data[0]["scenario_name"] == "Replace 3 car trips with metro"


# =====================================================================
# VALIDATION & SECURITY TESTS
# =====================================================================

def test_simulation_validation_errors(client: TestClient, create_jwt):
    token = create_jwt(email="validation@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)

    # Case 1: Missing required parameter weekly_car_trips_to_metro for transport_change
    payload = {
        "scenario_name": "Bad transport",
        "scenario_type": "transport_change",
        "parameters": {}
    }
    response = client.post("/api/v1/simulations", json=payload, headers=headers)
    assert response.status_code == 400
    assert "weekly_car_trips_to_metro" in response.json()["detail"]

    # Case 2: Negative value weekly_vegetarian_meals for diet_change
    payload = {
        "scenario_name": "Bad diet",
        "scenario_type": "diet_change",
        "parameters": {"weekly_vegetarian_meals": -1}
    }
    response = client.post("/api/v1/simulations", json=payload, headers=headers)
    assert response.status_code == 400

    # Case 3: Invalid percentage (> 100) for electricity_change
    payload = {
        "scenario_name": "Bad electricity",
        "scenario_type": "electricity_change",
        "parameters": {"electricity_reduction_pct": 105.0}
    }
    response = client.post("/api/v1/simulations", json=payload, headers=headers)
    assert response.status_code == 400

    # Case 4: Invalid parameters types
    payload = {
        "scenario_name": "Bad transport type",
        "scenario_type": "transport_change",
        "parameters": {"weekly_car_trips_to_metro": "three"}
    }
    response = client.post("/api/v1/simulations", json=payload, headers=headers)
    assert response.status_code == 400


def test_simulation_security_access_boundaries(client: TestClient, create_jwt, db: Session):
    # Setup User A
    token_a = create_jwt(sub="110e8400-e29b-41d4-a716-446655440001", email="usera@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    client.get("/api/v1/users/me", headers=headers_a)

    # Setup User B
    token_b = create_jwt(sub="220e8400-e29b-41d4-a716-446655440002", email="userb@example.com")
    headers_b = {"Authorization": f"Bearer {token_b}"}
    client.get("/api/v1/users/me", headers=headers_b)

    # User A creates a simulation
    payload = {
        "scenario_name": "User A scenario",
        "scenario_type": "transport_change",
        "parameters": {"weekly_car_trips_to_metro": 3}
    }
    response_a = client.post("/api/v1/simulations", json=payload, headers=headers_a)
    assert response_a.status_code == 201
    scenario_id = response_a.json()["data"]["scenario_id"]

    # User B tries to access User A's simulation details -> expect 403 Forbidden
    response_b_details = client.get(f"/api/v1/simulations/{scenario_id}", headers=headers_b)
    assert response_b_details.status_code == 403

    # User B tries to view a non-existent simulation UUID -> expect 404 Not Found
    random_uuid = uuid.uuid4()
    response_random = client.get(f"/api/v1/simulations/{random_uuid}", headers=headers_b)
    assert response_random.status_code == 404

from decimal import Decimal
from datetime import datetime, timedelta, timezone
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.mission import UserMission
from app.models.footprint import DailyFootprint
from app.services.mission_engine import MissionEngineService

# =====================================================================
# UNIT TESTS - SELECTION LOGIC & PERSONALIZATION
# =====================================================================

def test_select_mission_fallback_general_when_no_emissions(db: Session):
    # Setup a mock user
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="no_emissions@example.com")
    db.add(user)
    db.commit()

    engine = MissionEngineService(db)
    # With no emissions, should fallback to category='general' template
    # Seeded general template is: "Complete all sustainability logs today"
    template = engine.select_personalized_template(user.id, user.auth_user_id)
    assert template is not None
    assert template.category == "general"
    assert template.title == "Complete all sustainability logs today"

def test_select_mission_prioritizes_dominant_transport(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="transport_dominant@example.com")
    db.add(user)
    db.commit()

    # Create transport emissions in daily footprints
    today = datetime.now(timezone.utc).date()
    fp = DailyFootprint(
        user_id=user.id,
        date=today - timedelta(days=2),
        transport_emissions=Decimal("50.0"), # Dominates
        total_emissions=Decimal("50.0")
    )
    db.add(fp)
    db.commit()

    engine = MissionEngineService(db)
    template = engine.select_personalized_template(user.id, user.auth_user_id)
    assert template is not None
    assert template.category == "transport"
    # Should prioritize 'easy' first: "Walk instead of using a vehicle for one short trip" (co2=1.2)
    # vs "Use public transport today" (co2=2.5). Wait!
    # They are both 'easy' difficulty.
    # In our sorting, we sort by:
    # 1. difficulty mapping (easy=0, medium=1)
    # 2. estimated_co2_saving descending (2.5 > 1.2)
    # So "Use public transport today" should be sorted first!
    assert template.title == "Use public transport today"

def test_select_mission_prioritizes_dominant_food(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="food_dominant@example.com")
    db.add(user)
    db.commit()

    today = datetime.now(timezone.utc).date()
    fp = DailyFootprint(
        user_id=user.id,
        date=today - timedelta(days=2),
        food_emissions=Decimal("20.0"), # Dominates
        total_emissions=Decimal("20.0")
    )
    db.add(fp)
    db.commit()

    engine = MissionEngineService(db)
    template = engine.select_personalized_template(user.id, user.auth_user_id)
    assert template is not None
    assert template.category == "food"
    # Seeded food templates:
    # 1. "Eat one vegetarian meal" (easy, co2=1.5)
    # 2. "Avoid food delivery today" (medium, co2=2.0)
    # Since 'easy' is prioritized, "Eat one vegetarian meal" must be chosen!
    assert template.title == "Eat one vegetarian meal"

def test_select_mission_repetition_prevention(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="repeat_test@example.com")
    db.add(user)
    db.commit()

    # Seed dominant transport footprint
    today = datetime.now(timezone.utc).date()
    fp = DailyFootprint(
        user_id=user.id,
        date=today - timedelta(days=2),
        transport_emissions=Decimal("50.0"),
        total_emissions=Decimal("50.0")
    )
    db.add(fp)
    db.commit()

    engine = MissionEngineService(db)
    # Get first recommendation: should be "Use public transport today"
    t1 = engine.select_personalized_template(user.id, user.auth_user_id)
    assert t1.title == "Use public transport today"

    # Simulate assigning t1 to the user yesterday (1 day ago)
    um = UserMission(
        user_id=user.id,
        mission_template_id=t1.id,
        assigned_date=today - timedelta(days=1),
        status="assigned"
    )
    db.add(um)
    db.commit()

    # Query recommendation again: t1 should be excluded.
    # The next best transport template is: "Walk instead of using a vehicle for one short trip"
    t2 = engine.select_personalized_template(user.id, user.auth_user_id)
    assert t2.title == "Walk instead of using a vehicle for one short trip"

# =====================================================================
# INTEGRATION TESTS - ENDPOINTS & ASSIGNMENT
# =====================================================================

def test_mission_daily_assignment_flow(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="daily_mission@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)

    # 1. Retrieve today's mission (generates first one)
    res_today = client.get("/api/v1/missions/today", headers=headers)
    assert res_today.status_code == 200
    data = res_today.json()["data"]
    assert "id" in data
    assert data["status"] == "assigned"
    # General template fallback
    assert data["category"] == "general"
    assert data["title"] == "Complete all sustainability logs today"
    mission_id = data["id"]

    # 2. Retrieve today's mission again: must return the exact same mission (id matches, status is assigned)
    res_today2 = client.get("/api/v1/missions/today", headers=headers)
    assert res_today2.status_code == 200
    data2 = res_today2.json()["data"]
    assert data2["id"] == mission_id
    assert data2["status"] == "assigned"

    # 3. Retrieve recommended preview (unassigned recommendation)
    res_rec = client.get("/api/v1/missions/recommended", headers=headers)
    assert res_rec.status_code == 200
    data_rec = res_rec.json()["data"]
    assert "title" in data_rec
    # Since general template was assigned, recommended fallback could change or remain if we relax repetition limit
    assert "category" in data_rec

    # 4. Retrieve history: should contain 1 mission
    res_hist = client.get("/api/v1/missions/history", headers=headers)
    assert res_hist.status_code == 200
    data_hist = res_hist.json()["data"]
    assert len(data_hist) == 1
    assert data_hist[0]["id"] == mission_id
    assert res_hist.json()["pagination"]["total_items"] == 1

    # 5. Complete today's mission
    res_comp = client.post(f"/api/v1/missions/{mission_id}/complete", headers=headers)
    assert res_comp.status_code == 200
    assert res_comp.json()["data"]["status"] == "completed"
    assert res_comp.json()["data"]["completed_at"] is not None

    # 6. Retrieve history again: status should now be completed
    res_hist2 = client.get("/api/v1/missions/history", headers=headers)
    assert res_hist2.status_code == 200
    assert res_hist2.json()["data"][0]["status"] == "completed"

# =====================================================================
# VALIDATION TESTS - MISSING/DUPLICATE COMPLETIONS
# =====================================================================

def test_complete_invalid_mission_id(client: TestClient, create_jwt):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="invalid_mission@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    fake_id = str(uuid.uuid4())
    res = client.post(f"/api/v1/missions/{fake_id}/complete", headers=headers)
    assert res.status_code == 404
    assert "Mission not found" in res.json()["detail"]

def test_duplicate_mission_completion(client: TestClient, create_jwt):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="duplicate_comp@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # Generate daily mission
    res_today = client.get("/api/v1/missions/today", headers=headers)
    mission_id = res_today.json()["data"]["id"]

    # First completion: Success
    res1 = client.post(f"/api/v1/missions/{mission_id}/complete", headers=headers)
    assert res1.status_code == 200
    assert res1.json()["data"]["status"] == "completed"

    # Second completion: Fails with 400 Bad Request
    res2 = client.post(f"/api/v1/missions/{mission_id}/complete", headers=headers)
    assert res2.status_code == 400
    assert "already completed" in res2.json()["detail"]

def test_missions_user_isolation(client: TestClient, create_jwt):
    # User A gets today's mission
    user_a_id = str(uuid.uuid4())
    token_a = create_jwt(sub=user_a_id, email="usera_mission@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    client.get("/api/v1/users/me", headers=headers_a)

    res_a = client.get("/api/v1/missions/today", headers=headers_a)
    mission_id = res_a.json()["data"]["id"]

    # User B tries to complete User A's mission (should return 404)
    user_b_id = str(uuid.uuid4())
    token_b = create_jwt(sub=user_b_id, email="userb_mission@example.com")
    headers_b = {"Authorization": f"Bearer {token_b}"}
    client.get("/api/v1/users/me", headers=headers_b)

    res_b = client.post(f"/api/v1/missions/{mission_id}/complete", headers=headers_b)
    assert res_b.status_code == 404

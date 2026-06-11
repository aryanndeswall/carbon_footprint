from datetime import datetime, timedelta, timezone
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.streak import UserStreak, StreakEvent
from app.services.retention import RetentionService

# =====================================================================
# UNIT TESTS - STREAK LOGIC & FREEZE LOGIC
# =====================================================================

def test_streak_starts_on_first_activity(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="streak_start@example.com")
    db.add(user)
    db.commit()

    retention = RetentionService(db)
    
    # 1. First evaluation: should start streak
    streak = retention.evaluate_and_update_streak(user.id)
    assert streak.current_streak == 1
    assert streak.longest_streak == 1
    assert streak.last_activity_date == datetime.now(timezone.utc).date()

    # Verify event logged
    events = db.query(StreakEvent).filter_by(user_id=user.id).all()
    assert len(events) == 1
    assert events[0].event_type == "streak_started"
    assert events[0].new_streak == 1

def test_streak_extends_on_consecutive_days(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="streak_ext@example.com")
    db.add(user)
    db.commit()

    # Pre-populate streak with yesterday as last activity
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    streak_record = UserStreak(
        user_id=user.id,
        current_streak=5,
        longest_streak=5,
        last_activity_date=yesterday,
        freeze_count=1
    )
    db.add(streak_record)
    db.commit()

    retention = RetentionService(db)
    streak = retention.evaluate_and_update_streak(user.id)
    
    assert streak.current_streak == 6
    assert streak.longest_streak == 6
    assert streak.last_activity_date == today

    # Verify event logged
    events = db.query(StreakEvent).filter_by(user_id=user.id, event_type="streak_extended").all()
    assert len(events) == 1
    assert events[0].previous_streak == 5
    assert events[0].new_streak == 6

def test_duplicate_activity_does_not_increment_streak(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="streak_dup@example.com")
    db.add(user)
    db.commit()

    retention = RetentionService(db)
    # Perform activity 1
    retention.evaluate_and_update_streak(user.id)
    # Perform activity 2 today
    streak = retention.evaluate_and_update_streak(user.id)
    
    assert streak.current_streak == 1
    events = db.query(StreakEvent).filter_by(user_id=user.id).all()
    assert len(events) == 1  # Only one streak_started event, no duplicate log

def test_streak_freeze_applied_automatically(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="streak_freeze_auto@example.com")
    db.add(user)
    db.commit()

    today = datetime.now(timezone.utc).date()
    two_days_ago = today - timedelta(days=2) # Missed yesterday

    streak_record = UserStreak(
        user_id=user.id,
        current_streak=10,
        longest_streak=10,
        last_activity_date=two_days_ago,
        freeze_count=1
    )
    db.add(streak_record)
    db.commit()

    retention = RetentionService(db)
    # Evaluating user action today: should trigger freeze automatically
    streak = retention.evaluate_and_update_streak(user.id)
    
    assert streak.freeze_count == 0
    # Streak is extended to 11 (10 preserved by freeze, +1 for today's activity)
    assert streak.current_streak == 11
    assert streak.last_activity_date == today

    # Verify freeze event and extension event exist
    events = db.query(StreakEvent).filter_by(user_id=user.id).order_by(StreakEvent.created_at.asc()).all()
    assert events[0].event_type == "freeze_used"
    assert events[1].event_type == "streak_extended"

def test_streak_breaks_when_no_freezes(db: Session):
    from app.models.user import User
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="streak_break@example.com")
    db.add(user)
    db.commit()

    today = datetime.now(timezone.utc).date()
    two_days_ago = today - timedelta(days=2)

    streak_record = UserStreak(
        user_id=user.id,
        current_streak=8,
        longest_streak=8,
        last_activity_date=two_days_ago,
        freeze_count=0  # No freezes available
    )
    db.add(streak_record)
    db.commit()

    retention = RetentionService(db)
    streak = retention.evaluate_and_update_streak(user.id)
    
    assert streak.current_streak == 1  # Streak reset and started new one today
    assert streak.longest_streak == 8  # Longest streak preserved
    assert streak.last_activity_date == today

    # Verify broken and started events
    events = db.query(StreakEvent).filter_by(user_id=user.id).order_by(StreakEvent.created_at.asc()).all()
    assert events[0].event_type == "streak_broken"
    assert events[0].previous_streak == 8
    assert events[0].new_streak == 0
    assert events[1].event_type == "streak_started"
    assert events[1].new_streak == 1

# =====================================================================
# INTEGRATION TESTS - ACTIVITIES & ENDPOINTS
# =====================================================================

def test_activity_logging_extends_streak(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="integration_streak@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.get("/api/v1/users/me", headers=headers)

    # Log activity today: should initialize streak
    payload = {
        "category": "transport",
        "activity_type": "car",
        "quantity": 10.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 201

    # Check streak endpoint
    res_streak = client.get("/api/v1/streaks/current", headers=headers)
    assert res_streak.status_code == 200
    data = res_streak.json()["data"]
    assert data["current_streak"] == 1
    assert data["longest_streak"] == 1
    assert data["freeze_count"] == 1

def test_streak_history_and_stats(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="streak_stats@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user
    client.get("/api/v1/users/me", headers=headers)
    from app.models.user import User
    user_db = db.query(User).filter_by(email="streak_stats@example.com").first()

    # Pre-add streak and event history
    streak_record = UserStreak(
        user_id=user_db.id,
        current_streak=15,
        longest_streak=20,
        last_activity_date=datetime.now(timezone.utc).date() - timedelta(days=1),
        freeze_count=1
    )
    db.add(streak_record)
    
    event = StreakEvent(
        user_id=user_db.id,
        event_type="streak_extended",
        previous_streak=14,
        new_streak=15
    )
    db.add(event)
    db.commit()

    # Query history
    res_history = client.get("/api/v1/streaks/history", headers=headers)
    assert res_history.status_code == 200
    events = res_history.json()["data"]
    assert len(events) == 1
    assert events[0]["event_type"] == "streak_extended"

    # Query stats (global)
    res_stats = client.get("/api/v1/streaks/stats", headers=headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()["data"]
    assert stats["active_streaks"] >= 1
    assert stats["longest_streak"] >= 20

# =====================================================================
# VALIDATION TESTS - MANUAL FREEZE LIMITS
# =====================================================================

def test_manual_use_freeze_validation(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="freeze_val@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.get("/api/v1/users/me", headers=headers)

    # Use freeze (reduces from 1 to 0)
    res_freeze = client.post("/api/v1/streaks/use-freeze", headers=headers)
    assert res_freeze.status_code == 200
    assert res_freeze.json()["data"]["freeze_count"] == 0

    # Try to use freeze again (fails since count is 0)
    res_freeze_fail = client.post("/api/v1/streaks/use-freeze", headers=headers)
    assert res_freeze_fail.status_code == 400
    assert "No freezes available" in res_freeze_fail.json()["detail"]

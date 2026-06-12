import pytest
from datetime import datetime, timezone, date, timedelta
import uuid
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.gamification import SustainabilityScore, Achievement, UserAchievement, ScoreHistory
from app.models.activity import ActivityEvent
from app.models.mission import MissionTemplate, UserMission
from app.models.streak import UserStreak
from app.models.community import Group, GroupMember
from app.models.footprint import DailyFootprint
from app.services.gamification import SustainabilityScoreService, AchievementService
from app.services.seed import seed_achievements

# =====================================================================
# UNIT TESTS - SCORING AND ACHIEVEMENTS RULES
# =====================================================================

def test_sustainability_score_formula_calculation(db: Session):
    # Setup achievements table if empty
    seed_achievements(db)

    # 1. Setup user
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="score_formula@example.com")
    db.add(user)
    db.commit()

    # 2. Add ActivityEvents on 15 distinct days -> consistency = (15/30)*100 = 50
    today = datetime.now(timezone.utc).date()
    for i in range(15):
        ae_date = today - timedelta(days=i)
        ae_time = datetime.combine(ae_date, datetime.min.time(), tzinfo=timezone.utc)
        ae = ActivityEvent(
            id=uuid.uuid4(),
            user_id=user.id,
            category="transport",
            activity_type="car",
            quantity=10.0,
            unit="km",
            created_at=ae_time
        )
        db.add(ae)

    # 3. Use 4 existing pre-seeded mission templates of distinct categories
    # Complete 3 out of 4 -> completion = 3/4 = 75%. categories count = 3 -> diversity = 3*25 = 75
    # Mission Score = 75 * 0.60 + 75 * 0.40 = 75
    categories = ["transport", "food", "electricity", "shopping"]
    templates = []
    for cat in categories:
        t = db.query(MissionTemplate).filter(MissionTemplate.category == cat).first()
        assert t is not None
        templates.append(t)

    for i, t in enumerate(templates):
        assigned_date = today - timedelta(days=i)
        um = UserMission(
            id=uuid.uuid4(),
            user_id=user.id,
            mission_template_id=t.id,
            assigned_date=assigned_date,
            status="completed" if i < 3 else "assigned"
        )
        db.add(um)
    db.commit()

    # 4. Streak record: current = 4, longest = 6
    # Streak score = min(4*5, 50) + min(6*1.67, 50) = 20 + 10 = 30
    streak = UserStreak(
        user_id=user.id,
        current_streak=4,
        longest_streak=6
    )
    db.add(streak)

    # 5. Footprints: Week 1 sum = 10, Week 2 sum = 20
    # Reduction pct = (20 - 10)/20 = 50%
    # Improvement score = min(50 + (0.50 * 50), 100) = 75
    fp1 = DailyFootprint(user_id=user.id, date=today - timedelta(days=2), total_emissions=Decimal("10.0"))
    fp2 = DailyFootprint(user_id=user.id, date=today - timedelta(days=9), total_emissions=Decimal("20.0"))
    db.add_all([fp1, fp2])
    db.commit()

    # Calculate
    score_service = SustainabilityScoreService(db)
    score = score_service.calculate_and_save_score(user.id)

    # Assertions
    # Consistency: 15 distinct days -> 50
    # Mission: 75% rate (0.6) + 75 diversity (0.4) -> 75
    # Streak: 4 current + 6 longest -> 30
    # Improvement: 50% reduction -> 75
    # Overall = 0.40*50 + 0.25*75 + 0.20*30 + 0.15*75 = 20 + 18.75 + 6 + 11.25 = 56
    assert score.consistency_score == 50
    assert score.mission_score == 75
    assert score.streak_score == 30
    assert score.improvement_score == 75
    assert score.overall_score == 56


def test_achievement_service_qualification(db: Session):
    seed_achievements(db)

    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="ach_qual@example.com")
    db.add(user)
    db.commit()

    # Initially user has no activities, no missions, no streak, no groups -> earns nothing
    ach_service = AchievementService(db)
    awards = ach_service.evaluate_and_award_achievements(user.id)
    assert len(awards) == 0

    # 1. Log an activity -> should qualify for "First Step"
    ae = ActivityEvent(
        user_id=user.id,
        category="transport",
        activity_type="car",
        quantity=10.0,
        unit="km"
    )
    db.add(ae)
    db.commit()

    awards = ach_service.evaluate_and_award_achievements(user.id)
    assert len(awards) == 1
    assert awards[0].achievement.title == "First Step"

    # Duplicate awards evaluation should award nothing new
    awards_dup = ach_service.evaluate_and_award_achievements(user.id)
    assert len(awards_dup) == 0


# =====================================================================
# INTEGRATION TESTS - ENDPOINTS
# =====================================================================

def test_activity_logging_updates_score_and_history(client: TestClient, create_jwt, db: Session):
    seed_achievements(db)

    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="score_integration@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)
    user_db = db.query(User).filter_by(email="score_integration@example.com").first()

    # Log activity today -> updates score
    payload = {
        "category": "transport",
        "activity_type": "car",
        "quantity": 10.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 201

    # Verify score table contains record
    score_record = db.query(SustainabilityScore).filter_by(user_id=user_db.id).first()
    assert score_record is not None
    # Consistency should be min(1/30)*100 = 3
    # Overall score should be calculated
    assert score_record.consistency_score > 0
    assert score_record.overall_score > 0

    # Verify history table contains entry
    history_record = db.query(ScoreHistory).filter_by(user_id=user_db.id).first()
    assert history_record is not None
    assert history_record.score == score_record.overall_score


def test_gamification_endpoints(client: TestClient, create_jwt, db: Session):
    seed_achievements(db)

    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="score_endpoints@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # 1. Get Score
    score_res = client.get("/api/v1/score", headers=headers)
    assert score_res.status_code == 200
    assert "overall_score" in score_res.json()["data"]

    # 2. Get History
    hist_res = client.get("/api/v1/score/history", headers=headers)
    assert hist_res.status_code == 200
    assert isinstance(hist_res.json()["data"], list)

    # 3. Get Achievements
    ach_res = client.get("/api/v1/achievements", headers=headers)
    assert ach_res.status_code == 200
    assert len(ach_res.json()["data"]) == 6

    # 4. Get Progress
    prog_res = client.get("/api/v1/achievements/progress", headers=headers)
    assert prog_res.status_code == 200
    progress_data = prog_res.json()["data"]
    assert len(progress_data) == 6
    
    # Verify field schema
    assert "current_progress" in progress_data[0]
    assert "target" in progress_data[0]
    assert "earned" in progress_data[0]

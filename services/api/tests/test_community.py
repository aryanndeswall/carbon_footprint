import pytest
from datetime import datetime, timedelta, timezone, date
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.community import Group, GroupMember, Challenge, ChallengeParticipant, LeaderboardSnapshot
from app.models.mission import MissionTemplate, UserMission
from app.models.streak import UserStreak
from app.models.activity import ActivityEvent
from app.services.community import (
    GroupService,
    ChallengeService,
    LeaderboardService,
    CommunityImpactService
)

# =====================================================================
# UNIT TESTS - SCORE & IMPACT LOGIC
# =====================================================================

def test_leaderboard_score_calculation(db: Session):
    # 1. Create a user
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="score_calc@example.com")
    db.add(user)
    db.commit()

    # 2. Add streak record: current_streak = 5 -> score should be min(5/10, 1)*20 = 10.0
    streak = UserStreak(user_id=user.id, current_streak=5, longest_streak=5)
    db.add(streak)
    
    # 3. Add ActivityEvents on 10 distinct days in the last 30 days -> consistency score should be 10.0
    today = datetime.now(timezone.utc).date()
    for i in range(10):
        activity_date = today - timedelta(days=i)
        activity_time = datetime.combine(activity_date, datetime.min.time(), tzinfo=timezone.utc)
        ae = ActivityEvent(
            id=uuid.uuid4(),
            user_id=user.id,
            category="transport",
            activity_type="car",
            quantity=10.0,
            unit="km",
            created_at=activity_time
        )
        db.add(ae)

    # 4. Use existing seeded mission templates
    templates = db.query(MissionTemplate).limit(5).all()
    assert len(templates) >= 5

    # Assign missions
    for i, t in enumerate(templates):
        assigned_date = today - timedelta(days=i+1)
        um = UserMission(
            id=uuid.uuid4(),
            user_id=user.id,
            mission_template_id=t.id,
            assigned_date=assigned_date,
            status="completed" if i < 3 else "assigned",
            completed_at=datetime.combine(assigned_date, datetime.min.time(), tzinfo=timezone.utc) if i < 3 else None
        )
        db.add(um)
    db.commit()

    # Calculate score
    leaderboard_service = LeaderboardService(db)
    calculated_score = leaderboard_service.calculate_score(user.id, today)

    # Expected score components:
    # Mission: (3/5) * 40 = 24.0
    # Consistency: 10 days = 10.0
    # Streak: min(5/10, 1)*20 = 10.0
    # Savings: min(sum_completed_savings / 20.0, 1)*10
    completed_savings = sum(float(templates[i].estimated_co2_saving) for i in range(3))
    expected_savings_score = min(completed_savings / 20.0, 1.0) * 10.0
    expected_score = round(24.0 + 10.0 + 10.0 + expected_savings_score, 2)
    assert calculated_score == expected_score


def test_community_impact_calculation(db: Session):
    # Create two users in a group
    user1 = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="impact1@example.com")
    user2 = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="impact2@example.com")
    db.add_all([user1, user2])
    db.commit()

    group = Group(name="Impact Group", group_type="friends", created_by=user1.id)
    db.add(group)
    db.commit()

    m1 = GroupMember(group_id=group.id, user_id=user1.id)
    m2 = GroupMember(group_id=group.id, user_id=user2.id)
    db.add_all([m1, m2])
    db.commit()

    # Retrieve existing mission templates
    templates = db.query(MissionTemplate).limit(2).all()
    assert len(templates) >= 2
    t1 = templates[0]
    t2 = templates[1]

    today = date.today()
    # User 1 completed mission
    um1 = UserMission(user_id=user1.id, mission_template_id=t1.id, assigned_date=today, status="completed")
    # User 2 completed mission
    um2 = UserMission(user_id=user2.id, mission_template_id=t2.id, assigned_date=today, status="completed")
    # User 2 assigned but not completed
    um3 = UserMission(user_id=user2.id, mission_template_id=t1.id, assigned_date=today - timedelta(days=1), status="assigned")
    
    db.add_all([um1, um2, um3])
    db.commit()

    impact_service = CommunityImpactService(db)
    
    # Group impact
    expected_savings = float(t1.estimated_co2_saving) + float(t2.estimated_co2_saving)
    group_savings = impact_service.calculate_community_impact(group.id, days=30)
    assert group_savings == expected_savings

    # Global impact
    global_savings = impact_service.calculate_community_impact(None, days=30)
    assert global_savings >= expected_savings


# =====================================================================
# INTEGRATION TESTS - ENDPOINTS
# =====================================================================

def test_group_creation_and_joining(client: TestClient, create_jwt, db: Session):
    u1_auth_id = uuid.uuid4()
    u2_auth_id = uuid.uuid4()
    
    # Onboard users to create User records
    token1 = create_jwt(sub=str(u1_auth_id), email="group_u1@example.com")
    token2 = create_jwt(sub=str(u2_auth_id), email="group_u2@example.com")
    
    h1 = {"Authorization": f"Bearer {token1}"}
    h2 = {"Authorization": f"Bearer {token2}"}
    
    # Ensure they exist in DB
    client.get("/api/v1/users/me", headers=h1)
    client.get("/api/v1/users/me", headers=h2)

    # 1. Create a group
    group_payload = {
        "name": "Eco Warriors",
        "description": "Fighting climate change",
        "group_type": "college"
    }
    response = client.post("/api/v1/groups", json=group_payload, headers=h1)
    assert response.status_code == 201
    group_data = response.json()["data"]
    assert group_data["name"] == "Eco Warriors"
    assert group_data["member_count"] == 1  # Creator is automatic member
    
    group_id = group_data["id"]

    # 2. Join the group with second user
    join_res = client.post(f"/api/v1/groups/{group_id}/join", headers=h2)
    assert join_res.status_code == 200
    join_data = join_res.json()["data"]
    assert join_data["member_count"] == 2

    # 3. Duplicate join (should fail)
    dup_res = client.post(f"/api/v1/groups/{group_id}/join", headers=h2)
    assert dup_res.status_code == 400
    assert "already a member" in dup_res.json()["detail"]

    # 4. List groups
    list_res = client.get("/api/v1/groups", headers=h1)
    assert list_res.status_code == 200
    groups_list = list_res.json()["data"]
    assert len(groups_list) >= 1
    
    # 5. Get group details
    get_res = client.get(f"/api/v1/groups/{group_id}", headers=h1)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["member_count"] == 2

    # 6. Leave group
    leave_res = client.post(f"/api/v1/groups/{group_id}/leave", headers=h2)
    assert leave_res.status_code == 200
    
    # Member count should drop to 1
    get_res_after = client.get(f"/api/v1/groups/{group_id}", headers=h1)
    assert get_res_after.json()["data"]["member_count"] == 1

    # Leave again (should fail)
    leave_fail = client.post(f"/api/v1/groups/{group_id}/leave", headers=h2)
    assert leave_fail.status_code == 400


def test_challenge_creation_and_joining(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="challenge_user@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # 1. Create a challenge
    challenge_payload = {
        "title": "Zero Waste Week",
        "description": "Try to log zero waste missions",
        "challenge_type": "mission_completion",
        "start_date": str(date.today()),
        "end_date": str(date.today() + timedelta(days=7))
    }
    response = client.post("/api/v1/challenges", json=challenge_payload, headers=headers)
    assert response.status_code == 201
    challenge_data = response.json()["data"]
    challenge_id = challenge_data["id"]

    # 2. Join challenge
    join_res = client.post(f"/api/v1/challenges/{challenge_id}/join", headers=headers)
    assert join_res.status_code == 200
    
    # 3. Duplicate join challenge (fails)
    dup_res = client.post(f"/api/v1/challenges/{challenge_id}/join", headers=headers)
    assert dup_res.status_code == 400
    assert "already participating" in dup_res.json()["detail"]

    # 4. List challenges
    list_res = client.get("/api/v1/challenges", headers=headers)
    assert list_res.status_code == 200
    challenges = list_res.json()["data"]
    assert len(challenges) >= 1

    # 5. Challenge progress
    prog_res = client.get(f"/api/v1/challenges/{challenge_id}/progress", headers=headers)
    assert prog_res.status_code == 200
    participants = prog_res.json()["data"]
    assert len(participants) == 1
    assert participants[0]["progress_score"] == 0.0


def test_leaderboards_and_impact_endpoints(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="leaderboard_endpoint@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create user profile
    client.get("/api/v1/users/me", headers=headers)

    # Query leaderboard (group or global)
    # Since we have no snapshots, it will generate on the fly
    res = client.get("/api/v1/leaderboard", headers=headers)
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) >= 1  # Should contain at least our user

    # Query community impact
    impact_res = client.get("/api/v1/community-impact", headers=headers)
    assert impact_res.status_code == 200
    assert "total_saved_co2_kg" in impact_res.json()["data"]

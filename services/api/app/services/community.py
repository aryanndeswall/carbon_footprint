from sqlalchemy.orm import Session
from sqlalchemy import cast, Date, func, and_
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List, Dict, Any

from app.models.community import (
    Group,
    GroupMember,
    Challenge,
    ChallengeParticipant,
    LeaderboardSnapshot
)
from app.models.user import User
from app.models.mission import UserMission, MissionTemplate
from app.models.streak import UserStreak
from app.models.activity import ActivityEvent

from app.repositories.community import (
    GroupRepository,
    GroupMemberRepository,
    ChallengeRepository,
    ChallengeParticipantRepository,
    LeaderboardRepository
)

class GroupService:
    def __init__(self, db: Session):
        self.db = db
        self.group_repo = GroupRepository(db)
        self.member_repo = GroupMemberRepository(db)

    def create_group(self, name: str, description: Optional[str], group_type: str, creator_id: UUID) -> Group:
        # Check if user exists
        user = self.db.query(User).filter(User.id == creator_id).first()
        if not user:
            raise ValueError("Creator user not found")

        group = Group(
            name=name,
            description=description,
            group_type=group_type,
            created_by=creator_id
        )
        created_group = self.group_repo.create(group)

        # Creator automatically joins the group
        member = GroupMember(
            group_id=created_group.id,
            user_id=creator_id
        )
        self.member_repo.add_member(member)
        return created_group

    def list_groups(self) -> List[Group]:
        return self.group_repo.list_all_groups()

    def get_group(self, group_id: UUID) -> Optional[Group]:
        return self.group_repo.get_by_id(group_id)

    def join_group(self, group_id: UUID, user_id: UUID) -> GroupMember:
        # Check if group exists
        group = self.group_repo.get_by_id(group_id)
        if not group:
            raise ValueError("Group not found")

        # Check if user exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Check if already a member
        existing = self.member_repo.get_member(group_id, user_id)
        if existing:
            raise ValueError("User is already a member of this group")

        member = GroupMember(
            group_id=group_id,
            user_id=user_id
        )
        return self.member_repo.add_member(member)

    def leave_group(self, group_id: UUID, user_id: UUID) -> None:
        member = self.member_repo.get_member(group_id, user_id)
        if not member:
            raise ValueError("User is not a member of this group")
        
        self.db.delete(member)
        self.db.commit()

    def get_members_count(self, group_id: UUID) -> int:
        return self.member_repo.get_members_count(group_id)


class ChallengeService:
    def __init__(self, db: Session):
        self.db = db
        self.challenge_repo = ChallengeRepository(db)
        self.participant_repo = ChallengeParticipantRepository(db)

    def create_challenge(self, title: str, description: Optional[str], challenge_type: str, start_date: date, end_date: date) -> Challenge:
        challenge = Challenge(
            title=title,
            description=description,
            challenge_type=challenge_type,
            start_date=start_date,
            end_date=end_date
        )
        return self.challenge_repo.create(challenge)

    def list_challenges(self) -> List[Challenge]:
        return self.challenge_repo.list_all_challenges()

    def get_challenge(self, challenge_id: UUID) -> Optional[Challenge]:
        return self.challenge_repo.get_by_id(challenge_id)

    def join_challenge(self, challenge_id: UUID, user_id: UUID) -> ChallengeParticipant:
        # Check if challenge exists
        challenge = self.challenge_repo.get_by_id(challenge_id)
        if not challenge:
            raise ValueError("Challenge not found")

        # Check if user exists
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")

        # Check if already participating
        existing = self.participant_repo.get_participant(challenge_id, user_id)
        if existing:
            raise ValueError("User is already participating in this challenge")

        participant = ChallengeParticipant(
            challenge_id=challenge_id,
            user_id=user_id,
            progress_score=0.0
        )
        return self.participant_repo.add_participant(participant)

    def get_challenge_participants(self, challenge_id: UUID) -> List[Dict[str, Any]]:
        # Retrieve participants and join with User to get details
        participants = (
            self.db.query(ChallengeParticipant, User)
            .join(User, ChallengeParticipant.user_id == User.id)
            .filter(ChallengeParticipant.challenge_id == challenge_id)
            .order_by(ChallengeParticipant.progress_score.desc())
            .all()
        )
        
        result = []
        for p, u in participants:
            result.append({
                "id": p.id,
                "challenge_id": p.challenge_id,
                "user_id": p.user_id,
                "progress_score": p.progress_score,
                "created_at": p.created_at,
                "full_name": u.full_name,
                "avatar_url": u.avatar_url
            })
        return result


class LeaderboardService:
    def __init__(self, db: Session):
        self.db = db
        self.leaderboard_repo = LeaderboardRepository(db)

    def calculate_score(self, user_id: UUID, target_date: date) -> float:
        # Start and end dates for the 30-day window
        start_date = target_date - timedelta(days=29)

        # 1. Mission Completion (40%): (completed_missions / assigned_missions_in_30d) * 40
        missions = (
            self.db.query(UserMission)
            .filter(
                UserMission.user_id == user_id,
                UserMission.assigned_date >= start_date,
                UserMission.assigned_date <= target_date
            )
            .all()
        )
        assigned_missions_count = len(missions)
        completed_missions_count = sum(1 for m in missions if m.status == "completed")

        if assigned_missions_count > 0:
            mission_score = (completed_missions_count / assigned_missions_count) * 40.0
        else:
            mission_score = 0.0

        # 2. Consistency (30%): (days_logged_activity_in_30d / 30) * 30
        active_days = (
            self.db.query(func.count(func.distinct(cast(ActivityEvent.created_at, Date))))
            .filter(
                ActivityEvent.user_id == user_id,
                cast(ActivityEvent.created_at, Date) >= start_date,
                cast(ActivityEvent.created_at, Date) <= target_date
            )
            .scalar()
        ) or 0
        consistency_score = float(active_days)  # (active_days / 30) * 30 = active_days

        # 3. Streaks (20%): min(current_streak / 10, 1) * 20
        streak_obj = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        current_streak = streak_obj.current_streak if streak_obj else 0
        streak_score = min(current_streak / 10.0, 1.0) * 20.0

        # 4. Carbon Savings (10%): min(total_saved_co2_in_30d / 20.0, 1) * 10
        total_savings = (
            self.db.query(func.sum(MissionTemplate.estimated_co2_saving))
            .select_from(UserMission)
            .join(MissionTemplate, UserMission.mission_template_id == MissionTemplate.id)
            .filter(
                UserMission.user_id == user_id,
                UserMission.assigned_date >= start_date,
                UserMission.assigned_date <= target_date,
                UserMission.status == "completed"
            )
            .scalar()
        ) or 0.0
        
        savings_score = min(float(total_savings) / 20.0, 1.0) * 10.0

        total_score = mission_score + consistency_score + streak_score + savings_score
        return round(total_score, 2)

    def generate_leaderboard_snapshots(self, target_date: date, group_id: Optional[UUID] = None) -> List[LeaderboardSnapshot]:
        if group_id:
            # Query members of the group
            members = (
                self.db.query(GroupMember)
                .filter(GroupMember.group_id == group_id)
                .all()
            )
            user_ids = [m.user_id for m in members]
        else:
            # Query all users
            users = self.db.query(User).all()
            user_ids = [u.id for u in users]

        # Calculate score for each user
        user_scores = []
        for uid in user_ids:
            score = self.calculate_score(uid, target_date)
            user_scores.append((uid, score))

        # Sort by score desc, user_id asc for deterministic ordering
        user_scores.sort(key=lambda x: (-x[1], x[0]))

        # Clear existing snapshots for that group and date
        self.leaderboard_repo.clear_snapshots_by_group_and_date(group_id, target_date)

        # Save new snapshots
        snapshots = []
        for rank_idx, (uid, score) in enumerate(user_scores, start=1):
            snapshot = LeaderboardSnapshot(
                group_id=group_id,
                user_id=uid,
                rank=rank_idx,
                score=score,
                snapshot_date=target_date
            )
            snapshots.append(self.leaderboard_repo.create_snapshot(snapshot))

        return snapshots

    def get_leaderboard(self, target_date: date, group_id: Optional[UUID] = None) -> List[Dict[str, Any]]:
        # Check if snapshots exist for target date
        if group_id:
            snapshots = self.leaderboard_repo.get_snapshots_by_group(group_id, target_date)
        else:
            snapshots = self.leaderboard_repo.get_global_snapshots(target_date)

        # If no snapshots, generate them on the fly
        if not snapshots:
            snapshots = self.generate_leaderboard_snapshots(target_date, group_id)

        # Join User details
        result = []
        for snap in snapshots:
            user = self.db.query(User).filter(User.id == snap.user_id).first()
            result.append({
                "user_id": snap.user_id,
                "full_name": user.full_name if user else None,
                "avatar_url": user.avatar_url if user else None,
                "rank": snap.rank,
                "score": snap.score
            })
        return result


class CommunityImpactService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_community_impact(self, group_id: Optional[UUID] = None, days: int = 30) -> float:
        # Start date for the window
        start_date = date.today() - timedelta(days=days - 1)

        # Base query to sum estimated_co2_saving from completed user missions
        query = (
            self.db.query(func.sum(MissionTemplate.estimated_co2_saving))
            .select_from(UserMission)
            .join(MissionTemplate, UserMission.mission_template_id == MissionTemplate.id)
            .filter(
                UserMission.assigned_date >= start_date,
                UserMission.status == "completed"
            )
        )

        if group_id:
            from sqlalchemy import select
            member_ids_select = (
                select(GroupMember.user_id)
                .filter(GroupMember.group_id == group_id)
            )
            query = query.filter(UserMission.user_id.in_(member_ids_select))

        total_savings = query.scalar() or 0.0
        return float(total_savings)

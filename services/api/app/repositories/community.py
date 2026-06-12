from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from datetime import date

from app.models.community import (
    Group,
    GroupMember,
    Challenge,
    ChallengeParticipant,
    LeaderboardSnapshot
)

class GroupRepository:
    """
    CRUD repository for the Group model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, group_id: UUID) -> Optional[Group]:
        return self.db.query(Group).filter(Group.id == group_id).first()

    def list_all_groups(self) -> List[Group]:
        return self.db.query(Group).order_by(Group.created_at.desc()).all()

    def create(self, group: Group) -> Group:
        self.db.add(group)
        self.db.commit()
        self.db.refresh(group)
        return group


class GroupMemberRepository:
    """
    CRUD repository for the GroupMember model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_member(self, group_id: UUID, user_id: UUID) -> Optional[GroupMember]:
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
            .first()
        )

    def get_group_members(self, group_id: UUID) -> List[GroupMember]:
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id)
            .order_by(GroupMember.joined_at.asc())
            .all()
        )

    def get_members_count(self, group_id: UUID) -> int:
        return self.db.query(GroupMember).filter(GroupMember.group_id == group_id).count()

    def add_member(self, member: GroupMember) -> GroupMember:
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member


class ChallengeRepository:
    """
    CRUD repository for the Challenge model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, challenge_id: UUID) -> Optional[Challenge]:
        return self.db.query(Challenge).filter(Challenge.id == challenge_id).first()

    def list_all_challenges(self) -> List[Challenge]:
        return self.db.query(Challenge).order_by(Challenge.start_date.desc()).all()

    def create(self, challenge: Challenge) -> Challenge:
        self.db.add(challenge)
        self.db.commit()
        self.db.refresh(challenge)
        return challenge


class ChallengeParticipantRepository:
    """
    CRUD repository for the ChallengeParticipant model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_participant(self, challenge_id: UUID, user_id: UUID) -> Optional[ChallengeParticipant]:
        return (
            self.db.query(ChallengeParticipant)
            .filter(
                ChallengeParticipant.challenge_id == challenge_id,
                ChallengeParticipant.user_id == user_id
            )
            .first()
        )

    def get_challenge_participants(self, challenge_id: UUID) -> List[ChallengeParticipant]:
        return (
            self.db.query(ChallengeParticipant)
            .filter(ChallengeParticipant.challenge_id == challenge_id)
            .order_by(ChallengeParticipant.progress_score.desc())
            .all()
        )

    def add_participant(self, participant: ChallengeParticipant) -> ChallengeParticipant:
        self.db.add(participant)
        self.db.commit()
        self.db.refresh(participant)
        return participant


class LeaderboardRepository:
    """
    CRUD repository for the LeaderboardSnapshot model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_snapshots_by_group(self, group_id: UUID, target_date: date) -> List[LeaderboardSnapshot]:
        return (
            self.db.query(LeaderboardSnapshot)
            .filter(
                LeaderboardSnapshot.group_id == group_id,
                LeaderboardSnapshot.snapshot_date == target_date
            )
            .order_by(LeaderboardSnapshot.rank.asc())
            .all()
        )

    def get_global_snapshots(self, target_date: date) -> List[LeaderboardSnapshot]:
        return (
            self.db.query(LeaderboardSnapshot)
            .filter(
                LeaderboardSnapshot.group_id.is_(None),
                LeaderboardSnapshot.snapshot_date == target_date
            )
            .order_by(LeaderboardSnapshot.rank.asc())
            .all()
        )

    def clear_snapshots_by_group_and_date(self, group_id: Optional[UUID], target_date: date) -> None:
        self.db.query(LeaderboardSnapshot).filter(
            LeaderboardSnapshot.group_id == group_id,
            LeaderboardSnapshot.snapshot_date == target_date
        ).delete()
        self.db.commit()

    def create_snapshot(self, snapshot: LeaderboardSnapshot) -> LeaderboardSnapshot:
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Date, Float, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class Group(Base):
    """
    SQLAlchemy model for representing social teams/groups.
    """
    __tablename__ = "groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    group_type = Column(String(50), nullable=False) # e.g. friends, college, department, organization, custom
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    creator = relationship("User", backref="created_groups")


class GroupMember(Base):
    """
    SQLAlchemy model representing the membership join table for groups.
    """
    __tablename__ = "group_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    group = relationship("Group", backref="members")
    user = relationship("User", backref="group_memberships")

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="uq_group_user"),
    )


class Challenge(Base):
    """
    SQLAlchemy model representing competitive sustainability challenges.
    """
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    challenge_type = Column(String(50), nullable=False) # e.g. mission_completion, carbon_reduction, streak_growth, activity_logging, mixed
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class ChallengeParticipant(Base):
    """
    SQLAlchemy model representing challenge participation and user progress.
    """
    __tablename__ = "challenge_participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    progress_score = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    challenge = relationship("Challenge", backref="participants")
    user = relationship("User", backref="challenge_participations")

    __table_args__ = (
        UniqueConstraint("challenge_id", "user_id", name="uq_challenge_user"),
    )


class LeaderboardSnapshot(Base):
    """
    SQLAlchemy model representing a calculated, frozen state of ranks/scores.
    """
    __tablename__ = "leaderboard_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rank = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    snapshot_date = Column(Date, nullable=False)

    group = relationship("Group", backref="leaderboard_snapshots")
    user = relationship("User", backref="leaderboard_ranks")

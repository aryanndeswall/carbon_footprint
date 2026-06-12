import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class SustainabilityScore(Base):
    """
    SQLAlchemy database model representing a user's current sustainability scores.
    """
    __tablename__ = "sustainability_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overall_score = Column(Integer, nullable=False, default=0)
    consistency_score = Column(Integer, nullable=False, default=0)
    mission_score = Column(Integer, nullable=False, default=0)
    streak_score = Column(Integer, nullable=False, default=0)
    improvement_score = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="sustainability_score")


class Achievement(Base):
    """
    SQLAlchemy database model for system-defined gamified achievements/badges.
    """
    __tablename__ = "achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    badge_icon = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True)  # missions, streaks, community, carbon_reduction, logging, special
    points = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class UserAchievement(Base):
    """
    SQLAlchemy database model representing achievements earned by users.
    """
    __tablename__ = "user_achievements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True)
    earned_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="user_achievements")
    achievement = relationship("Achievement", backref="user_earners")

    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )


class ScoreHistory(Base):
    """
    SQLAlchemy database model tracking score trends over time for analytics.
    """
    __tablename__ = "score_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="score_history")

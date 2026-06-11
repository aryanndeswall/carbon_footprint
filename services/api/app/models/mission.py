import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class MissionTemplate(Base):
    """
    SQLAlchemy database model for master mission templates.
    """
    __tablename__ = "mission_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    category = Column(String(50), nullable=False, index=True)
    difficulty = Column(String(20), nullable=False, index=True)
    estimated_co2_saving = Column(Numeric(precision=12, scale=4), nullable=False)
    estimated_time_minutes = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class UserMission(Base):
    """
    SQLAlchemy database model for tracking daily personalized mission assignments.
    """
    __tablename__ = "user_missions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mission_template_id = Column(UUID(as_uuid=True), ForeignKey("mission_templates.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="assigned", index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="user_missions")
    template = relationship("MissionTemplate")

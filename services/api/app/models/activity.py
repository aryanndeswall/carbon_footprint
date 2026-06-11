import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base

class ActivityEvent(Base):
    """
    SQLAlchemy database model for tracking logged activities.
    Activities are immutable and represent carbon-producing events.
    """
    __tablename__ = "activity_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False, index=True)
    quantity = Column(Numeric(precision=12, scale=4), nullable=False)
    unit = Column(String(50), nullable=False)
    metadata_json = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="activity_events")

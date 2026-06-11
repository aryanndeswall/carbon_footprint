import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database.session import Base

class EmissionFactor(Base):
    """
    SQLAlchemy database model for storing versioned emission factors.
    Each row represents a conversion factor for a specific activity type.
    """
    __tablename__ = "emission_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(50), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False, index=True)
    unit = Column(String(50), nullable=False)
    factor_value = Column(Numeric(precision=12, scale=6), nullable=False)
    factor_source = Column(String(255), nullable=True)
    version = Column(Integer, nullable=False, default=1)
    effective_from = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

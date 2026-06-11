import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Date, Numeric, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base

class DailyFootprint(Base):
    """
    SQLAlchemy database model for tracking daily aggregated carbon emissions for a user.
    """
    __tablename__ = "daily_footprints"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    
    transport_emissions = Column(Numeric(precision=12, scale=4), nullable=False, default=0.0)
    food_emissions = Column(Numeric(precision=12, scale=4), nullable=False, default=0.0)
    electricity_emissions = Column(Numeric(precision=12, scale=4), nullable=False, default=0.0)
    shopping_emissions = Column(Numeric(precision=12, scale=4), nullable=False, default=0.0)
    total_emissions = Column(Numeric(precision=12, scale=4), nullable=False, default=0.0)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="daily_footprints")
    sources = relationship("DailyFootprintSource", back_populates="daily_footprint", cascade="all, delete-orphan")


class DailyFootprintSource(Base):
    """
    SQLAlchemy database model for auditing the activities and emission factors
    that make up a user's daily footprint.
    """
    __tablename__ = "daily_footprint_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    daily_footprint_id = Column(UUID(as_uuid=True), ForeignKey("daily_footprints.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(UUID(as_uuid=True), ForeignKey("activity_events.id", ondelete="CASCADE"), nullable=False, index=True)
    emission_factor_id = Column(UUID(as_uuid=True), ForeignKey("emission_factors.id", ondelete="CASCADE"), nullable=False, index=True)
    calculated_emission = Column(Numeric(precision=12, scale=4), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    daily_footprint = relationship("DailyFootprint", back_populates="sources")
    activity = relationship("ActivityEvent")
    emission_factor = relationship("EmissionFactor")

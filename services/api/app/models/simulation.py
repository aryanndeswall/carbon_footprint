import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base

class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_name = Column(String(255), nullable=False)
    scenario_type = Column(String(100), nullable=False)
    parameters = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="simulation_scenarios")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_footprint = Column(Float, nullable=False)
    predicted_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    scenario = relationship("SimulationScenario", back_populates="results")


class SimulationHistory(Base):
    __tablename__ = "simulation_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    executed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="simulation_history")
    scenario = relationship("SimulationScenario", backref="history")

# Establish back_populates for results on SimulationScenario
SimulationScenario.results = relationship("SimulationResult", order_by=SimulationResult.generated_at, back_populates="scenario", cascade="all, delete-orphan")

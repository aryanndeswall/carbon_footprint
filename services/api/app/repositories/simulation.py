from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from app.models.simulation import SimulationScenario, SimulationResult, SimulationHistory

class SimulationScenarioRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, scenario_id: UUID) -> Optional[SimulationScenario]:
        return self.db.query(SimulationScenario).filter(SimulationScenario.id == scenario_id).first()

    def list_by_user(self, user_id: UUID) -> List[SimulationScenario]:
        return (
            self.db.query(SimulationScenario)
            .filter(SimulationScenario.user_id == user_id)
            .order_by(SimulationScenario.created_at.desc())
            .all()
        )

    def create(self, scenario: SimulationScenario) -> SimulationScenario:
        self.db.add(scenario)
        self.db.commit()
        self.db.refresh(scenario)
        return scenario

    def delete(self, scenario: SimulationScenario) -> None:
        self.db.delete(scenario)
        self.db.commit()


class SimulationResultRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, result_id: UUID) -> Optional[SimulationResult]:
        return self.db.query(SimulationResult).filter(SimulationResult.id == result_id).first()

    def get_by_scenario_id(self, scenario_id: UUID) -> Optional[SimulationResult]:
        return self.db.query(SimulationResult).filter(SimulationResult.scenario_id == scenario_id).first()

    def create(self, result: SimulationResult) -> SimulationResult:
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result


class SimulationHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, history_id: UUID) -> Optional[SimulationHistory]:
        return self.db.query(SimulationHistory).filter(SimulationHistory.id == history_id).first()

    def list_by_user(self, user_id: UUID, limit: int = 30) -> List[SimulationHistory]:
        return (
            self.db.query(SimulationHistory)
            .filter(SimulationHistory.user_id == user_id)
            .order_by(SimulationHistory.executed_at.desc())
            .limit(limit)
            .all()
        )

    def create(self, history: SimulationHistory) -> SimulationHistory:
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

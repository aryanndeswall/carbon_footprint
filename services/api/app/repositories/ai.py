from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import Optional, List, Tuple
from app.models.ai import AIInsight, AIGenerationLog

class AIInsightRepository:
    """
    CRUD repository for database queries and mutations on the AIInsight model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, insight_id: UUID) -> Optional[AIInsight]:
        """
        Retrieve a single AI insight by its ID.
        """
        return self.db.query(AIInsight).filter(AIInsight.id == insight_id).first()

    def get_latest_by_type(self, user_id: UUID, insight_type: str) -> Optional[AIInsight]:
        """
        Retrieve the latest generated insight of a specific type for a user.
        """
        return (
            self.db.query(AIInsight)
            .filter(AIInsight.user_id == user_id, AIInsight.insight_type == insight_type)
            .order_by(AIInsight.created_at.desc())
            .first()
        )

    def get_history(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[AIInsight], int]:
        """
        Queries and returns a paginated list of AI insights for a user.
        Returns a tuple of (list of insights, total count of matching insights).
        """
        query = self.db.query(AIInsight).filter(AIInsight.user_id == user_id)
        total_count = query.count()
        offset = (page - 1) * page_size
        insights = (
            query.order_by(AIInsight.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return insights, total_count

    def create(self, insight: AIInsight) -> AIInsight:
        """
        Insert a new AI insight.
        """
        self.db.add(insight)
        self.db.commit()
        self.db.refresh(insight)
        return insight

    def delete(self, insight: AIInsight) -> None:
        """
        Delete an AI insight.
        """
        self.db.delete(insight)
        self.db.commit()


class AIGenerationLogRepository:
    """
    CRUD repository for database queries and mutations on the AIGenerationLog model.
    """
    def __init__(self, db: Session):
        self.db = db

    def create(self, log: AIGenerationLog) -> AIGenerationLog:
        """
        Insert a new AI generation log.
        """
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_average_generation_time_ms(self, prompt_type: str) -> Optional[float]:
        """
        Calculate the average generation time in milliseconds for a prompt type.
        """
        result = (
            self.db.query(func.avg(AIGenerationLog.generation_time_ms))
            .filter(AIGenerationLog.prompt_type == prompt_type, AIGenerationLog.status == "success")
            .scalar()
        )
        return float(result) if result is not None else None

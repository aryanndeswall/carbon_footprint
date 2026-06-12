from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Tuple
from app.models.ai_memory import UserMemory, MemoryRetrievalLog

class MemoryRepository:
    """
    CRUD repository for database queries and mutations on the UserMemory model.
    Supports pgvector similarity searches.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, memory_id: UUID) -> Optional[UserMemory]:
        """
        Retrieve a single memory by its ID.
        """
        return self.db.query(UserMemory).filter(UserMemory.id == memory_id).first()

    def get_by_user(self, user_id: UUID) -> List[UserMemory]:
        """
        Retrieve all memories for a user.
        """
        return (
            self.db.query(UserMemory)
            .filter(UserMemory.user_id == user_id)
            .order_by(UserMemory.created_at.desc())
            .all()
        )

    def create(self, memory: UserMemory) -> UserMemory:
        """
        Insert a new memory.
        """
        self.db.add(memory)
        self.db.commit()
        self.db.refresh(memory)
        return memory

    def clear_user_memories(self, user_id: UUID) -> None:
        """
        Delete all memories for a user.
        """
        self.db.query(UserMemory).filter(UserMemory.user_id == user_id).delete()
        self.db.commit()

    def search_similar_memories(
        self, user_id: UUID, query_embedding: List[float], limit: int = 5
    ) -> List[UserMemory]:
        """
        Perform a semantic similarity search using pgvector's cosine distance operator (<=>).
        """
        return (
            self.db.query(UserMemory)
            .filter(UserMemory.user_id == user_id)
            .order_by(UserMemory.embedding.op("<=>")(query_embedding))
            .limit(limit)
            .all()
        )


class MemoryRetrievalLogRepository:
    """
    CRUD repository for database queries and mutations on the MemoryRetrievalLog model.
    """
    def __init__(self, db: Session):
        self.db = db

    def create(self, log: MemoryRetrievalLog) -> MemoryRetrievalLog:
        """
        Insert a new retrieval log.
        """
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_user_logs(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[MemoryRetrievalLog], int]:
        """
        Retrieve paginated retrieval history logs for a user.
        """
        query = self.db.query(MemoryRetrievalLog).filter(MemoryRetrievalLog.user_id == user_id)
        total_count = query.count()
        offset = (page - 1) * page_size
        logs = (
            query.order_by(MemoryRetrievalLog.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return logs, total_count

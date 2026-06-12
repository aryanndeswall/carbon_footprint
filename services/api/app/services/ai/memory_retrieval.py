import logging
from datetime import datetime, timezone
from uuid import UUID
from typing import List
from sqlalchemy.orm import Session

from app.models.ai_memory import UserMemory, MemoryRetrievalLog
from app.repositories.user import UserRepository
from app.repositories.ai_memory import MemoryRepository, MemoryRetrievalLogRepository
from app.services.ai.embedding import EmbeddingService

logger = logging.getLogger(__name__)

class MemoryRetrievalService:
    """
    Orchestration service for performing semantic searches against user behavioral memories
    and logging retrieval actions.
    """
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.memory_repo = MemoryRepository(db)
        self.log_repo = MemoryRetrievalLogRepository(db)
        self.embedding_service = EmbeddingService()

    def retrieve_similar_memories(
        self, auth_user_id: UUID, query_text: str, query_type: str = "semantic_search", limit: int = 5
    ) -> List[UserMemory]:
        """
        Convert query text to vector embedding, retrieve top similar memories from pgvector,
        and log the retrieval audit trail.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        memories = []
        try:
            # 1. Generate query embedding
            query_embedding = self.embedding_service.get_embedding(query_text)

            # 2. Query pgvector using similarity operator
            memories = self.memory_repo.search_similar_memories(user.id, query_embedding, limit)
        except Exception as e:
            logger.error(f"Failed semantic memory search: {str(e)}")

        # 3. Write retrieval log
        try:
            log = MemoryRetrievalLog(
                user_id=user.id,
                query_type=query_type,
                memories_retrieved=len(memories),
                created_at=datetime.now(timezone.utc)
            )
            self.log_repo.create(log)
        except Exception as e:
            logger.error(f"Failed to log memory retrieval audit: {str(e)}")

        return memories

    def get_retrieval_history(
        self, auth_user_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple:
        """
        Get paginated memory retrieval logs.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.log_repo.get_user_logs(user.id, page, page_size)

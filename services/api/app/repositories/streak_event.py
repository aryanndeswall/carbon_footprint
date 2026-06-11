from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Tuple
from app.models.streak import StreakEvent

class StreakEventRepository:
    """
    CRUD repository for database queries and mutations on the StreakEvent model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, event_id: UUID) -> Optional[StreakEvent]:
        """
        Retrieve a single streak event by its ID.
        """
        return self.db.query(StreakEvent).filter(StreakEvent.id == event_id).first()

    def get_by_user_id_paginated(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[StreakEvent], int]:
        """
        Queries and returns a paginated list of streak events for a user, ordered by date descending.
        Returns a tuple of (list of events, total count of events).
        """
        query = self.db.query(StreakEvent).filter(StreakEvent.user_id == user_id)
        total_count = query.count()
        offset = (page - 1) * page_size
        events = (
            query.order_by(StreakEvent.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return events, total_count

    def create(self, event: StreakEvent) -> StreakEvent:
        """
        Insert a new streak event record.
        """
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

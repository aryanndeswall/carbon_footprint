from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Tuple
from datetime import datetime
from app.models.activity import ActivityEvent

class ActivityRepository:
    """
    CRUD repository for database queries and mutations on the ActivityEvent model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, activity_id: UUID) -> Optional[ActivityEvent]:
        """
        Retrieve a single activity event by its ID.
        """
        return self.db.query(ActivityEvent).filter(ActivityEvent.id == activity_id).first()

    def create(self, activity: ActivityEvent) -> ActivityEvent:
        """
        Insert a new activity event.
        """
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def get_user_activities(
        self,
        user_id: UUID,
        category: Optional[str] = None,
        activity_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ActivityEvent], int]:
        """
        Queries and returns a paginated list of activities scoped to a user, with filters.
        Returns a tuple of (list of activities, total count of matching activities).
        """
        query = self.db.query(ActivityEvent).filter(ActivityEvent.user_id == user_id)

        if category:
            query = query.filter(ActivityEvent.category == category)
        if activity_type:
            query = query.filter(ActivityEvent.activity_type == activity_type)
        if start_date:
            query = query.filter(ActivityEvent.created_at >= start_date)
        if end_date:
            query = query.filter(ActivityEvent.created_at <= end_date)

        total_count = query.count()

        offset = (page - 1) * page_size
        activities = (
            query.order_by(ActivityEvent.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        return activities, total_count

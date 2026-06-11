from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Tuple
from datetime import date
from app.models.mission import UserMission

class UserMissionRepository:
    """
    CRUD repository for database queries and mutations on the UserMission model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_mission_id: UUID) -> Optional[UserMission]:
        """
        Retrieve a single user mission by its ID.
        """
        return self.db.query(UserMission).filter(UserMission.id == user_mission_id).first()

    def get_by_user_and_date(self, user_id: UUID, target_date: date) -> Optional[UserMission]:
        """
        Retrieve the assigned mission for a user on a specific date.
        """
        return (
            self.db.query(UserMission)
            .filter(UserMission.user_id == user_id, UserMission.assigned_date == target_date)
            .first()
        )

    def get_user_recent_missions(self, user_id: UUID, days: int = 5) -> List[UserMission]:
        """
        Retrieves the assigned missions for a user in the last N days (inclusive).
        """
        # Calculate N days ago date
        from datetime import datetime, timezone, timedelta
        cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=days)
        return (
            self.db.query(UserMission)
            .filter(UserMission.user_id == user_id, UserMission.assigned_date >= cutoff_date)
            .all()
        )

    def get_user_missions_history(
        self, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[UserMission], int]:
        """
        Queries and returns a paginated list of user missions (completed or assigned).
        Returns a tuple of (list of missions, total count of matching missions).
        """
        query = self.db.query(UserMission).filter(UserMission.user_id == user_id)
        total_count = query.count()
        offset = (page - 1) * page_size
        missions = (
            query.order_by(UserMission.assigned_date.desc(), UserMission.created_at.desc())
            .offset(offset)
            .limit(page_size)
            .all()
        )
        return missions, total_count

    def create(self, user_mission: UserMission) -> UserMission:
        """
        Insert a new user mission assignment.
        """
        self.db.add(user_mission)
        self.db.commit()
        self.db.refresh(user_mission)
        return user_mission

    def update(self, user_mission: UserMission) -> UserMission:
        """
        Update user mission status or completion.
        """
        self.db.commit()
        self.db.refresh(user_mission)
        return user_mission

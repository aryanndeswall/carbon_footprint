from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.models.streak import UserStreak

class UserStreakRepository:
    """
    CRUD repository for database queries and mutations on the UserStreak model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, streak_id: UUID) -> Optional[UserStreak]:
        """
        Retrieve a single user streak by its ID.
        """
        return self.db.query(UserStreak).filter(UserStreak.id == streak_id).first()

    def get_by_user_id(self, user_id: UUID) -> Optional[UserStreak]:
        """
        Retrieve the streak record for a specific user.
        """
        return self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()

    def create(self, streak: UserStreak) -> UserStreak:
        """
        Insert a new user streak record.
        """
        self.db.add(streak)
        self.db.commit()
        self.db.refresh(streak)
        return streak

    def update(self, streak: UserStreak) -> UserStreak:
        """
        Update user streak stats.
        """
        self.db.commit()
        self.db.refresh(streak)
        return streak

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional
from app.models.user import User, UserPreference

class UserRepository:
    """
    CRUD repository for the User model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_auth_user_id(self, auth_user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.auth_user_id == auth_user_id).first()

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()


class UserPreferenceRepository:
    """
    CRUD repository for the UserPreference model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, preference_id: UUID) -> Optional[UserPreference]:
        return self.db.query(UserPreference).filter(UserPreference.id == preference_id).first()

    def get_by_user_id(self, user_id: UUID) -> Optional[UserPreference]:
        return self.db.query(UserPreference).filter(UserPreference.user_id == user_id).first()

    def create(self, preference: UserPreference) -> UserPreference:
        self.db.add(preference)
        self.db.commit()
        self.db.refresh(preference)
        return preference

    def update(self, preference: UserPreference) -> UserPreference:
        self.db.commit()
        self.db.refresh(preference)
        return preference

    def delete(self, preference: UserPreference) -> None:
        self.db.delete(preference)
        self.db.commit()

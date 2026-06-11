from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, Any
from app.models.user import User, UserPreference
from app.repositories.user import UserRepository, UserPreferenceRepository

class UserService:
    """
    Service layer containing user and user preferences business logic.
    """
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.preference_repo = UserPreferenceRepository(db)

    def get_or_create_user(self, auth_user_id: UUID, email: str) -> User:
        """
        Retrieves user by auth_user_id, or creates a new one with default preferences if not found.
        (First Login Flow)
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            # Create user profile
            user = User(
                auth_user_id=auth_user_id,
                email=email,
                full_name=None,
                avatar_url=None
            )
            user = self.user_repo.create(user)

            # Create default preferences
            preferences = UserPreference(
                user_id=user.id,
                state_code=None,
                diet_type=None,
                transport_preference=None,
                housing_type=None,
                notification_enabled=True
            )
            self.preference_repo.create(preferences)
        return user

    def get_user_profile(self, auth_user_id: UUID) -> Optional[User]:
        """
        Gets a user profile by auth_user_id.
        """
        return self.user_repo.get_by_auth_user_id(auth_user_id)

    def update_user_profile(self, auth_user_id: UUID, full_name: Optional[str] = None, avatar_url: Optional[str] = None) -> Optional[User]:
        """
        Updates a user profile.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            return None
        if full_name is not None:
            user.full_name = full_name
        if avatar_url is not None:
            user.avatar_url = avatar_url
        return self.user_repo.update(user)

    def get_user_preferences(self, auth_user_id: UUID) -> Optional[UserPreference]:
        """
        Gets a user's preferences by auth_user_id.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            return None
        return self.preference_repo.get_by_user_id(user.id)

    def update_user_preferences(self, auth_user_id: UUID, **kwargs: Any) -> Optional[UserPreference]:
        """
        Updates a user's preferences.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            return None
        pref = self.preference_repo.get_by_user_id(user.id)
        if not pref:
            # Fallback if preferences don't exist
            pref = UserPreference(
                user_id=user.id,
                notification_enabled=True
            )
            pref = self.preference_repo.create(pref)

        for key, value in kwargs.items():
            if value is not None and hasattr(pref, key):
                setattr(pref, key, value)
        return self.preference_repo.update(pref)

    def complete_onboarding(
        self,
        auth_user_id: UUID,
        state_code: str,
        diet_type: str,
        transport_preference: str,
        housing_type: str
    ) -> Optional[UserPreference]:
        """
        Completes the user onboarding by updating their preferences.
        """
        return self.update_user_preferences(
            auth_user_id=auth_user_id,
            state_code=state_code,
            diet_type=diet_type,
            transport_preference=transport_preference,
            housing_type=housing_type
        )

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List, Any, Dict, Tuple
from datetime import datetime
from decimal import Decimal
from app.models.activity import ActivityEvent
from app.repositories.activity import ActivityRepository
from app.repositories.user import UserRepository

class ActivityService:
    """
    Service layer containing activity-related business logic and validation rules.
    """
    def __init__(self, db: Session):
        self.db = db
        self.activity_repo = ActivityRepository(db)
        self.user_repo = UserRepository(db)

    def create_activity(
        self,
        auth_user_id: UUID,
        category: str,
        activity_type: str,
        quantity: Decimal,
        unit: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> ActivityEvent:
        """
        Validates and logs a new activity event.
        Rejects negative quantities and invalid categories or activity types.
        """
        # Resolve user
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        # Validate negative quantities
        if quantity < 0:
            raise ValueError("Quantity cannot be negative")

        # Validate category and activity type
        allowed_types = {
            "transport": ["car", "bus", "metro", "train", "bike", "walk", "flight"],
            "food": ["vegetarian_meal", "vegan_meal", "chicken_meal", "mutton_meal", "beef_meal", "dairy"],
            "electricity": ["electricity_usage"],
            "shopping": ["clothing", "electronics", "general_purchase"]
        }

        if category not in allowed_types:
            raise ValueError(f"Invalid category '{category}'")

        if activity_type not in allowed_types[category]:
            raise ValueError(f"Invalid activity_type '{activity_type}' for category '{category}'")

        # Create model instance
        activity = ActivityEvent(
            user_id=user.id,
            category=category,
            activity_type=activity_type,
            quantity=quantity,
            unit=unit,
            metadata_json=metadata
        )

        created_activity = self.activity_repo.create(activity)

        # Trigger carbon engine to calculate emissions and update footprint
        from app.services.carbon_engine import CarbonEngineService
        engine_service = CarbonEngineService(self.db)
        engine_service.process_activity(created_activity)
        self.db.commit()

        return created_activity

    def get_activity_by_id(self, auth_user_id: UUID, activity_id: UUID) -> Optional[ActivityEvent]:
        """
        Get activity details by ID, enforcing user ownership.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            return None
        activity = self.activity_repo.get_by_id(activity_id)
        if not activity or activity.user_id != user.id:
            return None
        return activity

    def get_user_activities(
        self,
        auth_user_id: UUID,
        category: Optional[str] = None,
        activity_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ActivityEvent], int]:
        """
        Retrieve paginated list of user activities.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            return [], 0
        return self.activity_repo.get_user_activities(
            user_id=user.id,
            category=category,
            activity_type=activity_type,
            start_date=start_date,
            end_date=end_date,
            page=page,
            page_size=page_size
        )

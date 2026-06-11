from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.emission_factor import EmissionFactor

class FactorResolver:
    """
    Resolves the active emission factor for a given category and activity type.
    """
    def __init__(self, db: Session):
        self.db = db

    def resolve_factor(self, category: str, activity_type: str, at_time: Optional[datetime] = None) -> Optional[EmissionFactor]:
        """
        Retrieves the current active emission factor matching the category and activity_type.
        If at_time is specified, resolves the active factor for that specific timestamp.
        Otherwise, uses the current UTC time.
        
        Ordered by version descending and effective_from descending.
        """
        if at_time is None:
            at_time = datetime.now(timezone.utc)
            
        # Ensure at_time is timezone-aware
        if at_time.tzinfo is None:
            at_time = at_time.replace(tzinfo=timezone.utc)

        factor = (
            self.db.query(EmissionFactor)
            .filter(
                EmissionFactor.category == category,
                EmissionFactor.activity_type == activity_type,
                EmissionFactor.effective_from <= at_time
            )
            .order_by(desc(EmissionFactor.version), desc(EmissionFactor.effective_from))
            .first()
        )
        return factor

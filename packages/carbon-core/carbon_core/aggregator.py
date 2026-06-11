from datetime import date
from decimal import Decimal
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.footprint import DailyFootprint, DailyFootprintSource

class FootprintAggregator:
    """
    Manages aggregating emission results into daily footprints and saving audit trails.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_daily_footprint(self, user_id: UUID, target_date: date) -> DailyFootprint:
        """
        Retrieves an existing DailyFootprint record for the given user and date.
        If it doesn't exist, creates and returns a new DailyFootprint record (initialized to 0).
        """
        footprint = (
            self.db.query(DailyFootprint)
            .filter(DailyFootprint.user_id == user_id, DailyFootprint.date == target_date)
            .first()
        )
        if not footprint:
            footprint = DailyFootprint(
                user_id=user_id,
                date=target_date,
                transport_emissions=Decimal('0.0'),
                food_emissions=Decimal('0.0'),
                electricity_emissions=Decimal('0.0'),
                shopping_emissions=Decimal('0.0'),
                total_emissions=Decimal('0.0')
            )
            self.db.add(footprint)
            self.db.flush()  # Populates footprint.id
        return footprint

    def add_activity_to_footprint(
        self,
        footprint: DailyFootprint,
        activity_id: UUID,
        emission_factor_id: UUID,
        category: str,
        calculated_emission: Decimal
    ) -> DailyFootprintSource:
        """
        Adds a calculated emission to the DailyFootprint category and total.
        Creates and returns a DailyFootprintSource audit trail record.
        """
        # Determine which field to update based on category
        normalized_category = category.lower()
        if normalized_category == "transport":
            footprint.transport_emissions += calculated_emission
        elif normalized_category == "food":
            footprint.food_emissions += calculated_emission
        elif normalized_category == "electricity":
            footprint.electricity_emissions += calculated_emission
        elif normalized_category == "shopping":
            footprint.shopping_emissions += calculated_emission
        else:
            # Fallback/other category (though out of MVP scope, we handle it safely)
            pass

        # Update total
        footprint.total_emissions = (
            footprint.transport_emissions +
            footprint.food_emissions +
            footprint.electricity_emissions +
            footprint.shopping_emissions
        )

        # Create audit trail entry
        source = DailyFootprintSource(
            daily_footprint_id=footprint.id,
            activity_id=activity_id,
            emission_factor_id=emission_factor_id,
            calculated_emission=calculated_emission
        )
        self.db.add(source)
        self.db.flush()
        return source

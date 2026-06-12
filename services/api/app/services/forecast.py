from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from uuid import UUID
from app.models.footprint import DailyFootprint

class ForecastService:
    def __init__(self, db: Session):
        self.db = db

    def get_monthly_baseline_footprint(self, user_id: UUID) -> float:
        """
        Calculates the user's monthly footprint baseline based on the last 30 days.
        If no history exists, returns the default baseline 92.0.
        """
        today = datetime.now(timezone.utc).date()
        start_date = today - timedelta(days=29)

        # Get daily footprints in the last 30 days
        footprints = (
            self.db.query(DailyFootprint)
            .filter(
                DailyFootprint.user_id == user_id,
                DailyFootprint.date >= start_date,
                DailyFootprint.date <= today
            )
            .all()
        )

        if not footprints:
            return 92.0

        total_recorded = sum(float(fp.total_emissions) for fp in footprints)
        days_recorded = len(footprints)

        if days_recorded > 0:
            average_daily = total_recorded / days_recorded
            return average_daily * 30.0

        return 92.0

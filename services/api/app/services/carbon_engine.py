import sys
import os
from datetime import date
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

# Ensure carbon-core is in sys.path
packages_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/carbon-core"))
if packages_path not in sys.path:
    sys.path.insert(0, packages_path)

from app.models.activity import ActivityEvent  # noqa: E402
from app.models.footprint import DailyFootprint, DailyFootprintSource  # noqa: E402
from app.repositories.user import UserRepository  # noqa: E402

from carbon_core.resolver import FactorResolver  # noqa: E402
from carbon_core.calculator import CarbonCalculator  # noqa: E402
from carbon_core.aggregator import FootprintAggregator  # noqa: E402

CATEGORY_MAPPING = {
    "transport": {
        "car": "car_per_km",
        "bus": "bus_per_km",
        "metro": "metro_per_km",
        "train": "train_per_km",
        "flight": "flight_per_km",
        "bike": "bike_per_km",
        "walk": "walk_per_km"
    },
    "electricity": {
        "electricity_usage": "india_grid_kwh"
    }
}

def map_activity_type(category: str, activity_type: str) -> str:
    """
    Maps an activity_type to the corresponding emission factor activity_type.
    """
    category_map = CATEGORY_MAPPING.get(category.lower())
    if category_map:
        return category_map.get(activity_type.lower(), activity_type)
    return activity_type

class CarbonEngineService:
    """
    Orchestration service for resolving factors, calculating emissions,
    updating daily footprints, and serving aggregated results.
    """
    def __init__(self, db: Session):
        self.db = db
        self.resolver = FactorResolver(db)
        self.calculator = CarbonCalculator()
        self.aggregator = FootprintAggregator(db)
        self.user_repo = UserRepository(db)

    def process_activity(self, activity: ActivityEvent) -> DailyFootprintSource:
        """
        Processes a newly created activity event:
        1. Resolves the correct factor.
        2. Calculates the emissions.
        3. Updates the user's daily footprint.
        4. Writes the daily footprint source audit trail.
        """
        # Resolve factor
        mapped_type = map_activity_type(activity.category, activity.activity_type)
        factor = self.resolver.resolve_factor(activity.category, mapped_type, activity.created_at)
        if not factor:
            raise ValueError(f"Emission factor not found for category='{activity.category}', activity_type='{activity.activity_type}'")

        # Calculate emissions
        calculated_emission = self.calculator.calculate(activity.quantity, factor.factor_value)

        # Get or create daily footprint
        target_date = activity.created_at.date()
        footprint = self.aggregator.get_or_create_daily_footprint(activity.user_id, target_date)

        # Add activity details to footprint and register source audit trail
        source = self.aggregator.add_activity_to_footprint(
            footprint=footprint,
            activity_id=activity.id,
            emission_factor_id=factor.id,
            category=activity.category,
            calculated_emission=calculated_emission
        )
        return source

    def get_footprint_by_date(self, auth_user_id: UUID, target_date: date) -> dict:
        """
        Returns the carbon footprint totals for a single specific date.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        footprint = (
            self.db.query(DailyFootprint)
            .filter(DailyFootprint.user_id == user.id, DailyFootprint.date == target_date)
            .first()
        )
        if not footprint:
            return {
                "transport": 0.0,
                "food": 0.0,
                "electricity": 0.0,
                "shopping": 0.0,
                "total": 0.0,
                "transport_co2": 0.0,
                "food_co2": 0.0,
                "electricity_co2": 0.0,
                "shopping_co2": 0.0,
                "total_co2": 0.0
            }

        return {
            "transport": float(footprint.transport_emissions),
            "food": float(footprint.food_emissions),
            "electricity": float(footprint.electricity_emissions),
            "shopping": float(footprint.shopping_emissions),
            "total": float(footprint.total_emissions),
            "transport_co2": float(footprint.transport_emissions),
            "food_co2": float(footprint.food_emissions),
            "electricity_co2": float(footprint.electricity_emissions),
            "shopping_co2": float(footprint.shopping_emissions),
            "total_co2": float(footprint.total_emissions)
        }

    def get_footprint_summary(self, auth_user_id: UUID, start_date: date, end_date: date) -> dict:
        """
        Aggregates carbon footprint totals across a date range (inclusive).
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        results = (
            self.db.query(
                func.coalesce(func.sum(DailyFootprint.transport_emissions), 0.0).label("transport"),
                func.coalesce(func.sum(DailyFootprint.food_emissions), 0.0).label("food"),
                func.coalesce(func.sum(DailyFootprint.electricity_emissions), 0.0).label("electricity"),
                func.coalesce(func.sum(DailyFootprint.shopping_emissions), 0.0).label("shopping"),
                func.coalesce(func.sum(DailyFootprint.total_emissions), 0.0).label("total")
            )
            .filter(
                DailyFootprint.user_id == user.id,
                DailyFootprint.date >= start_date,
                DailyFootprint.date <= end_date
            )
            .first()
        )

        return {
            "transport": float(results.transport),
            "food": float(results.food),
            "electricity": float(results.electricity),
            "shopping": float(results.shopping),
            "total": float(results.total),
            "transport_co2": float(results.transport),
            "food_co2": float(results.food),
            "electricity_co2": float(results.electricity),
            "shopping_co2": float(results.shopping),
            "total_co2": float(results.total)
        }

    def get_breakdown(self, auth_user_id: UUID) -> dict:
        """
        Aggregates all-time carbon footprints by category.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        results = (
            self.db.query(
                func.coalesce(func.sum(DailyFootprint.transport_emissions), 0.0).label("transport"),
                func.coalesce(func.sum(DailyFootprint.food_emissions), 0.0).label("food"),
                func.coalesce(func.sum(DailyFootprint.electricity_emissions), 0.0).label("electricity"),
                func.coalesce(func.sum(DailyFootprint.shopping_emissions), 0.0).label("shopping"),
                func.coalesce(func.sum(DailyFootprint.total_emissions), 0.0).label("total")
            )
            .filter(DailyFootprint.user_id == user.id)
            .first()
        )

        return {
            "transport": float(results.transport),
            "food": float(results.food),
            "electricity": float(results.electricity),
            "shopping": float(results.shopping),
            "total": float(results.total),
            "transport_co2": float(results.transport),
            "food_co2": float(results.food),
            "electricity_co2": float(results.electricity),
            "shopping_co2": float(results.shopping),
            "total_co2": float(results.total)
        }

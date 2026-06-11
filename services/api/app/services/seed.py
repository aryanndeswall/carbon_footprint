from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.emission_factor import EmissionFactor

def seed_emission_factors(db: Session):
    """
    Seeds the emission_factors table with MVP conversion factors if it's empty
    or if those specific factors don't exist.
    """
    initial_factors = [
        # Transport
        {
            "category": "transport",
            "activity_type": "car_per_km",
            "unit": "km",
            "factor_value": Decimal("0.192000"),
            "factor_source": "UK DESNZ / EPA",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "bus_per_km",
            "unit": "km",
            "factor_value": Decimal("0.089000"),
            "factor_source": "UK DESNZ",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "metro_per_km",
            "unit": "km",
            "factor_value": Decimal("0.041000"),
            "factor_source": "Delhi Metro / India First",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "train_per_km",
            "unit": "km",
            "factor_value": Decimal("0.035000"),
            "factor_source": "Indian Railways / India First",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "flight_per_km",
            "unit": "km",
            "factor_value": Decimal("0.250000"),
            "factor_source": "IPCC / Radiative Forcing",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "bike_per_km",
            "unit": "km",
            "factor_value": Decimal("0.000000"),
            "factor_source": "Zero Emission Mode",
            "version": 1
        },
        {
            "category": "transport",
            "activity_type": "walk_per_km",
            "unit": "km",
            "factor_value": Decimal("0.000000"),
            "factor_source": "Zero Emission Mode",
            "version": 1
        },
        
        # Food
        {
            "category": "food",
            "activity_type": "vegetarian_meal",
            "unit": "meal",
            "factor_value": Decimal("1.500000"),
            "factor_source": "IPCC",
            "version": 1
        },
        {
            "category": "food",
            "activity_type": "vegan_meal",
            "unit": "meal",
            "factor_value": Decimal("0.800000"),
            "factor_source": "IPCC",
            "version": 1
        },
        {
            "category": "food",
            "activity_type": "chicken_meal",
            "unit": "meal",
            "factor_value": Decimal("3.000000"),
            "factor_source": "IPCC / FAO",
            "version": 1
        },
        {
            "category": "food",
            "activity_type": "mutton_meal",
            "unit": "meal",
            "factor_value": Decimal("6.000000"),
            "factor_source": "IPCC / FAO",
            "version": 1
        },
        {
            "category": "food",
            "activity_type": "beef_meal",
            "unit": "meal",
            "factor_value": Decimal("12.000000"),
            "factor_source": "IPCC / FAO",
            "version": 1
        },
        {
            "category": "food",
            "activity_type": "dairy",
            "unit": "kg",
            "factor_value": Decimal("1.000000"),
            "factor_source": "FAO / India First",
            "version": 1
        },
        
        # Electricity
        {
            "category": "electricity",
            "activity_type": "india_grid_kwh",
            "unit": "kWh",
            "factor_value": Decimal("0.820000"),
            "factor_source": "Central Electricity Authority (CEA) India",
            "version": 1
        },
        
        # Shopping
        {
            "category": "shopping",
            "activity_type": "clothing",
            "unit": "item",
            "factor_value": Decimal("15.000000"),
            "factor_source": "UK DESNZ / EPA",
            "version": 1
        },
        {
            "category": "shopping",
            "activity_type": "electronics",
            "unit": "item",
            "factor_value": Decimal("80.000000"),
            "factor_source": "UK DESNZ / EPA",
            "version": 1
        },
        {
            "category": "shopping",
            "activity_type": "general_purchase",
            "unit": "item",
            "factor_value": Decimal("3.500000"),
            "factor_source": "EPA Estimate",
            "version": 1
        }
    ]

    now = datetime.now(timezone.utc)
    for f in initial_factors:
        # Check if the factor already exists
        exists = (
            db.query(EmissionFactor)
            .filter(
                EmissionFactor.category == f["category"],
                EmissionFactor.activity_type == f["activity_type"],
                EmissionFactor.version == f["version"]
            )
            .first()
        )
        if not exists:
            factor = EmissionFactor(
                category=f["category"],
                activity_type=f["activity_type"],
                unit=f["unit"],
                factor_value=f["factor_value"],
                factor_source=f["factor_source"],
                version=f["version"],
                effective_from=now,
                created_at=now
            )
            db.add(factor)
    
    db.commit()

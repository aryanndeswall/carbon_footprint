from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.emission_factor import EmissionFactor
from app.models.mission import MissionTemplate

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


def seed_mission_templates(db: Session):
    """
    Seeds the mission_templates table with MVP templates if it's empty
    or if those specific templates don't exist.
    """
    initial_templates = [
        # Transport
        {
            "title": "Walk instead of using a vehicle for one short trip",
            "description": "Walk for short trips under 2 km to save fuel.",
            "category": "transport",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("1.2"),
            "estimated_time_minutes": 15
        },
        {
            "title": "Use public transport today",
            "description": "Take the bus or metro instead of driving.",
            "category": "transport",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("2.5"),
            "estimated_time_minutes": 45
        },
        # Food
        {
            "title": "Eat one vegetarian meal",
            "description": "Replace one meat meal with a delicious vegetarian alternative.",
            "category": "food",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("1.5"),
            "estimated_time_minutes": 30
        },
        {
            "title": "Avoid food delivery today",
            "description": "Cook at home or eat out locally to avoid single-use packaging and delivery emissions.",
            "category": "food",
            "difficulty": "medium",
            "estimated_co2_saving": Decimal("2.0"),
            "estimated_time_minutes": 0
        },
        # Electricity
        {
            "title": "Turn off unused devices",
            "description": "Unplug electronics and turn off lights in empty rooms.",
            "category": "electricity",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("0.5"),
            "estimated_time_minutes": 5
        },
        {
            "title": "Reduce AC usage by 1 hour",
            "description": "Turn off the air conditioner 1 hour earlier than usual.",
            "category": "electricity",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("1.0"),
            "estimated_time_minutes": 60
        },
        # Shopping
        {
            "title": "Avoid unnecessary purchases today",
            "description": "Practice mindful consumption and buy only essentials today.",
            "category": "shopping",
            "difficulty": "medium",
            "estimated_co2_saving": Decimal("3.5"),
            "estimated_time_minutes": 0
        },
        {
            "title": "Reuse an existing item",
            "description": "Repurpose or reuse an item instead of throwing it away or buying new.",
            "category": "shopping",
            "difficulty": "medium",
            "estimated_co2_saving": Decimal("2.5"),
            "estimated_time_minutes": 10
        },
        # General
        {
            "title": "Complete all sustainability logs today",
            "description": "Log all your transport, food, electricity, and shopping activities for today.",
            "category": "general",
            "difficulty": "easy",
            "estimated_co2_saving": Decimal("0.2"),
            "estimated_time_minutes": 5
        }
    ]

    for t in initial_templates:
        # Check if the template with the same title already exists
        exists = db.query(MissionTemplate).filter(MissionTemplate.title == t["title"]).first()
        if not exists:
            template = MissionTemplate(
                title=t["title"],
                description=t["description"],
                category=t["category"],
                difficulty=t["difficulty"],
                estimated_co2_saving=t["estimated_co2_saving"],
                estimated_time_minutes=t["estimated_time_minutes"],
                is_active=True
            )
            db.add(template)
            
    db.commit()

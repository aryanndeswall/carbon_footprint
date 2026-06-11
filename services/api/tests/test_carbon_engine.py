import pytest
from decimal import Decimal
from datetime import datetime, timedelta, timezone
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import text

from carbon_core.calculator import CarbonCalculator
from carbon_core.resolver import FactorResolver
from carbon_core.aggregator import FootprintAggregator
from app.models.emission_factor import EmissionFactor
from app.models.footprint import DailyFootprint
from app.models.activity import ActivityEvent

# =====================================================================
# UNIT TESTS - CARBON CALCULATOR
# =====================================================================

def test_calculator_valid_calculation():
    # 10 km * 0.192 kg CO2/km = 1.92 kg CO2
    result = CarbonCalculator.calculate(10, Decimal("0.192"))
    assert result == Decimal("1.92")

    result_dec = CarbonCalculator.calculate(Decimal("5.5"), Decimal("2.0"))
    assert result_dec == Decimal("11.0")

def test_calculator_zero_quantity():
    result = CarbonCalculator.calculate(0, Decimal("0.192"))
    assert result == Decimal("0.0")

def test_calculator_negative_quantity_raises():
    with pytest.raises(ValueError, match="Quantity cannot be negative"):
        CarbonCalculator.calculate(-5, Decimal("0.192"))

def test_calculator_invalid_input_types():
    with pytest.raises(ValueError, match="Invalid numeric input"):
        CarbonCalculator.calculate("invalid_number", 2.0)

# =====================================================================
# UNIT TESTS - FACTOR RESOLVER
# =====================================================================

def test_resolver_resolve_active_factor(db: Session):
    resolver = FactorResolver(db)
    # Check that car_per_km resolves
    factor = resolver.resolve_factor("transport", "car_per_km")
    assert factor is not None
    assert factor.category == "transport"
    assert factor.activity_type == "car_per_km"
    assert factor.factor_value == Decimal("0.192000")

def test_resolver_non_existent_factor(db: Session):
    resolver = FactorResolver(db)
    factor = resolver.resolve_factor("transport", "hovercraft_per_km")
    assert factor is None

def test_resolver_version_ordering(db: Session):
    resolver = FactorResolver(db)
    now = datetime.now(timezone.utc)
    new_factor = EmissionFactor(
        category="transport",
        activity_type="car_per_km",
        unit="km",
        factor_value=Decimal("0.150000"),
        factor_source="UK DESNZ V2",
        version=2,
        effective_from=now - timedelta(hours=1),
        created_at=now
    )
    db.add(new_factor)
    db.commit()

    try:
        factor = resolver.resolve_factor("transport", "car_per_km")
        assert factor is not None
        assert factor.version == 2
        assert factor.factor_value == Decimal("0.150000")
    finally:
        db.execute(text("DELETE FROM emission_factors WHERE version > 1;"))
        db.commit()

def test_resolver_effective_from_future(db: Session):
    resolver = FactorResolver(db)
    now = datetime.now(timezone.utc)
    future_factor = EmissionFactor(
        category="transport",
        activity_type="car_per_km",
        unit="km",
        factor_value=Decimal("0.100000"),
        factor_source="Future standard",
        version=3,
        effective_from=now + timedelta(days=5),
        created_at=now
    )
    db.add(future_factor)
    db.commit()

    try:
        # Query at current time (should resolve to version 1 factor)
        factor = resolver.resolve_factor("transport", "car_per_km")
        assert factor is not None
        assert factor.version == 1
    finally:
        db.execute(text("DELETE FROM emission_factors WHERE version > 1;"))
        db.commit()

# =====================================================================
# UNIT TESTS - FOOTPRINT AGGREGATOR
# =====================================================================

def test_aggregator_get_or_create(db: Session):
    user_uuid = uuid.uuid4()
    from app.models.user import User
    user = User(id=user_uuid, auth_user_id=uuid.uuid4(), email="test_agg@example.com")
    db.add(user)
    db.commit()

    aggregator = FootprintAggregator(db)
    today = datetime.now(timezone.utc).date()
    
    # Create new
    footprint = aggregator.get_or_create_daily_footprint(user.id, today)
    assert footprint.id is not None
    assert footprint.user_id == user.id
    assert footprint.date == today
    assert footprint.total_emissions == Decimal("0.0")

    # Fetch existing
    footprint2 = aggregator.get_or_create_daily_footprint(user.id, today)
    assert footprint2.id == footprint.id

def test_aggregator_add_activity(db: Session):
    user_uuid = uuid.uuid4()
    from app.models.user import User
    user = User(id=user_uuid, auth_user_id=uuid.uuid4(), email="test_agg_add@example.com")
    db.add(user)
    db.commit()

    # Create dummy activity event and factor
    factor = db.query(EmissionFactor).filter_by(activity_type="car_per_km").first()
    activity = ActivityEvent(
        user_id=user.id,
        category="transport",
        activity_type="car",
        quantity=Decimal("15.0"),
        unit="km"
    )
    db.add(activity)
    db.commit()

    aggregator = FootprintAggregator(db)
    today = datetime.now(timezone.utc).date()
    footprint = aggregator.get_or_create_daily_footprint(user.id, today)

    # Add transport activity
    source = aggregator.add_activity_to_footprint(
        footprint=footprint,
        activity_id=activity.id,
        emission_factor_id=factor.id,
        category="transport",
        calculated_emission=Decimal("2.88")
    )
    db.commit()

    # Verify daily footprint columns updated
    assert footprint.transport_emissions == Decimal("2.88")
    assert footprint.total_emissions == Decimal("2.88")

    # Verify audit source log
    assert source.id is not None
    assert source.daily_footprint_id == footprint.id
    assert source.activity_id == activity.id
    assert source.emission_factor_id == factor.id
    assert source.calculated_emission == Decimal("2.88")

# =====================================================================
# INTEGRATION TESTS - ACTIVITY -> EMISSION -> DAILY FOOTPRINT
# =====================================================================

def test_activity_logging_triggers_aggregation(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="integration_test@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)

    # Log an activity (10 km car travel)
    # Car factor = 0.192
    payload = {
        "category": "transport",
        "activity_type": "car",
        "quantity": 10.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 201

    # Fetch the daily footprint today
    res_footprint = client.get("/api/v1/footprints/today", headers=headers)
    assert res_footprint.status_code == 200
    data = res_footprint.json()["data"]
    
    # Assert and print data if mismatch occurs
    assert data["transport"] == 1.92, f"Expected transport footprint to be 1.92, got {data}"
    assert data["total"] == 1.92

    # Log another activity (1 vegetarian meal)
    # Vegetarian factor = 1.5
    payload_food = {
        "category": "food",
        "activity_type": "vegetarian_meal",
        "quantity": 1.0,
        "unit": "meal"
    }
    response_food = client.post("/api/v1/activities", json=payload_food, headers=headers)
    assert response_food.status_code == 201

    # Fetch breakdown
    res_breakdown = client.get("/api/v1/footprints/breakdown", headers=headers)
    assert res_breakdown.status_code == 200
    data_bd = res_breakdown.json()["data"]
    assert data_bd["transport"] == 1.92
    assert data_bd["food"] == 1.5
    assert data_bd["total"] == 3.42

# =====================================================================
# INTEGRATION TESTS - ENDPOINTS & TIME RANGES
# =====================================================================

def test_footprints_time_range_summaries(client: TestClient, create_jwt, db: Session):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="timerange@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initialize user
    client.get("/api/v1/users/me", headers=headers)
    from app.models.user import User
    user_db = db.query(User).filter_by(email="timerange@example.com").first()

    # Create footprints manually on different dates to test weekly/monthly/date APIs
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    two_weeks_ago = today - timedelta(days=14)

    # 1. Today footprint
    fp_today = DailyFootprint(
        user_id=user_db.id,
        date=today,
        transport_emissions=Decimal("2.5"),
        total_emissions=Decimal("2.5")
    )
    # 2. Yesterday footprint
    fp_yesterday = DailyFootprint(
        user_id=user_db.id,
        date=yesterday,
        food_emissions=Decimal("1.5"),
        total_emissions=Decimal("1.5")
    )
    # 3. Two weeks ago footprint
    fp_two_weeks = DailyFootprint(
        user_id=user_db.id,
        date=two_weeks_ago,
        electricity_emissions=Decimal("10.0"),
        total_emissions=Decimal("10.0")
    )
    db.add_all([fp_today, fp_yesterday, fp_two_weeks])
    db.commit()

    # Verify Today Endpoint
    res_today = client.get("/api/v1/footprints/today", headers=headers)
    assert res_today.status_code == 200
    assert res_today.json()["data"]["transport"] == 2.5
    assert res_today.json()["data"]["total"] == 2.5

    # Verify Weekly Endpoint (includes today and yesterday, but not two weeks ago)
    # Expected: transport=2.5, food=1.5, total=4.0
    res_weekly = client.get("/api/v1/footprints/weekly", headers=headers)
    assert res_weekly.status_code == 200
    assert res_weekly.json()["data"]["transport"] == 2.5
    assert res_weekly.json()["data"]["food"] == 1.5
    assert res_weekly.json()["data"]["total"] == 4.0

    # Verify Monthly Endpoint (includes all three)
    # Expected: transport=2.5, food=1.5, electricity=10.0, total=14.0
    res_monthly = client.get("/api/v1/footprints/monthly", headers=headers)
    assert res_monthly.status_code == 200
    assert res_monthly.json()["data"]["transport"] == 2.5
    assert res_monthly.json()["data"]["food"] == 1.5
    assert res_monthly.json()["data"]["electricity"] == 10.0
    assert res_monthly.json()["data"]["total"] == 14.0

    # Verify Date Endpoint
    res_date = client.get(f"/api/v1/footprints/{yesterday.isoformat()}", headers=headers)
    assert res_date.status_code == 200
    assert res_date.json()["data"]["food"] == 1.5
    assert res_date.json()["data"]["total"] == 1.5

    # Verify Date Endpoint with invalid date format
    res_date_invalid = client.get("/api/v1/footprints/invalid-date-format", headers=headers)
    assert res_date_invalid.status_code == 400

# =====================================================================
# SECURITY TESTS - USER ISOLATION
# =====================================================================

def test_footprints_user_isolation(client: TestClient, create_jwt, db: Session):
    # User A logs an activity
    user_a_id = str(uuid.uuid4())
    token_a = create_jwt(sub=user_a_id, email="usera@example.com")
    headers_a = {"Authorization": f"Bearer {token_a}"}
    client.get("/api/v1/users/me", headers=headers_a)

    client.post("/api/v1/activities", json={
        "category": "transport",
        "activity_type": "car",
        "quantity": 10.0,
        "unit": "km"
    }, headers=headers_a)

    # User B checks today's footprint (should be 0.0, completely isolated)
    user_b_id = str(uuid.uuid4())
    token_b = create_jwt(sub=user_b_id, email="userb@example.com")
    headers_b = {"Authorization": f"Bearer {token_b}"}
    client.get("/api/v1/users/me", headers=headers_b)

    res_b = client.get("/api/v1/footprints/today", headers=headers_b)
    assert res_b.status_code == 200
    assert res_b.json()["data"]["total"] == 0.0

# =====================================================================
# VALIDATION TESTS - MISSING FACTOR & INVALID QUANTITIES
# =====================================================================

def test_validation_unsupported_activity_type(client: TestClient, create_jwt):
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="val_test@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # Invalid activity type (should return 422 Unprocessable Entity via schema)
    payload = {
        "category": "transport",
        "activity_type": "spacecraft",
        "quantity": 100.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    assert response.status_code == 422

def test_validation_missing_factor(client: TestClient, create_jwt, db: Session):
    # Temporarily remove metro factor from DB to simulate missing factor
    db.execute(text("DELETE FROM emission_factors WHERE activity_type = 'metro_per_km';"))
    db.commit()

    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="missing_factor@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # Log metro activity (metro_per_km was deleted)
    payload = {
        "category": "transport",
        "activity_type": "metro",
        "quantity": 10.0,
        "unit": "km"
    }
    response = client.post("/api/v1/activities", json=payload, headers=headers)
    # The server should return 422 or 500 when processing a valid schema with a missing factor
    # In activity service we raise ValueError which becomes 422
    assert response.status_code == 422
    assert "Emission factor not found" in response.json()["detail"]

# Import all models so that Base.metadata has them
from app.database.session import Base  # noqa
from app.models.user import User, UserPreference  # noqa
from app.models.activity import ActivityEvent  # noqa
from app.models.emission_factor import EmissionFactor  # noqa
from app.models.footprint import DailyFootprint, DailyFootprintSource  # noqa
from app.models.mission import MissionTemplate, UserMission  # noqa

# Import all models so that Base.metadata has them
from app.database.session import Base  # noqa
from app.models.user import User, UserPreference  # noqa
from app.models.activity import ActivityEvent  # noqa

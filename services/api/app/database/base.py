# Import all models so that Base.metadata has them
from app.database.session import Base  # noqa
from app.models.user import User, UserPreference  # noqa
from app.models.activity import ActivityEvent  # noqa
from app.models.emission_factor import EmissionFactor  # noqa
from app.models.footprint import DailyFootprint, DailyFootprintSource  # noqa
from app.models.mission import MissionTemplate, UserMission  # noqa
from app.models.streak import UserStreak, StreakEvent  # noqa
from app.models.ai import AIInsight, AIGenerationLog  # noqa
from app.models.ai_memory import UserMemory, MemoryRetrievalLog  # noqa
from app.models.community import Group, GroupMember, Challenge, ChallengeParticipant, LeaderboardSnapshot  # noqa
from app.models.document import UploadedDocument, ExtractionResult, ExtractionAuditLog  # noqa
from app.models.gamification import SustainabilityScore, Achievement, UserAchievement, ScoreHistory  # noqa
from app.models.simulation import SimulationScenario, SimulationResult, SimulationHistory  # noqa

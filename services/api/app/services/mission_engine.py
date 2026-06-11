from datetime import datetime, timezone, timedelta
from typing import List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.mission import MissionTemplate, UserMission
from app.repositories.mission_template import MissionTemplateRepository
from app.repositories.user_mission import UserMissionRepository
from app.repositories.user import UserRepository
from app.services.carbon_engine import CarbonEngineService

class MissionEngineService:
    """
    Service layer for mission management. Exposes methods for daily assignment,
    recommendations, and completion tracking.
    """
    def __init__(self, db: Session):
        self.db = db
        self.template_repo = MissionTemplateRepository(db)
        self.user_mission_repo = UserMissionRepository(db)
        self.user_repo = UserRepository(db)
        self.carbon_service = CarbonEngineService(db)

    def select_personalized_template(self, user_id: UUID, auth_user_id: UUID) -> MissionTemplate:
        """
        Personalized template selection rules:
        1. Query rolling 30-day footprints to find user's dominant emission category.
        2. Query recently assigned missions to avoid repetition (past 5 days).
        3. Filter and prioritize templates by dominant category, fallback categories,
           and difficulty levels (easy -> medium -> hard).
        """
        # Get active templates
        active_templates = self.template_repo.get_active_templates()
        if not active_templates:
            raise ValueError("No active mission templates found in database")

        # Exclude templates assigned in the last 5 days
        recent_assignments = self.user_mission_repo.get_user_recent_missions(user_id, days=5)
        recent_template_ids = {ra.mission_template_id for ra in recent_assignments}
        
        candidates = [t for t in active_templates if t.id not in recent_template_ids]
        
        # Fallback if exclusion list removes all templates
        if not candidates:
            recent_assignments_1d = self.user_mission_repo.get_user_recent_missions(user_id, days=1)
            recent_template_ids_1d = {ra.mission_template_id for ra in recent_assignments_1d}
            candidates = [t for t in active_templates if t.id not in recent_template_ids_1d]
            
        if not candidates:
            # Absolute fallback: allow all active templates
            candidates = active_templates

        # Determine dominant emission category over the last 30 days
        today = datetime.now(timezone.utc).date()
        start_date = today - timedelta(days=29)
        
        dominant_category = None
        try:
            summary = self.carbon_service.get_footprint_summary(auth_user_id, start_date, today)
            categories = ["transport", "food", "electricity", "shopping"]
            max_val = 0.0
            for cat in categories:
                val = summary.get(cat, 0.0)
                if val > max_val:
                    max_val = val
                    dominant_category = cat
        except Exception:
            # Fallback if carbon lookup fails
            pass

        # Filter candidates based on dominant category priority
        prioritized_candidates = []
        if dominant_category:
            prioritized_candidates = [c for c in candidates if c.category.lower() == dominant_category.lower()]

        # If no candidates in dominant category, fallback to 'general' category templates
        if not prioritized_candidates:
            prioritized_candidates = [c for c in candidates if c.category.lower() == "general"]

        # If still no candidates, fallback to any remaining candidates
        if not prioritized_candidates:
            prioritized_candidates = candidates

        # Difficulty ordering: easy -> medium -> hard
        difficulty_weight = {"easy": 0, "medium": 1, "hard": 2}
        
        # Sort candidates deterministically:
        # 1. Difficulty (ascending: easy first)
        # 2. estimated_co2_saving (descending: high impact first)
        # 3. title (alphabetical: fallback for absolute determinism)
        prioritized_candidates.sort(
            key=lambda x: (
                difficulty_weight.get(x.difficulty.lower(), 99),
                -float(x.estimated_co2_saving),
                x.title
            )
        )
        
        return prioritized_candidates[0]

    def get_or_assign_daily_mission(self, auth_user_id: UUID) -> UserMission:
        """
        Retrieves today's assigned daily mission.
        Generates and saves a new daily mission if none exists.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        today = datetime.now(timezone.utc).date()
        daily_mission = self.user_mission_repo.get_by_user_and_date(user.id, today)
        
        if not daily_mission:
            # Generate and assign personalized mission template
            template = self.select_personalized_template(user.id, auth_user_id)
            daily_mission = UserMission(
                user_id=user.id,
                mission_template_id=template.id,
                assigned_date=today,
                status="assigned",
                created_at=datetime.now(timezone.utc)
            )
            daily_mission = self.user_mission_repo.create(daily_mission)
            
        return daily_mission

    def get_recommended_mission(self, auth_user_id: UUID) -> MissionTemplate:
        """
        Generates a recommended mission template for preview/recommendation
        without storing the assignment.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.select_personalized_template(user.id, auth_user_id)

    def complete_mission(self, auth_user_id: UUID, user_mission_id: UUID) -> UserMission:
        """
        Marks a specific user mission as complete.
        Raises ValueError if mission not found or not owned by user.
        Raises ValueError if mission is already completed.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        mission = self.user_mission_repo.get_by_id(user_mission_id)
        if not mission or mission.user_id != user.id:
            raise ValueError("Mission not found")

        if mission.status == "completed":
            raise ValueError("Mission is already completed")

        mission.status = "completed"
        mission.completed_at = datetime.now(timezone.utc)
        return self.user_mission_repo.update(mission)

    def get_mission_history(
        self, auth_user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[UserMission], int]:
        """
        Retrieves user's assigned missions history.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.user_mission_repo.get_user_missions_history(user.id, page, page_size)

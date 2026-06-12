import logging
from datetime import datetime, timezone, timedelta
from uuid import UUID
from typing import List
from sqlalchemy.orm import Session

from app.models.ai_memory import UserMemory
from app.repositories.user import UserRepository
from app.repositories.ai_memory import MemoryRepository
from app.services.ai.embedding import EmbeddingService
from app.services.carbon_engine import CarbonEngineService
from app.services.retention import RetentionService
from app.models.mission import UserMission

logger = logging.getLogger(__name__)

class MemoryService:
    """
    Service for analyzing user behavior across streaks, preferences, footprints,
    and missions to compile and store semantic memories with vector embeddings.
    """
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.memory_repo = MemoryRepository(db)
        self.embedding_service = EmbeddingService()
        self.carbon_service = CarbonEngineService(db)
        self.retention_service = RetentionService(db)

    def rebuild_user_memories(self, auth_user_id: UUID) -> List[UserMemory]:
        """
        Delete old memories and rebuild new user memories based on latest stats.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        # 1. Clear existing memories
        self.memory_repo.clear_user_memories(user.id)

        # 2. Gather context
        today = datetime.now(timezone.utc).date()
        
        # A. Preferences memory
        prefs = user.preferences
        prefs_text = "User has not completed onboarding preferences."
        if prefs:
            prefs_text = (
                f"User preferences: preferred transport is {prefs.transport_preference or 'not set'}, "
                f"diet type is {prefs.diet_type or 'not set'}, and housing type is {prefs.housing_type or 'not set'}."
            )
        
        # B. Streak memory
        streak_text = "User has no active streak record."
        try:
            streak = self.retention_service.get_or_create_streak(auth_user_id)
            streak_text = (
                f"User streak pattern: current streak is {streak.current_streak} days, "
                f"longest streak is {streak.longest_streak} days, and has {streak.freeze_count} streak freezes available."
            )
        except Exception as e:
            logger.warning(f"Failed to fetch streak for memory: {str(e)}")

        # C. Footprint memory & Carbon Trends
        footprint_text = "User has no logged footprint history."
        trend_text = "User has no rolling carbon trend history."
        try:
            # 30-day rollup
            footprint_30d = self.carbon_service.get_footprint_summary(auth_user_id, today - timedelta(days=29), today)
            total_co2 = footprint_30d.get("total", 0.0)
            
            categories = ["transport", "food", "electricity", "shopping"]
            highest_cat = "transport"
            highest_val = -1.0
            for cat in categories:
                val = footprint_30d.get(cat, 0.0)
                if val > highest_val:
                    highest_val = val
                    highest_cat = cat

            footprint_text = (
                f"User footprint pattern: total carbon footprint over the last 30 days is {total_co2:.1f} kg CO2. "
                f"The highest emission category is {highest_cat} accounting for {highest_val:.1f} kg CO2."
            )

            # Weekly compared to previous week (trends)
            footprint_curr_wk = self.carbon_service.get_footprint_summary(auth_user_id, today - timedelta(days=6), today)
            footprint_prev_wk = self.carbon_service.get_footprint_summary(auth_user_id, today - timedelta(days=13), today - timedelta(days=7))
            curr_total = footprint_curr_wk.get("total", 0.0)
            prev_total = footprint_prev_wk.get("total", 0.0)

            if prev_total > 0:
                diff = ((curr_total - prev_total) / prev_total) * 100
                if diff < -1:
                    trend_text = f"User carbon trend: weekly carbon footprint decreased by {abs(diff):.1f}% compared to last week."
                elif diff > 1:
                    trend_text = f"User carbon trend: weekly carbon footprint increased by {diff:.1f}% compared to last week."
                else:
                    trend_text = "User carbon trend: weekly carbon footprint remained stable."
            else:
                trend_text = f"User carbon trend: weekly carbon footprint is {curr_total:.1f} kg CO2."
        except Exception as e:
            logger.warning(f"Failed to fetch footprints for memory: {str(e)}")

        # D. Mission pattern memory
        mission_text = "User has not been assigned any daily missions recently."
        try:
            missions_30d = (
                self.db.query(UserMission)
                .filter(UserMission.user_id == user.id, UserMission.assigned_date >= today - timedelta(days=29))
                .all()
            )
            total_assigned = len(missions_30d)
            if total_assigned > 0:
                total_completed = sum(1 for m in missions_30d if m.status == "completed")
                rate = (total_completed / total_assigned) * 100
                mission_text = (
                    f"User mission completion rate: completed {total_completed} out of {total_assigned} "
                    f"assigned missions in the last 30 days ({rate:.0f}% completion rate)."
                )
        except Exception as e:
            logger.warning(f"Failed to query missions for memory: {str(e)}")

        # 3. Create memories
        memories_to_create = [
            ("behavior_pattern", prefs_text, 1.0),
            ("streak_pattern", streak_text, 0.9),
            ("footprint_pattern", footprint_text, 0.9),
            ("behavior_pattern", trend_text, 0.95),
            ("mission_pattern", mission_text, 0.85)
        ]

        created_memories = []
        for m_type, content, score in memories_to_create:
            try:
                # Generate embedding vector
                embedding = self.embedding_service.get_embedding(content)
                memory = UserMemory(
                    user_id=user.id,
                    memory_type=m_type,
                    content=content,
                    embedding=embedding,
                    importance_score=score,
                    created_at=datetime.now(timezone.utc)
                )
                self.memory_repo.create(memory)
                created_memories.append(memory)
            except Exception as e:
                logger.error(f"Failed to create memory for type {m_type}: {str(e)}")

        return created_memories

    def get_user_memories(self, auth_user_id: UUID) -> List[UserMemory]:
        """
        Get all cached memories for a user.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.memory_repo.get_by_user(user.id)

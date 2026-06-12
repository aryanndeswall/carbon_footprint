import json
import time
import logging
from datetime import datetime, timezone, timedelta
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.ai import AIInsight, AIGenerationLog
from app.models.user import User
from app.repositories.user import UserRepository
from app.repositories.ai import AIInsightRepository, AIGenerationLogRepository
from app.services.carbon_engine import CarbonEngineService
from app.services.retention import RetentionService
from app.models.mission import UserMission
from app.services.ai.gemini_client import GeminiClient, GeminiAPIError
from app.services.ai.prompts import PromptBuilder
from app.services.ai.validator import OutputValidator, AIValidationError
from app.services.ai.memory_retrieval import MemoryRetrievalService
from app.services.ai.context_assembly import ContextAssemblyService

logger = logging.getLogger(__name__)

class AIInsightService:
    """
    Orchestration service for gathering user context, prompting Gemini,
    validating output, applying fallbacks, and caching results.
    """
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.insight_repo = AIInsightRepository(db)
        self.log_repo = AIGenerationLogRepository(db)
        self.carbon_service = CarbonEngineService(db)
        self.retention_service = RetentionService(db)
        self.gemini_client = GeminiClient()
        self.retrieval_service = MemoryRetrievalService(db)

    def generate_daily_coach(self, auth_user_id: UUID) -> AIInsight:
        """
        Orchestrate the daily coaching generation pipeline.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        start_time = time.time()
        context = self._compile_user_context(user)
        
        # Retrieve and augment with similar memories
        memories = self.retrieval_service.retrieve_similar_memories(
            auth_user_id, "user carbon emissions habits and mission preferences", query_type="daily_coach", limit=5
        )
        context["retrieved_memories"] = ContextAssemblyService.assemble_memory_context(memories)
        
        system_instruction = PromptBuilder.get_daily_coach_system_instruction()
        user_prompt = PromptBuilder.get_daily_coach_user_prompt(context)
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "headline": {"type": "STRING"},
                "body": {"type": "STRING"},
                "actionable_tip": {"type": "STRING"},
                "focus_category": {"type": "STRING", "enum": ["transport", "food", "electricity", "shopping"]}
            },
            "required": ["headline", "body", "actionable_tip", "focus_category"]
        }

        raw_response = None
        error_msg = None
        status = "success"

        try:
            # Call client
            raw_response = self.gemini_client.generate_content(
                prompt=user_prompt,
                system_instruction=system_instruction,
                response_schema=response_schema
            )
            # Validate
            validated_data = OutputValidator.validate_daily_coach(raw_response, context)
            
        except (GeminiAPIError, AIValidationError) as e:
            logger.warning(f"Initial daily coaching generation failed: {str(e)}. Retrying once...")
            # Retry mechanism with error details appended
            retry_prompt = f"{user_prompt}\n\nNote: The previous response failed validation with error: {str(e)}. Please correct this."
            try:
                raw_response = self.gemini_client.generate_content(
                    prompt=retry_prompt,
                    system_instruction=system_instruction,
                    response_schema=response_schema
                )
                validated_data = OutputValidator.validate_daily_coach(raw_response, context)
            except Exception as retry_err:
                logger.error(f"Daily coaching retry also failed: {str(retry_err)}")
                error_msg = str(retry_err)
                status = "failed"

        generation_time_ms = int((time.time() - start_time) * 1000)

        # Log the generation attempt
        self._log_generation(user.id, "daily_coach", status, generation_time_ms)

        if status == "success":
            # Format and save
            insight = AIInsight(
                user_id=user.id,
                insight_type="daily_coach",
                title=validated_data.headline,
                content=f"{validated_data.body}\n\nTip: {validated_data.actionable_tip}",
                generated_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc)
            )
            return self.insight_repo.create(insight)
        else:
            # Fallback to database cached insight
            cached = self.insight_repo.get_latest_by_type(user.id, "daily_coach")
            if cached:
                logger.info("Daily coaching fallback: using latest cached DB insight.")
                return cached
            
            # Static template fallback
            logger.info("Daily coaching fallback: using static template.")
            focus = context.get("user_profile", {}).get("transport_preference", "transport")
            if focus not in ["transport", "food", "electricity", "shopping"]:
                focus = "transport"
            insight = AIInsight(
                user_id=user.id,
                insight_type="daily_coach",
                title="Keep Up the Clean Travel!",
                content="Your preference for metro transit is a great way to limit daily emissions. Try walking for trips under 1 km today.\n\nTip: Avoid idling vehicle engines in traffic today.",
                generated_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc)
            )
            return self.insight_repo.create(insight)

    def generate_weekly_summary(self, auth_user_id: UUID) -> AIInsight:
        """
        Orchestrate the weekly summary generation pipeline.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        start_time = time.time()
        context = self._compile_user_context(user)
        
        # Retrieve and augment with similar memories
        memories = self.retrieval_service.retrieve_similar_memories(
            auth_user_id, "weekly carbon summary and habits history", query_type="weekly_summary", limit=5
        )
        context["retrieved_memories"] = ContextAssemblyService.assemble_memory_context(memories)
        
        system_instruction = PromptBuilder.get_weekly_summary_system_instruction()
        user_prompt = PromptBuilder.get_weekly_summary_user_prompt(context)
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "summary_text": {"type": "STRING"},
                "total_saved_co2": {"type": "NUMBER"},
                "highlights": {"type": "ARRAY", "items": {"type": "STRING"}},
                "next_week_goals": {"type": "ARRAY", "items": {"type": "STRING"}}
            },
            "required": ["summary_text", "total_saved_co2", "highlights", "next_week_goals"]
        }

        raw_response = None
        error_msg = None
        status = "success"

        try:
            # Call client
            raw_response = self.gemini_client.generate_content(
                prompt=user_prompt,
                system_instruction=system_instruction,
                response_schema=response_schema
            )
            # Validate
            validated_data = OutputValidator.validate_weekly_summary(raw_response, context)
            
        except (GeminiAPIError, AIValidationError) as e:
            logger.warning(f"Initial weekly summary generation failed: {str(e)}. Retrying once...")
            retry_prompt = f"{user_prompt}\n\nNote: The previous response failed validation with error: {str(e)}. Please correct this."
            try:
                raw_response = self.gemini_client.generate_content(
                    prompt=retry_prompt,
                    system_instruction=system_instruction,
                    response_schema=response_schema
                )
                validated_data = OutputValidator.validate_weekly_summary(raw_response, context)
            except Exception as retry_err:
                logger.error(f"Weekly summary retry also failed: {str(retry_err)}")
                error_msg = str(retry_err)
                status = "failed"

        generation_time_ms = int((time.time() - start_time) * 1000)

        # Log the generation attempt
        self._log_generation(user.id, "weekly_summary", status, generation_time_ms)

        if status == "success":
            # Format to Markdown content
            highlights_md = "\n".join([f"- {h}" for h in validated_data.highlights])
            goals_md = "\n".join([f"- {g}" for g in validated_data.next_week_goals])
            content_md = (
                f"{validated_data.summary_text}\n\n"
                f"**Total Saved CO2:** {validated_data.total_saved_co2} kg\n\n"
                f"**Highlights:**\n{highlights_md}\n\n"
                f"**Next Week Goals:**\n{goals_md}"
            )
            insight = AIInsight(
                user_id=user.id,
                insight_type="weekly_summary",
                title="Weekly Progress",
                content=content_md,
                generated_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc)
            )
            return self.insight_repo.create(insight)
        else:
            # Fallback to database cached insight
            cached = self.insight_repo.get_latest_by_type(user.id, "weekly_summary")
            if cached:
                logger.info("Weekly summary fallback: using latest cached DB insight.")
                return cached
            
            # Static template fallback
            logger.info("Weekly summary fallback: using static template.")
            insight = AIInsight(
                user_id=user.id,
                insight_type="weekly_summary",
                title="Weekly Progress",
                content=(
                    "You are making steady progress on your carbon reduction journey. "
                    "Keep logging your daily activities and completing missions to stay on track.\n\n"
                    "**Total Saved CO2:** 0.0 kg\n\n"
                    "**Highlights:**\n- Loged activities consistently this week\n\n"
                    "**Next Week Goals:**\n- Reduce transport emissions by taking public transit\n- Complete at least 3 daily missions"
                ),
                generated_at=datetime.now(timezone.utc),
                created_at=datetime.now(timezone.utc)
            )
            return self.insight_repo.create(insight)

    def get_latest_insight(self, auth_user_id: UUID, insight_type: str) -> AIInsight:
        """
        Get the latest cached insight of a specific type.
        Generates a new one if none exists in cache.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        cached = self.insight_repo.get_latest_by_type(user.id, insight_type)
        if cached:
            return cached

        if insight_type == "weekly_summary":
            return self.generate_weekly_summary(auth_user_id)
        else:
            return self.generate_daily_coach(auth_user_id)

    def get_insight_history(
        self, auth_user_id: UUID, page: int = 1, page_size: int = 20
    ) -> tuple:
        """
        Get paginated historical insights for a user.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.insight_repo.get_history(user.id, page, page_size)

    def _compile_user_context(self, user: User) -> dict:
        """
        Compile safe user footprint, streak, preferences and mission metrics context.
        """
        today = datetime.now(timezone.utc).date()
        
        # 1. User preferences (no secrets/raw IDs)
        prefs = {}
        if user.preferences:
            prefs = {
                "diet_type": user.preferences.diet_type,
                "transport_preference": user.preferences.transport_preference,
                "state_code": user.preferences.state_code
            }

        # 2. Footprint calculations (using CarbonEngineService)
        # Current week (last 7 days inclusive of today)
        weekly_footprint = self.carbon_service.get_footprint_summary(user.auth_user_id, today - timedelta(days=6), today)
        
        # Previous week (days 8-14)
        prev_week_footprint = self.carbon_service.get_footprint_summary(user.auth_user_id, today - timedelta(days=13), today - timedelta(days=7))

        # Find highest category
        categories = ["transport", "food", "electricity", "shopping"]
        highest_cat = "transport"
        highest_val = -1.0
        for cat in categories:
            val = weekly_footprint.get(cat, 0.0)
            if val > highest_val:
                highest_val = val
                highest_cat = cat

        # Compute trend
        curr_total = weekly_footprint.get("total", 0.0)
        prev_total = prev_week_footprint.get("total", 0.0)
        trend = "Your carbon footprint was stable compared to last week."
        if prev_total > 0:
            diff = ((curr_total - prev_total) / prev_total) * 100
            if diff < -1:
                trend = f"Your carbon footprint decreased by {abs(diff):.1f}% compared to last week."
            elif diff > 1:
                trend = f"Your carbon footprint increased by {diff:.1f}% compared to last week."
        elif curr_total > 0:
            trend = f"Your total footprint for the week is {curr_total:.1f} kg CO2."

        # 3. Streak details
        streak_val = 0
        longest_streak_val = 0
        try:
            streak = self.retention_service.get_or_create_streak(user.auth_user_id)
            streak_val = streak.current_streak
            longest_streak_val = streak.longest_streak
        except Exception:
            pass

        # 4. Missions completion rate (last 7 days)
        # Query UserMissions
        missions = (
            self.db.query(UserMission)
            .filter(UserMission.user_id == user.id, UserMission.assigned_date >= today - timedelta(days=6))
            .all()
        )
        total_assigned = len(missions)
        total_completed = sum(1 for m in missions if m.status == "completed")
        completion_rate = f"{(total_completed / total_assigned * 100):.0f}%" if total_assigned > 0 else "0%"

        return {
            "user_profile": prefs,
            "weekly_footprint_totals": {
                "transport": weekly_footprint.get("transport", 0.0),
                "food": weekly_footprint.get("food", 0.0),
                "electricity": weekly_footprint.get("electricity", 0.0),
                "shopping": weekly_footprint.get("shopping", 0.0),
                "total": curr_total
            },
            "highest_emission_category": highest_cat,
            "current_streak": streak_val,
            "longest_streak": longest_streak_val,
            "mission_completion_rate": completion_rate,
            "recent_trend_information": trend
        }

    def _log_generation(self, user_uuid: UUID, prompt_type: str, status: str, time_ms: int) -> None:
        """Insert generation log audit."""
        try:
            log = AIGenerationLog(
                user_id=user_uuid,
                prompt_type=prompt_type,
                status=status,
                generation_time_ms=time_ms,
                created_at=datetime.now(timezone.utc)
            )
            self.log_repo.create(log)
        except Exception as e:
            logger.error(f"Failed to log AI generation: {str(e)}")

from sqlalchemy.orm import Session
from sqlalchemy import cast, Date, func, and_
from uuid import UUID
from datetime import date, datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from decimal import Decimal

from app.models.gamification import SustainabilityScore, Achievement, UserAchievement, ScoreHistory
from app.models.activity import ActivityEvent
from app.models.mission import UserMission, MissionTemplate
from app.models.streak import UserStreak
from app.models.footprint import DailyFootprint
from app.models.community import GroupMember

from app.repositories.gamification import (
    SustainabilityScoreRepository,
    AchievementRepository,
    UserAchievementRepository,
    ScoreHistoryRepository
)

class SustainabilityScoreService:
    def __init__(self, db: Session):
        self.db = db
        self.score_repo = SustainabilityScoreRepository(db)
        self.history_repo = ScoreHistoryRepository(db)

    def calculate_and_save_score(self, user_id: UUID) -> SustainabilityScore:
        today = datetime.now(timezone.utc).date()
        start_30d = today - timedelta(days=29)

        # 1. Consistency Score (40%): (distinct_activity_logging_days_in_30d / 30) * 100
        distinct_days = (
            self.db.query(func.count(func.distinct(cast(ActivityEvent.created_at, Date))))
            .filter(
                ActivityEvent.user_id == user_id,
                cast(ActivityEvent.created_at, Date) >= start_30d,
                cast(ActivityEvent.created_at, Date) <= today
            )
            .scalar()
        ) or 0
        consistency_score = int(min((distinct_days / 30.0) * 100.0, 100.0))

        # 2. Mission Score (25%): 60% completion rate + 40% diversity
        assigned_missions = (
            self.db.query(UserMission)
            .filter(
                UserMission.user_id == user_id,
                UserMission.assigned_date >= start_30d,
                UserMission.assigned_date <= today
            )
            .all()
        )
        assigned_count = len(assigned_missions)
        completed_count = sum(1 for m in assigned_missions if m.status == "completed")
        completion_rate = (completed_count / assigned_count) * 100.0 if assigned_count > 0 else 0.0

        # Diversity: distinct categories of completed missions in 30d
        completed_categories = (
            self.db.query(func.distinct(MissionTemplate.category))
            .select_from(UserMission)
            .join(MissionTemplate, UserMission.mission_template_id == MissionTemplate.id)
            .filter(
                UserMission.user_id == user_id,
                UserMission.assigned_date >= start_30d,
                UserMission.assigned_date <= today,
                UserMission.status == "completed"
            )
            .all()
        )
        diversity_count = len(completed_categories)
        diversity_score = min(diversity_count * 25.0, 100.0)  # max 4 categories = 100
        mission_score = int(round(completion_rate * 0.60 + diversity_score * 0.40))

        # 3. Streak Score (20%): min(current_streak * 5, 50) + min(longest_streak * 1.67, 50)
        streak_obj = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        current_streak = streak_obj.current_streak if streak_obj else 0
        longest_streak = streak_obj.longest_streak if streak_obj else 0
        streak_score = int(round(min(current_streak * 5.0, 50.0) + min(longest_streak * 1.67, 50.0)))

        # 4. Improvement Score (15%): Week 1 vs Week 2 emissions trend
        start_w1 = today - timedelta(days=6)
        start_w2 = today - timedelta(days=13)
        end_w2 = today - timedelta(days=7)

        w1_emissions = (
            self.db.query(func.sum(DailyFootprint.total_emissions))
            .filter(
                DailyFootprint.user_id == user_id,
                DailyFootprint.date >= start_w1,
                DailyFootprint.date <= today
            )
            .scalar()
        ) or Decimal("0.0")

        w2_emissions = (
            self.db.query(func.sum(DailyFootprint.total_emissions))
            .filter(
                DailyFootprint.user_id == user_id,
                DailyFootprint.date >= start_w2,
                DailyFootprint.date <= end_w2
            )
            .scalar()
        ) or Decimal("0.0")

        w1_val = float(w1_emissions)
        w2_val = float(w2_emissions)

        if w2_val <= 0:
            improvement_score = 50  # Neutral baseline
        else:
            if w1_val < w2_val:
                reduction_pct = (w2_val - w1_val) / w2_val
                improvement_score = int(round(min(50.0 + (reduction_pct * 50.0), 100.0)))
            else:
                increase_pct = (w1_val - w2_val) / w2_val
                improvement_score = int(round(max(50.0 - (increase_pct * 50.0), 0.0)))

        # Overall Score Formula: 40% consistency + 25% mission + 20% streak + 15% improvement
        overall_score = int(round(
            0.40 * consistency_score +
            0.25 * mission_score +
            0.20 * streak_score +
            0.15 * improvement_score
        ))

        # Save or update SustainabilityScore
        score_obj = self.score_repo.get_by_user_id(user_id)
        if not score_obj:
            score_obj = SustainabilityScore(
                user_id=user_id,
                overall_score=overall_score,
                consistency_score=consistency_score,
                mission_score=mission_score,
                streak_score=streak_score,
                improvement_score=improvement_score
            )
            score_obj = self.score_repo.create(score_obj)
        else:
            score_obj.overall_score = overall_score
            score_obj.consistency_score = consistency_score
            score_obj.mission_score = mission_score
            score_obj.streak_score = streak_score
            score_obj.improvement_score = improvement_score
            score_obj = self.score_repo.update(score_obj)

        # Log daily score history (update if exists today, else create)
        history_today = (
            self.db.query(ScoreHistory)
            .filter(
                ScoreHistory.user_id == user_id,
                cast(ScoreHistory.recorded_at, Date) == today
            )
            .first()
        )
        if history_today:
            history_today.score = overall_score
            self.db.commit()
        else:
            new_history = ScoreHistory(
                user_id=user_id,
                score=overall_score
            )
            self.history_repo.create(new_history)

        # Trigger achievements check
        AchievementService(self.db).evaluate_and_award_achievements(user_id)

        return score_obj


class AchievementService:
    def __init__(self, db: Session):
        self.db = db
        self.ach_repo = AchievementRepository(db)
        self.user_ach_repo = UserAchievementRepository(db)

    def evaluate_and_award_achievements(self, user_id: UUID) -> List[UserAchievement]:
        # Fetch user metrics
        activity_count = self.db.query(ActivityEvent).filter(ActivityEvent.user_id == user_id).count()
        completed_missions = (
            self.db.query(UserMission)
            .filter(UserMission.user_id == user_id, UserMission.status == "completed")
            .count()
        )
        streak_obj = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        longest_streak = streak_obj.longest_streak if streak_obj else 0
        groups_joined = self.db.query(GroupMember).filter(GroupMember.user_id == user_id).count()

        # Evaluate Weekly Reduction (Week 1 vs Week 2)
        today = datetime.now(timezone.utc).date()
        w1_val = float(
            (
                self.db.query(func.sum(DailyFootprint.total_emissions))
                .filter(DailyFootprint.user_id == user_id, DailyFootprint.date >= today - timedelta(days=6))
                .scalar()
            ) or Decimal("0.0")
        )
        w2_val = float(
            (
                self.db.query(func.sum(DailyFootprint.total_emissions))
                .filter(DailyFootprint.user_id == user_id, DailyFootprint.date >= today - timedelta(days=13), DailyFootprint.date <= today - timedelta(days=7))
                .scalar()
            ) or Decimal("0.0")
        )
        reduced_10_percent = False
        if w2_val > 0:
            reduction_pct = (w2_val - w1_val) / w2_val
            if reduction_pct >= 0.10:
                reduced_10_percent = True

        new_awards = []

        # Rules checking
        rules = [
            ("First Step", activity_count >= 1),
            ("Mission Starter", completed_missions >= 1),
            ("Week Warrior", longest_streak >= 7),
            ("Green Champion", longest_streak >= 30),
            ("Carbon Saver", reduced_10_percent),
            ("Community Leader", groups_joined >= 1)
        ]

        for title, qualified in rules:
            if qualified:
                ach = self.ach_repo.get_by_title(title)
                if ach:
                    # Check if already unlocked
                    unlocked = self.user_ach_repo.get_by_user_and_achievement(user_id, ach.id)
                    if not unlocked:
                        award = UserAchievement(
                            user_id=user_id,
                            achievement_id=ach.id
                        )
                        new_awards.append(self.user_ach_repo.create(award))

        return new_awards

    def get_achievement_progress(self, user_id: UUID) -> List[Dict[str, Any]]:
        # Fetch metric levels
        activity_count = self.db.query(ActivityEvent).filter(ActivityEvent.user_id == user_id).count()
        completed_missions = (
            self.db.query(UserMission)
            .filter(UserMission.user_id == user_id, UserMission.status == "completed")
            .count()
        )
        streak_obj = self.db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        longest_streak = streak_obj.longest_streak if streak_obj else 0
        groups_joined = self.db.query(GroupMember).filter(GroupMember.user_id == user_id).count()

        today = datetime.now(timezone.utc).date()
        w1_val = float(
            (
                self.db.query(func.sum(DailyFootprint.total_emissions))
                .filter(DailyFootprint.user_id == user_id, DailyFootprint.date >= today - timedelta(days=6))
                .scalar()
            ) or Decimal("0.0")
        )
        w2_val = float(
            (
                self.db.query(func.sum(DailyFootprint.total_emissions))
                .filter(DailyFootprint.user_id == user_id, DailyFootprint.date >= today - timedelta(days=13), DailyFootprint.date <= today - timedelta(days=7))
                .scalar()
            ) or Decimal("0.0")
        )
        reduction_pct = 0.0
        if w2_val > 0:
            reduction_pct = max((w2_val - w1_val) / w2_val, 0.0)

        # Available achievements
        all_ach = self.ach_repo.list_all()
        user_ach_map = {ua.achievement_id: ua for ua in self.user_ach_repo.list_by_user(user_id)}

        progress_list = []
        for ach in all_ach:
            earned = ach.id in user_ach_map
            earned_at = user_ach_map[ach.id].earned_at if earned else None

            # Calculate current_progress and target based on achievement title
            if ach.title == "First Step":
                curr, target = float(activity_count), 1.0
            elif ach.title == "Mission Starter":
                curr, target = float(completed_missions), 1.0
            elif ach.title == "Week Warrior":
                curr, target = float(longest_streak), 7.0
            elif ach.title == "Green Champion":
                curr, target = float(longest_streak), 30.0
            elif ach.title == "Carbon Saver":
                curr, target = reduction_pct, 0.10
            elif ach.title == "Community Leader":
                curr, target = float(groups_joined), 1.0
            else:
                curr, target = 0.0, 1.0

            # Cap current at target if earned
            if earned:
                curr = target

            progress_list.append({
                "id": ach.id,
                "title": ach.title,
                "description": ach.description,
                "badge_icon": ach.badge_icon,
                "category": ach.category,
                "points": ach.points,
                "earned": earned,
                "earned_at": earned_at,
                "current_progress": round(curr, 2),
                "target": target
            })

        return progress_list

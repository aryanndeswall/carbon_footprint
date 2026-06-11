from datetime import datetime, timezone, timedelta
from typing import List, Tuple
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.streak import UserStreak, StreakEvent
from app.repositories.user_streak import UserStreakRepository
from app.repositories.streak_event import StreakEventRepository
from app.repositories.user import UserRepository

class RetentionService:
    """
    Service layer for tracking streaks, applying freezes, and serving analytics.
    """
    def __init__(self, db: Session):
        self.db = db
        self.streak_repo = UserStreakRepository(db)
        self.event_repo = StreakEventRepository(db)
        self.user_repo = UserRepository(db)

    def get_or_create_streak(self, auth_user_id: UUID) -> UserStreak:
        """
        Retrieves the UserStreak record for a user.
        Lazily evaluates and updates if the user has missed days:
        - If missed exactly 1 day (yesterday) and has a freeze: uses freeze and preserves streak.
        - Otherwise, breaks streak and resets current_streak to 0.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        streak = self.streak_repo.get_by_user_id(user.id)
        if not streak:
            streak = UserStreak(
                user_id=user.id,
                current_streak=0,
                longest_streak=0,
                last_activity_date=None,
                freeze_count=1
            )
            streak = self.streak_repo.create(streak)
            return streak

        today_date = datetime.now(timezone.utc).date()
        
        # If no previous activity, return as is
        if streak.last_activity_date is None:
            return streak

        # If last activity was today or yesterday, streak is currently active
        if streak.last_activity_date >= today_date - timedelta(days=1):
            return streak

        # Missed days evaluation
        missed_days = (today_date - streak.last_activity_date).days
        
        if missed_days == 2:  # Missed exactly yesterday
            if streak.freeze_count > 0:
                # Apply freeze automatically
                previous_streak = streak.current_streak
                streak.freeze_count -= 1
                streak.last_activity_date = today_date - timedelta(days=1)  # Set to yesterday (frozen)
                self.streak_repo.update(streak)
                
                # Log event
                event = StreakEvent(
                    user_id=user.id,
                    event_type="freeze_used",
                    previous_streak=previous_streak,
                    new_streak=previous_streak
                )
                self.event_repo.create(event)
            else:
                # Break streak
                previous_streak = streak.current_streak
                streak.current_streak = 0
                self.streak_repo.update(streak)
                
                # Log event
                event = StreakEvent(
                    user_id=user.id,
                    event_type="streak_broken",
                    previous_streak=previous_streak,
                    new_streak=0
                )
                self.event_repo.create(event)
        else:  # Missed multiple days
            previous_streak = streak.current_streak
            streak.current_streak = 0
            self.streak_repo.update(streak)
            
            # Log event
            event = StreakEvent(
                user_id=user.id,
                event_type="streak_broken",
                previous_streak=previous_streak,
                new_streak=0
            )
            self.event_repo.create(event)

        return streak

    def evaluate_and_update_streak(self, user_uuid: UUID) -> UserStreak:
        """
        Invoked when a user completes a qualifying action (activity log or mission completion).
        Checks/updates the user's daily streak.
        NOTE: user_uuid is the user's primary database ID (user.id).
        """
        streak = self.streak_repo.get_by_user_id(user_uuid)
        if not streak:
            # Fallback: create streak record if not exists
            streak = UserStreak(
                user_id=user_uuid,
                current_streak=0,
                longest_streak=0,
                last_activity_date=None,
                freeze_count=1
            )
            self.streak_repo.create(streak)

        # Retrieve the auth_user_id to use get_or_create_streak's self-healing checks
        from app.models.user import User
        user = self.db.query(User).filter(User.id == user_uuid).first()
        if not user:
            return streak

        # Run lazy evaluation checks first
        streak = self.get_or_create_streak(user.auth_user_id)

        today_date = datetime.now(timezone.utc).date()
        
        # If already logged activity today, streak is already extended.
        if streak.last_activity_date == today_date:
            return streak

        previous_streak = streak.current_streak

        # If last activity was yesterday, extend streak
        if streak.last_activity_date == today_date - timedelta(days=1):
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak.last_activity_date = today_date
            self.streak_repo.update(streak)

            # Log event
            event = StreakEvent(
                user_id=user.id,
                event_type="streak_extended",
                previous_streak=previous_streak,
                new_streak=streak.current_streak
            )
            self.event_repo.create(event)

        # If no previous activity or streak was broken/reset to 0
        else:
            streak.current_streak = 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
            streak.last_activity_date = today_date
            self.streak_repo.update(streak)

            # Log event
            event = StreakEvent(
                user_id=user.id,
                event_type="streak_started",
                previous_streak=previous_streak,
                new_streak=1
            )
            self.event_repo.create(event)

        return streak

    def manual_use_freeze(self, auth_user_id: UUID) -> UserStreak:
        """
        Manually spends a streak freeze to protect/preserve the streak.
        """
        # Run lazy self-healing first
        streak = self.get_or_create_streak(auth_user_id)

        if streak.freeze_count <= 0:
            raise ValueError("No freezes available")

        today_date = datetime.now(timezone.utc).date()
        previous_streak = streak.current_streak

        # Retrospective freeze (missed yesterday)
        if streak.last_activity_date == today_date - timedelta(days=2):
            streak.freeze_count -= 1
            streak.last_activity_date = today_date - timedelta(days=1)
            self.streak_repo.update(streak)
            
            event = StreakEvent(
                user_id=streak.user_id,
                event_type="freeze_used",
                previous_streak=previous_streak,
                new_streak=previous_streak
            )
            self.event_repo.create(event)
        # Preemptive freeze (freeze today)
        else:
            streak.freeze_count -= 1
            streak.last_activity_date = today_date
            self.streak_repo.update(streak)
            
            event = StreakEvent(
                user_id=streak.user_id,
                event_type="freeze_used",
                previous_streak=previous_streak,
                new_streak=previous_streak
            )
            self.event_repo.create(event)

        return streak

    def get_streak_history(
        self, auth_user_id: UUID, page: int = 1, page_size: int = 20
    ) -> Tuple[List[StreakEvent], int]:
        """
        Get paginated streak events history for the user.
        """
        user = self.user_repo.get_by_auth_user_id(auth_user_id)
        if not user:
            raise ValueError("User profile not found")

        return self.event_repo.get_by_user_id_paginated(user.id, page, page_size)

    def get_global_stats(self) -> dict:
        """
        Calculates global streak metrics for analytics.
        """
        active_streaks = self.db.query(func.count(UserStreak.id)).filter(UserStreak.current_streak > 0).scalar() or 0
        avg_streak_length = self.db.query(func.avg(UserStreak.current_streak)).filter(UserStreak.current_streak > 0).scalar() or 0.0
        longest_streak = self.db.query(func.max(UserStreak.longest_streak)).scalar() or 0
        freezes_used = self.db.query(func.count(StreakEvent.id)).filter(StreakEvent.event_type == "freeze_used").scalar() or 0

        return {
            "active_streaks": int(active_streaks),
            "average_streak_length": float(avg_streak_length),
            "longest_streak": int(longest_streak),
            "freezes_used": int(freezes_used)
        }

from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from app.models.gamification import SustainabilityScore, Achievement, UserAchievement, ScoreHistory

class SustainabilityScoreRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: UUID) -> Optional[SustainabilityScore]:
        return self.db.query(SustainabilityScore).filter(SustainabilityScore.user_id == user_id).first()

    def create(self, score: SustainabilityScore) -> SustainabilityScore:
        self.db.add(score)
        self.db.commit()
        self.db.refresh(score)
        return score

    def update(self, score: SustainabilityScore) -> SustainabilityScore:
        self.db.commit()
        self.db.refresh(score)
        return score


class AchievementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, achievement_id: UUID) -> Optional[Achievement]:
        return self.db.query(Achievement).filter(Achievement.id == achievement_id).first()

    def get_by_title(self, title: str) -> Optional[Achievement]:
        return self.db.query(Achievement).filter(Achievement.title == title).first()

    def list_all(self) -> List[Achievement]:
        return self.db.query(Achievement).order_by(Achievement.points.asc()).all()

    def create(self, achievement: Achievement) -> Achievement:
        self.db.add(achievement)
        self.db.commit()
        self.db.refresh(achievement)
        return achievement


class UserAchievementRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_and_achievement(self, user_id: UUID, achievement_id: UUID) -> Optional[UserAchievement]:
        return (
            self.db.query(UserAchievement)
            .filter(UserAchievement.user_id == user_id, UserAchievement.achievement_id == achievement_id)
            .first()
        )

    def list_by_user(self, user_id: UUID) -> List[UserAchievement]:
        return (
            self.db.query(UserAchievement)
            .filter(UserAchievement.user_id == user_id)
            .order_by(UserAchievement.earned_at.desc())
            .all()
        )

    def create(self, user_ach: UserAchievement) -> UserAchievement:
        self.db.add(user_ach)
        self.db.commit()
        self.db.refresh(user_ach)
        return user_ach


class ScoreHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_user(self, user_id: UUID, limit: int = 30) -> List[ScoreHistory]:
        return (
            self.db.query(ScoreHistory)
            .filter(ScoreHistory.user_id == user_id)
            .order_by(ScoreHistory.recorded_at.desc())
            .limit(limit)
            .all()
        )

    def create(self, history: ScoreHistory) -> ScoreHistory:
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.user import User
from app.schemas.gamification import (
    SustainabilityScoreResponse,
    ScoreHistoryResponse,
    AchievementResponse,
    UnlockedAchievementResponse,
    AchievementProgressResponse
)
from app.repositories.gamification import (
    SustainabilityScoreRepository,
    AchievementRepository,
    UserAchievementRepository,
    ScoreHistoryRepository
)
from app.services.gamification import SustainabilityScoreService, AchievementService

router = APIRouter(tags=["Gamification & Achievements"])

def _get_db_user(request: Request, db: Session) -> User:
    auth_user_id = UUID(request.state.user_id)
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user profile not found"
        )
    return user

@router.get("/score", response_model=SustainabilityScoreResponse)
def get_user_sustainability_score(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the user's current sustainability score.
    Triggers recalculation if it hasn't been updated today.
    """
    user = _get_db_user(request, db)
    score_repo = SustainabilityScoreRepository(db)
    score = score_repo.get_by_user_id(user.id)
    
    score_service = SustainabilityScoreService(db)
    today = datetime.now(timezone.utc).date()

    if not score or score.updated_at.date() < today:
        # Calculate/update score
        score = score_service.calculate_and_save_score(user.id)

    return {
        "success": True,
        "data": score,
        "message": "Sustainability score retrieved successfully"
    }

@router.get("/score/history", response_model=ScoreHistoryResponse)
def get_user_score_history(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get score history for trend analysis.
    """
    user = _get_db_user(request, db)
    history_repo = ScoreHistoryRepository(db)
    history = history_repo.list_by_user(user.id, limit=30)
    return {
        "success": True,
        "data": history,
        "message": "Score history retrieved successfully"
    }

@router.get("/achievements", response_model=AchievementResponse)
def get_all_achievements(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    List all available achievements in the system.
    """
    ach_repo = AchievementRepository(db)
    achievements = ach_repo.list_all()
    return {
        "success": True,
        "data": achievements,
        "message": "Achievements retrieved successfully"
    }

@router.get("/achievements/unlocked", response_model=UnlockedAchievementResponse)
def get_unlocked_achievements(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the user's unlocked achievements/badges.
    """
    user = _get_db_user(request, db)
    user_ach_repo = UserAchievementRepository(db)
    unlocked = user_ach_repo.list_by_user(user.id)
    return {
        "success": True,
        "data": unlocked,
        "message": "Unlocked achievements retrieved successfully"
    }

@router.get("/achievements/progress", response_model=AchievementProgressResponse)
def get_user_achievements_progress(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Show progress towards all available achievements.
    """
    user = _get_db_user(request, db)
    ach_service = AchievementService(db)
    progress = ach_service.get_achievement_progress(user.id)
    return {
        "success": True,
        "data": progress,
        "message": "Achievement progress retrieved successfully"
    }

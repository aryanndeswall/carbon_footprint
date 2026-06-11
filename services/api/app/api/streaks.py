from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.services.retention import RetentionService
from app.schemas.streak import (
    StreakResponse,
    StreakEventListResponse,
    StreakStatsResponse
)

router = APIRouter(prefix="/streaks", tags=["Streaks"])

@router.get("/current", response_model=StreakResponse)
def get_current_streak(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the user's current streak details. Runs lazy self-healing checks beforehand.
    """
    auth_user_id = UUID(request.state.user_id)
    retention_service = RetentionService(db)
    try:
        streak = retention_service.get_or_create_streak(auth_user_id)
        return {
            "success": True,
            "data": streak,
            "message": "Current streak retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/history", response_model=StreakEventListResponse)
def get_streak_history(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get the historical list of streak events for the user.
    """
    auth_user_id = UUID(request.state.user_id)
    retention_service = RetentionService(db)
    try:
        events, total_items = retention_service.get_streak_history(
            auth_user_id, page=page, page_size=page_size
        )
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
        return {
            "success": True,
            "data": events,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total_items,
                "total_pages": total_pages
            },
            "message": "Streak history retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/use-freeze", response_model=StreakResponse)
def use_streak_freeze(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Manually use a streak freeze.
    """
    auth_user_id = UUID(request.state.user_id)
    retention_service = RetentionService(db)
    try:
        streak = retention_service.manual_use_freeze(auth_user_id)
        return {
            "success": True,
            "data": streak,
            "message": "Streak freeze applied successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/stats", response_model=StreakStatsResponse)
def get_streak_stats(
    db: Session = Depends(get_db)
):
    """
    Get global aggregate statistics for user retention and streaks.
    """
    retention_service = RetentionService(db)
    try:
        stats = retention_service.get_global_stats()
        return {
            "success": True,
            "data": stats,
            "message": "Streak statistics retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

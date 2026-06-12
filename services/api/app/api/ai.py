import math
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.services.ai.service import AIInsightService
from app.schemas.ai import (
    AIInsightResponse,
    AIInsightHistoryResponse,
    GenerateInsightRequest
)

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/insights/latest", response_model=AIInsightResponse)
def get_latest_insight(
    request: Request,
    type: str = "daily_coach",
    db: Session = Depends(get_db)
):
    """
    Get the latest generated insight of a specific type (e.g. daily_coach).
    If none exists in cache, generates a new one on the fly.
    """
    auth_user_id = UUID(request.state.user_id)
    
    # Map design doc's daily_coaching query parameter to daily_coach type
    if type == "daily_coaching":
        type = "daily_coach"

    if type not in ["daily_coach", "weekly_summary", "recommendation", "achievement", "warning"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid insight type: {type}"
        )

    ai_service = AIInsightService(db)
    try:
        insight = ai_service.get_latest_insight(auth_user_id, type)
        return {
            "success": True,
            "data": insight,
            "message": "Latest insight retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve latest insight: {str(e)}"
        )

@router.get("/insights/history", response_model=AIInsightHistoryResponse)
def get_insight_history(
    request: Request,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated historical insights generated for the user.
    """
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=400, detail="Page size must be between 1 and 100")

    auth_user_id = UUID(request.state.user_id)
    ai_service = AIInsightService(db)
    
    try:
        insights, total_items = ai_service.get_insight_history(auth_user_id, page, page_size)
        total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0
        return {
            "success": True,
            "data": insights,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total_items,
                "total_pages": total_pages
            },
            "message": "Historical insights retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve insight history: {str(e)}"
        )

@router.post("/insights/generate", response_model=AIInsightResponse)
def generate_insight(
    request: Request,
    payload: GenerateInsightRequest,
    db: Session = Depends(get_db)
):
    """
    Force generation of a new coaching insight or weekly summary.
    """
    auth_user_id = UUID(request.state.user_id)
    insight_type = payload.insight_type
    
    if insight_type == "daily_coaching":
        insight_type = "daily_coach"

    if insight_type not in ["daily_coach", "weekly_summary"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insight generation only supported for daily_coach or weekly_summary, got '{insight_type}'"
        )

    ai_service = AIInsightService(db)
    try:
        if insight_type == "weekly_summary":
            insight = ai_service.generate_weekly_summary(auth_user_id)
        else:
            insight = ai_service.generate_daily_coach(auth_user_id)
            
        return {
            "success": True,
            "data": insight,
            "message": "Insight generated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insight: {str(e)}"
        )

@router.get("/weekly-summary", response_model=AIInsightResponse)
def get_weekly_summary(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieve the user's weekly summary. If not already generated/cached, triggers new generation.
    """
    auth_user_id = UUID(request.state.user_id)
    ai_service = AIInsightService(db)
    try:
        insight = ai_service.get_latest_insight(auth_user_id, "weekly_summary")
        return {
            "success": True,
            "data": insight,
            "message": "Weekly summary retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve weekly summary: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.services.mission_engine import MissionEngineService
from app.models.mission import UserMission
from app.schemas.mission import (
    MissionResponse,
    MissionListResponse,
    RecommendedMissionResponse
)

router = APIRouter(prefix="/missions", tags=["Missions"])

def _format_user_mission(um: UserMission) -> dict:
    return {
        "id": um.id,
        "user_id": um.user_id,
        "mission_template_id": um.mission_template_id,
        "assigned_date": um.assigned_date,
        "status": um.status,
        "completed_at": um.completed_at,
        "created_at": um.created_at,
        "title": um.template.title,
        "category": um.template.category,
        "difficulty": um.template.difficulty,
        "estimated_co2_saving": float(um.template.estimated_co2_saving),
        "estimated_time_minutes": um.template.estimated_time_minutes
    }

@router.get("/today", response_model=MissionResponse)
def get_today_mission(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the daily mission for today. If none exists, one will be generated.
    """
    auth_user_id = UUID(request.state.user_id)
    engine_service = MissionEngineService(db)
    try:
        mission = engine_service.get_or_assign_daily_mission(auth_user_id)
        return {
            "success": True,
            "data": _format_user_mission(mission),
            "message": "Today's daily mission retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/recommended", response_model=RecommendedMissionResponse)
def get_recommended_mission(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get a personalized recommended mission template.
    """
    auth_user_id = UUID(request.state.user_id)
    engine_service = MissionEngineService(db)
    try:
        template = engine_service.get_recommended_mission(auth_user_id)
        return {
            "success": True,
            "data": {
                "title": template.title,
                "category": template.category,
                "difficulty": template.difficulty,
                "estimated_co2_saving": float(template.estimated_co2_saving),
                "estimated_time_minutes": template.estimated_time_minutes
            },
            "message": "Recommended mission template retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/history", response_model=MissionListResponse)
def list_missions_history(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get the history of user mission assignments.
    """
    auth_user_id = UUID(request.state.user_id)
    engine_service = MissionEngineService(db)
    try:
        missions, total_items = engine_service.get_mission_history(
            auth_user_id, page=page, page_size=page_size
        )
        formatted_missions = [_format_user_mission(um) for um in missions]
        total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
        
        return {
            "success": True,
            "data": formatted_missions,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total_items,
                "total_pages": total_pages
            },
            "message": "Mission history retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{id}/complete", response_model=MissionResponse)
def complete_user_mission(
    request: Request,
    id: UUID,
    db: Session = Depends(get_db)
):
    """
    Mark a daily mission as completed.
    """
    auth_user_id = UUID(request.state.user_id)
    engine_service = MissionEngineService(db)
    try:
        mission = engine_service.complete_mission(auth_user_id, id)
        return {
            "success": True,
            "data": _format_user_mission(mission),
            "message": "Mission marked as completed successfully"
        }
    except ValueError as e:
        error_msg = str(e)
        if "already completed" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )

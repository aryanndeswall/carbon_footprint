from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.database.session import get_db
from app.services.activity import ActivityService
from app.schemas.activity import (
    CreateActivityRequest,
    ActivityResponse,
    ActivityListResponse
)

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.post("", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    request: Request,
    payload: CreateActivityRequest,
    db: Session = Depends(get_db)
):
    """
    Log a new activity.
    """
    auth_user_id = UUID(request.state.user_id)
    activity_service = ActivityService(db)
    try:
        activity = activity_service.create_activity(
            auth_user_id,
            category=payload.category,
            activity_type=payload.activity_type,
            quantity=payload.quantity,
            unit=payload.unit,
            metadata=payload.metadata
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    return {
        "success": True,
        "data": activity,
        "message": "Activity logged successfully"
    }

@router.get("", response_model=ActivityListResponse)
def list_activities(
    request: Request,
    category: Optional[str] = None,
    activity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List user activities with optional filters and pagination.
    """
    auth_user_id = UUID(request.state.user_id)
    activity_service = ActivityService(db)
    activities, total_items = activity_service.get_user_activities(
        auth_user_id,
        category=category,
        activity_type=activity_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )
    
    total_pages = (total_items + page_size - 1) // page_size if total_items > 0 else 0
    
    return {
        "success": True,
        "data": activities,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages
        },
        "message": "Activities retrieved successfully"
    }

@router.get("/history", response_model=ActivityListResponse)
def get_activities_history(
    request: Request,
    category: Optional[str] = None,
    activity_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve user activity history (alias to the list endpoint).
    """
    return list_activities(
        request=request,
        category=category,
        activity_type=activity_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size,
        db=db
    )

@router.get("/{id}", response_model=ActivityResponse)
def get_activity_details(
    request: Request,
    id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get detailed breakdown of a single activity event.
    """
    auth_user_id = UUID(request.state.user_id)
    activity_service = ActivityService(db)
    activity = activity_service.get_activity_by_id(auth_user_id, id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found"
        )
    return {
        "success": True,
        "data": activity,
        "message": "Activity details retrieved successfully"
    }

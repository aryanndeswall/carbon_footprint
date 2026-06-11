from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone, date, timedelta
from app.database.session import get_db
from app.services.carbon_engine import CarbonEngineService
from app.schemas.footprint import FootprintResponse

router = APIRouter(prefix="/footprints", tags=["Footprints"])

@router.get("/today", response_model=FootprintResponse)
def get_today_footprint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the carbon footprint totals for today.
    """
    auth_user_id = UUID(request.state.user_id)
    today = datetime.now(timezone.utc).date()
    engine_service = CarbonEngineService(db)
    try:
        summary = engine_service.get_footprint_by_date(auth_user_id, today)
        return {
            "success": True,
            "data": summary,
            "message": "Today's footprint retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/weekly", response_model=FootprintResponse)
def get_weekly_footprint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the rolling weekly carbon footprint totals (last 7 days inclusive).
    """
    auth_user_id = UUID(request.state.user_id)
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=6)
    engine_service = CarbonEngineService(db)
    try:
        summary = engine_service.get_footprint_summary(auth_user_id, start_date, today)
        return {
            "success": True,
            "data": summary,
            "message": "Weekly footprint summary retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/monthly", response_model=FootprintResponse)
def get_monthly_footprint(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get the rolling monthly carbon footprint totals (last 30 days inclusive).
    """
    auth_user_id = UUID(request.state.user_id)
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=29)
    engine_service = CarbonEngineService(db)
    try:
        summary = engine_service.get_footprint_summary(auth_user_id, start_date, today)
        return {
            "success": True,
            "data": summary,
            "message": "Monthly footprint summary retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/breakdown", response_model=FootprintResponse)
def get_footprint_breakdown(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get all-time carbon footprint breakdown by category.
    """
    auth_user_id = UUID(request.state.user_id)
    engine_service = CarbonEngineService(db)
    try:
        summary = engine_service.get_breakdown(auth_user_id)
        return {
            "success": True,
            "data": summary,
            "message": "All-time footprint breakdown retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get("/{target_date}", response_model=FootprintResponse)
def get_footprint_by_date(
    request: Request,
    target_date: str,
    db: Session = Depends(get_db)
):
    """
    Get carbon footprint totals for a specific date (YYYY-MM-DD).
    """
    auth_user_id = UUID(request.state.user_id)
    try:
        parsed_date = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )
    engine_service = CarbonEngineService(db)
    try:
        summary = engine_service.get_footprint_by_date(auth_user_id, parsed_date)
        return {
            "success": True,
            "data": summary,
            "message": f"Footprint for {target_date} retrieved successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.session import get_db
from app.services.user import UserService
from app.schemas.user import (
    UserResponse,
    UpdateUserRequest,
    UserPreferencesResponse,
    UpdatePreferencesRequest,
    OnboardingRequest
)

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(request: Request, db: Session = Depends(get_db)):
    """
    Get the current authenticated user's profile.
    If the profile does not exist yet (first login), it is created with default preferences.
    """
    auth_user_id = UUID(request.state.user_id)
    email = request.state.user_email or ""
    
    user_service = UserService(db)
    user = user_service.get_or_create_user(auth_user_id, email)
    return {
        "success": True,
        "data": user,
        "message": "Profile retrieved successfully"
    }

@router.patch("/me", response_model=UserResponse)
def update_user_profile(
    request: Request,
    payload: UpdateUserRequest,
    db: Session = Depends(get_db)
):
    """
    Update the authenticated user's profile details.
    """
    auth_user_id = UUID(request.state.user_id)
    user_service = UserService(db)
    user = user_service.update_user_profile(
        auth_user_id,
        full_name=payload.full_name,
        avatar_url=payload.avatar_url
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        "success": True,
        "data": user,
        "message": "Profile updated successfully"
    }

@router.get("/preferences", response_model=UserPreferencesResponse)
def get_user_preferences(request: Request, db: Session = Depends(get_db)):
    """
    Get the authenticated user's preferences.
    """
    auth_user_id = UUID(request.state.user_id)
    user_service = UserService(db)
    pref = user_service.get_user_preferences(auth_user_id)
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    return {
        "success": True,
        "data": pref,
        "message": "Preferences retrieved successfully"
    }

@router.patch("/preferences", response_model=UserPreferencesResponse)
def update_user_preferences(
    request: Request,
    payload: UpdatePreferencesRequest,
    db: Session = Depends(get_db)
):
    """
    Update the authenticated user's preferences.
    """
    auth_user_id = UUID(request.state.user_id)
    user_service = UserService(db)
    
    # Extract only values that are set
    update_data = payload.model_dump(exclude_none=True)
    
    pref = user_service.update_user_preferences(auth_user_id, **update_data)
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    return {
        "success": True,
        "data": pref,
        "message": "Preferences updated successfully"
    }

@router.post("/onboarding", response_model=UserPreferencesResponse)
def complete_user_onboarding(
    request: Request,
    payload: OnboardingRequest,
    db: Session = Depends(get_db)
):
    """
    Store onboarding details for the authenticated user and mark onboarding complete.
    """
    auth_user_id = UUID(request.state.user_id)
    user_service = UserService(db)
    pref = user_service.complete_onboarding(
        auth_user_id,
        state_code=payload.state_code,
        diet_type=payload.diet_type,
        transport_preference=payload.transport_preference,
        housing_type=payload.housing_type
    )
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User preferences not found"
        )
    return {
        "success": True,
        "data": pref,
        "message": "Onboarding completed successfully"
    }

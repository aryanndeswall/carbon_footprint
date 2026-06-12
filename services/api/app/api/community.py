from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date, datetime
from typing import Optional, List

from app.database.session import get_db
from app.models.user import User
from app.schemas.community import (
    GroupCreate,
    GroupResponse,
    GroupListResponse,
    ChallengeCreate,
    ChallengeResponse,
    ChallengeListResponse,
    ChallengeParticipantListResponse,
    LeaderboardResponse,
    CommunityImpactResponse
)
from app.services.community import (
    GroupService,
    ChallengeService,
    LeaderboardService,
    CommunityImpactService
)

router = APIRouter(tags=["Community & Challenges"])

def _get_db_user_id(request: Request, db: Session) -> UUID:
    """
    Helper function to resolve the database User.id from the auth JWT token's state.user_id.
    """
    auth_user_id = UUID(request.state.user_id)
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user profile not found"
        )
    return user.id

def _format_group(group, db: Session) -> dict:
    group_service = GroupService(db)
    member_count = group_service.get_members_count(group.id)
    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "group_type": group.group_type,
        "created_by": group.created_by,
        "created_at": group.created_at,
        "member_count": member_count
    }

# --- GROUPS ENDPOINTS ---

@router.post("/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    request: Request,
    payload: GroupCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new community group/team. The creator is automatically added as a member.
    """
    user_id = _get_db_user_id(request, db)
    group_service = GroupService(db)
    try:
        group = group_service.create_group(
            name=payload.name,
            description=payload.description,
            group_type=payload.group_type or "friends",
            creator_id=user_id
        )
        return {
            "success": True,
            "data": _format_group(group, db),
            "message": "Group created successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/groups", response_model=GroupListResponse)
def list_groups(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    List all community groups.
    """
    group_service = GroupService(db)
    groups = group_service.list_groups()
    formatted_groups = [_format_group(g, db) for g in groups]
    return {
        "success": True,
        "data": formatted_groups,
        "message": "Groups retrieved successfully"
    }

@router.get("/groups/{group_id}", response_model=GroupResponse)
def get_group_details(
    request: Request,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get details for a specific group, including member count.
    """
    group_service = GroupService(db)
    group = group_service.get_group(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return {
        "success": True,
        "data": _format_group(group, db),
        "message": "Group details retrieved successfully"
    }

@router.post("/groups/{group_id}/join", response_model=GroupResponse)
def join_group(
    request: Request,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Join a community group. Returns the group details.
    """
    user_id = _get_db_user_id(request, db)
    group_service = GroupService(db)
    try:
        group_service.join_group(group_id, user_id)
        group = group_service.get_group(group_id)
        return {
            "success": True,
            "data": _format_group(group, db),
            "message": "Joined group successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/groups/{group_id}/leave")
def leave_group(
    request: Request,
    group_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Leave a community group.
    """
    user_id = _get_db_user_id(request, db)
    group_service = GroupService(db)
    try:
        group_service.leave_group(group_id, user_id)
        return {
            "success": True,
            "message": "Left group successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/groups/{group_id}/leaderboard", response_model=LeaderboardResponse)
def get_group_specific_leaderboard(
    request: Request,
    group_id: UUID,
    target_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve leaderboard ranking specifically for members of this group.
    """
    if not target_date:
        target_date = date.today()
    
    leaderboard_service = LeaderboardService(db)
    # Ensure group exists
    group_service = GroupService(db)
    group = group_service.get_group(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
        
    leaderboard = leaderboard_service.get_leaderboard(target_date, group_id)
    return {
        "success": True,
        "data": leaderboard,
        "message": "Group leaderboard retrieved successfully"
    }

# --- CHALLENGES ENDPOINTS ---

@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    request: Request,
    payload: ChallengeCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new sustainability challenge.
    """
    challenge_service = ChallengeService(db)
    challenge = challenge_service.create_challenge(
        title=payload.title,
        description=payload.description,
        challenge_type=payload.challenge_type,
        start_date=payload.start_date,
        end_date=payload.end_date
    )
    return {
        "success": True,
        "data": challenge,
        "message": "Challenge created successfully"
    }

@router.get("/challenges", response_model=ChallengeListResponse)
def list_challenges(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieve all challenges.
    """
    challenge_service = ChallengeService(db)
    challenges = challenge_service.list_challenges()
    return {
        "success": True,
        "data": challenges,
        "message": "Challenges retrieved successfully"
    }

@router.get("/challenges/{challenge_id}", response_model=ChallengeResponse)
def get_challenge_details(
    request: Request,
    challenge_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get details for a specific challenge.
    """
    challenge_service = ChallengeService(db)
    challenge = challenge_service.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    return {
        "success": True,
        "data": challenge,
        "message": "Challenge details retrieved successfully"
    }

@router.post("/challenges/{challenge_id}/join", response_model=ChallengeResponse)
def join_challenge(
    request: Request,
    challenge_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Join a challenge. Returns the challenge details.
    """
    user_id = _get_db_user_id(request, db)
    challenge_service = ChallengeService(db)
    try:
        challenge_service.join_challenge(challenge_id, user_id)
        challenge = challenge_service.get_challenge(challenge_id)
        return {
            "success": True,
            "data": challenge,
            "message": "Joined challenge successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/challenges/{challenge_id}/progress", response_model=ChallengeParticipantListResponse)
def get_challenge_progress(
    request: Request,
    challenge_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get participation progress list for a challenge.
    """
    challenge_service = ChallengeService(db)
    challenge = challenge_service.get_challenge(challenge_id)
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    participants = challenge_service.get_challenge_participants(challenge_id)
    return {
        "success": True,
        "data": participants,
        "message": "Challenge progress retrieved successfully"
    }

# --- GLOBAL LEADERBOARD & COMMUNITY IMPACT ---

@router.get("/leaderboard", response_model=LeaderboardResponse)
def get_leaderboard(
    request: Request,
    group_id: Optional[UUID] = Query(None),
    target_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get leaderboard ranking (either group-specific or global).
    """
    if not target_date:
        target_date = date.today()

    leaderboard_service = LeaderboardService(db)
    
    if group_id:
        # Ensure group exists
        group_service = GroupService(db)
        group = group_service.get_group(group_id)
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
            
    leaderboard = leaderboard_service.get_leaderboard(target_date, group_id)
    return {
        "success": True,
        "data": leaderboard,
        "message": "Leaderboard retrieved successfully"
    }

@router.get("/community-impact", response_model=CommunityImpactResponse)
def get_community_impact(
    request: Request,
    group_id: Optional[UUID] = Query(None),
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """
    Get carbon footprint savings metric (either group-specific or global).
    """
    if group_id:
        # Ensure group exists
        group_service = GroupService(db)
        group = group_service.get_group(group_id)
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )

    impact_service = CommunityImpactService(db)
    savings = impact_service.calculate_community_impact(group_id, days)
    return {
        "success": True,
        "data": {
            "total_saved_co2_kg": savings
        },
        "message": "Community impact retrieved successfully"
    }

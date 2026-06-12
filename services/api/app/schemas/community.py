from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    group_type: Optional[str] = Field("friends", max_length=50)

class GroupResponseData(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    group_type: str
    created_by: Optional[UUID]
    created_at: datetime
    member_count: int = 0

    model_config = {
        "from_attributes": True
    }

class GroupResponse(BaseModel):
    success: bool = True
    data: GroupResponseData
    message: Optional[str] = "Group processed successfully"

class GroupListResponse(BaseModel):
    success: bool = True
    data: List[GroupResponseData]
    message: Optional[str] = "Groups retrieved successfully"


class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    challenge_type: str = Field(..., max_length=50)
    start_date: date
    end_date: date

class ChallengeResponseData(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    challenge_type: str
    start_date: date
    end_date: date
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class ChallengeResponse(BaseModel):
    success: bool = True
    data: ChallengeResponseData
    message: Optional[str] = "Challenge processed successfully"

class ChallengeListResponse(BaseModel):
    success: bool = True
    data: List[ChallengeResponseData]
    message: Optional[str] = "Challenges retrieved successfully"


class ChallengeParticipantResponseData(BaseModel):
    id: UUID
    challenge_id: UUID
    user_id: UUID
    progress_score: float
    created_at: datetime
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class ChallengeParticipantListResponse(BaseModel):
    success: bool = True
    data: List[ChallengeParticipantResponseData]
    message: Optional[str] = "Challenge participants retrieved successfully"


class LeaderboardEntry(BaseModel):
    user_id: UUID
    full_name: Optional[str]
    avatar_url: Optional[str]
    rank: int
    score: float

class LeaderboardResponse(BaseModel):
    success: bool = True
    data: List[LeaderboardEntry]
    message: Optional[str] = "Leaderboard retrieved successfully"


class CommunityImpactResponseData(BaseModel):
    total_saved_co2_kg: float

class CommunityImpactResponse(BaseModel):
    success: bool = True
    data: CommunityImpactResponseData
    message: Optional[str] = "Community impact retrieved successfully"

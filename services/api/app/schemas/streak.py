from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.schemas.activity import PaginationMetadata

class StreakResponseData(BaseModel):
    current_streak: int
    longest_streak: int
    freeze_count: int

    model_config = {
        "from_attributes": True
    }

class StreakResponse(BaseModel):
    success: bool = True
    data: StreakResponseData
    message: Optional[str] = "Streak data processed successfully"

class StreakEventResponseData(BaseModel):
    id: UUID
    user_id: UUID
    event_type: str
    previous_streak: int
    new_streak: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class StreakEventListResponse(BaseModel):
    success: bool = True
    data: List[StreakEventResponseData]
    pagination: PaginationMetadata
    message: Optional[str] = "Streak history retrieved successfully"

class StreakStatsResponseData(BaseModel):
    active_streaks: int
    average_streak_length: float
    longest_streak: int
    freezes_used: int

class StreakStatsResponse(BaseModel):
    success: bool = True
    data: StreakStatsResponseData
    message: Optional[str] = "Streak stats retrieved successfully"

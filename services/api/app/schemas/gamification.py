from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SustainabilityScoreResponseData(BaseModel):
    overall_score: int
    consistency_score: int
    mission_score: int
    streak_score: int
    improvement_score: int
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class SustainabilityScoreResponse(BaseModel):
    success: bool = True
    data: SustainabilityScoreResponseData
    message: Optional[str] = "Sustainability score retrieved successfully"


class ScoreHistoryResponseData(BaseModel):
    score: int
    recorded_at: datetime

    model_config = {
        "from_attributes": True
    }

class ScoreHistoryResponse(BaseModel):
    success: bool = True
    data: List[ScoreHistoryResponseData]
    message: Optional[str] = "Score history retrieved successfully"


class AchievementResponseData(BaseModel):
    id: UUID
    title: str
    description: str
    badge_icon: str
    category: str
    points: int

    model_config = {
        "from_attributes": True
    }

class AchievementResponse(BaseModel):
    success: bool = True
    data: List[AchievementResponseData]
    message: Optional[str] = "Achievements retrieved successfully"


class UnlockedAchievementResponseData(BaseModel):
    id: UUID
    user_id: UUID
    achievement_id: UUID
    earned_at: datetime
    achievement: AchievementResponseData

    model_config = {
        "from_attributes": True
    }

class UnlockedAchievementResponse(BaseModel):
    success: bool = True
    data: List[UnlockedAchievementResponseData]
    message: Optional[str] = "Unlocked achievements retrieved successfully"


class AchievementProgressResponseData(BaseModel):
    id: UUID
    title: str
    description: str
    badge_icon: str
    category: str
    points: int
    earned: bool
    earned_at: Optional[datetime] = None
    current_progress: float
    target: float

    model_config = {
        "from_attributes": True
    }

class AchievementProgressResponse(BaseModel):
    success: bool = True
    data: List[AchievementProgressResponseData]
    message: Optional[str] = "Achievement progress retrieved successfully"

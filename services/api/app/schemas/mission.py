from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from app.schemas.activity import PaginationMetadata

class MissionTemplateResponseData(BaseModel):
    title: str
    category: str
    difficulty: str
    estimated_co2_saving: float
    estimated_time_minutes: int

    model_config = {
        "from_attributes": True
    }

class UserMissionResponseData(BaseModel):
    id: UUID
    user_id: UUID
    mission_template_id: UUID
    assigned_date: date
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    title: str
    category: str
    difficulty: str
    estimated_co2_saving: float
    estimated_time_minutes: int

    model_config = {
        "from_attributes": True
    }

class MissionResponse(BaseModel):
    success: bool = True
    data: UserMissionResponseData
    message: Optional[str] = "Mission processed successfully"

class MissionListResponse(BaseModel):
    success: bool = True
    data: List[UserMissionResponseData]
    pagination: PaginationMetadata
    message: Optional[str] = "Missions retrieved successfully"

class RecommendedMissionResponse(BaseModel):
    success: bool = True
    data: MissionTemplateResponseData
    message: Optional[str] = "Recommended mission retrieved successfully"

from pydantic import BaseModel, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

class UserResponseData(BaseModel):
    id: UUID
    auth_user_id: UUID
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserResponse(BaseModel):
    success: bool = True
    data: UserResponseData
    message: Optional[str] = "Operation successful"

class UpdateUserRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

class UserPreferencesResponseData(BaseModel):
    id: UUID
    user_id: UUID
    state_code: Optional[str] = None
    diet_type: Optional[Literal["vegetarian", "vegan", "non_vegetarian", "eggetarian"]] = None
    transport_preference: Optional[str] = None
    housing_type: Optional[Literal["apartment", "independent_house", "hostel", "pg"]] = None
    notification_enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserPreferencesResponse(BaseModel):
    success: bool = True
    data: UserPreferencesResponseData
    message: Optional[str] = "Operation successful"

class UpdatePreferencesRequest(BaseModel):
    state_code: Optional[str] = None
    diet_type: Optional[Literal["vegetarian", "vegan", "non_vegetarian", "eggetarian"]] = None
    transport_preference: Optional[str] = None
    housing_type: Optional[Literal["apartment", "independent_house", "hostel", "pg"]] = None
    notification_enabled: Optional[bool] = None

class OnboardingRequest(BaseModel):
    state_code: str = Field(..., min_length=1, max_length=50)
    diet_type: Literal["vegetarian", "vegan", "non_vegetarian", "eggetarian"]
    transport_preference: str = Field(..., min_length=1, max_length=50)
    housing_type: Literal["apartment", "independent_house", "hostel", "pg"]

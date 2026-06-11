from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Dict, Any, Literal
from decimal import Decimal
from uuid import UUID
from datetime import datetime

CategoryLiteral = Literal["transport", "food", "electricity", "shopping"]

class CreateActivityRequest(BaseModel):
    category: CategoryLiteral
    activity_type: str = Field(..., min_length=1, max_length=100)
    quantity: Decimal
    unit: str = Field(..., min_length=1, max_length=50)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: Decimal) -> Decimal:
        if v < 0:
            raise ValueError("Quantity cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_category_and_type(self) -> 'CreateActivityRequest':
        cat = self.category
        t = self.activity_type
        
        allowed_types = {
            "transport": ["car", "bus", "metro", "train", "bike", "walk", "flight"],
            "food": ["vegetarian_meal", "vegan_meal", "chicken_meal", "mutton_meal", "beef_meal", "dairy"],
            "electricity": ["electricity_usage"],
            "shopping": ["clothing", "electronics", "general_purchase"]
        }
        
        if t not in allowed_types[cat]:
            raise ValueError(f"Invalid activity_type '{t}' for category '{cat}'")
        
        return self

class ActivityResponseData(BaseModel):
    id: UUID
    user_id: UUID
    category: str
    activity_type: str
    quantity: Decimal
    unit: str
    metadata: Optional[Dict[str, Any]] = Field(None, validation_alias="metadata_json")
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class ActivityResponse(BaseModel):
    success: bool = True
    data: ActivityResponseData
    message: Optional[str] = "Activity processed successfully"

class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

class ActivityListResponse(BaseModel):
    success: bool = True
    data: list[ActivityResponseData]
    pagination: PaginationMetadata
    message: Optional[str] = "Activities retrieved successfully"

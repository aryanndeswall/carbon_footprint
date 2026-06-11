from pydantic import BaseModel
from typing import Optional

class FootprintData(BaseModel):
    transport: float
    food: float
    electricity: float
    shopping: float
    total: float
    
    # Also support _co2 suffix keys for compatibility with API_CONTRACTS.md
    transport_co2: float
    food_co2: float
    electricity_co2: float
    shopping_co2: float
    total_co2: float

    model_config = {
        "from_attributes": True,
        "populate_by_name": True
    }

class FootprintResponse(BaseModel):
    success: bool = True
    data: FootprintData
    message: Optional[str] = "Footprint data retrieved successfully"

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class SimulationCreate(BaseModel):
    scenario_name: str = Field(..., description="A friendly name for this simulation scenario")
    scenario_type: str = Field(..., description="Type of scenario: transport_change, diet_change, etc.")
    parameters: Dict[str, Any] = Field(..., description="Parameters specifying the simulated changes")


class SimulationResponseData(BaseModel):
    scenario_id: Optional[UUID] = None
    scenario_name: str
    scenario_type: str
    parameters: Dict[str, Any]
    current_footprint: float
    projected_footprint: float
    footprint_change: float
    current_score: int
    projected_score: int
    score_change: int
    confidence_score: float
    explanation: Optional[str] = None
    created_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }


class SimulationResponse(BaseModel):
    success: bool = True
    data: SimulationResponseData
    message: Optional[str] = "Simulation executed successfully"


class SimulationListResponse(BaseModel):
    success: bool = True
    data: List[SimulationResponseData]
    message: Optional[str] = "Simulations retrieved successfully"


class SimulationCompareRequestItem(BaseModel):
    scenario_id: Optional[UUID] = None
    scenario_name: Optional[str] = None
    scenario_type: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None


class SimulationCompareRequest(BaseModel):
    scenarios: List[SimulationCompareRequestItem] = Field(..., description="List of saved scenarios or ad-hoc scenarios to compare")


class SimulationCompareResponse(BaseModel):
    success: bool = True
    data: List[SimulationResponseData]
    message: Optional[str] = "Simulation comparison completed successfully"


class WhatIfCardRecommendation(BaseModel):
    scenario_name: str
    scenario_type: str
    parameters: Dict[str, Any]
    potential_savings_co2: float
    potential_score_impact: int


class DashboardWhatIfResponse(BaseModel):
    success: bool = True
    data: List[WhatIfCardRecommendation]
    message: Optional[str] = "Dashboard recommendations retrieved successfully"

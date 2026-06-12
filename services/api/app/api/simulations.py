from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.database.session import get_db
from app.models.user import User
from app.schemas.simulation import (
    SimulationCreate,
    SimulationResponse,
    SimulationListResponse,
    SimulationCompareRequest,
    SimulationCompareResponse,
    DashboardWhatIfResponse
)
from app.services.simulation import SimulationService, DecisionAssistantService

router = APIRouter(tags=["What-If Simulations"])

def _get_db_user(request: Request, db: Session) -> User:
    auth_user_id = UUID(request.state.user_id)
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user profile not found"
        )
    return user

@router.post("/simulations", response_model=SimulationResponse, status_code=status.HTTP_201_CREATED)
def create_simulation(
    payload: SimulationCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Creates a simulation scenario, calculates deterministic projections, 
    records it in user history, runs the AI Explanation Layer, and returns the result.
    """
    user = _get_db_user(request, db)
    service = SimulationService(db)
    try:
        data = service.create_scenario(
            user_id=user.id,
            scenario_name=payload.scenario_name,
            scenario_type=payload.scenario_type,
            parameters=payload.parameters
        )
        return {
            "success": True,
            "data": data,
            "message": "Simulation executed successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/simulations", response_model=SimulationListResponse)
def list_simulations(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Lists all saved simulation scenarios for the authenticated user.
    """
    user = _get_db_user(request, db)
    service = SimulationService(db)
    data = service.list_scenarios(user.id)
    return {
        "success": True,
        "data": data,
        "message": "Simulations retrieved successfully"
    }

@router.get("/simulations/history", response_model=SimulationListResponse)
def get_simulation_history(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieves the history of all simulations executed by the user.
    """
    user = _get_db_user(request, db)
    service = SimulationService(db)
    data = service.get_history(user.id)
    return {
        "success": True,
        "data": data,
        "message": "Simulation history retrieved successfully"
    }

@router.get("/simulations/recommendations", response_model=DashboardWhatIfResponse)
def get_dashboard_recommendations(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Generates tailored 'What If?' recommendations for the user dashboard.
    """
    user = _get_db_user(request, db)
    assistant = DecisionAssistantService(db)
    data = assistant.get_dashboard_recommendations(user.id)
    return {
        "success": True,
        "data": data,
        "message": "Dashboard recommendations retrieved successfully"
    }

@router.get("/simulations/{id}", response_model=SimulationResponse)
def get_simulation_details(
    id: UUID,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieves the details and results of a specific simulation by scenario ID.
    """
    user = _get_db_user(request, db)
    service = SimulationService(db)
    try:
        data = service.get_scenario_details(user_id=user.id, scenario_id=id)
        return {
            "success": True,
            "data": data,
            "message": "Simulation details retrieved successfully"
        }
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/simulations/compare", response_model=SimulationCompareResponse)
def compare_simulations(
    payload: SimulationCompareRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Accepts a list of saved simulation IDs or ad-hoc scenario parameters, 
    calculates their projections side-by-side, ranks them by carbon reduction, 
    and returns the compared result.
    """
    user = _get_db_user(request, db)
    assistant = DecisionAssistantService(db)
    
    scenarios_input = []
    for s in payload.scenarios:
        if s.scenario_id is not None:
            scenarios_input.append({"scenario_id": s.scenario_id})
        elif s.scenario_type is not None:
            scenarios_input.append({
                "scenario_type": s.scenario_type,
                "parameters": s.parameters or {},
                "scenario_name": s.scenario_name or f"Ad-hoc {s.scenario_type}"
            })
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Each comparison item must have either scenario_id or scenario_type"
            )

    try:
        data = assistant.compare_scenarios(user.id, scenarios_input)
        return {
            "success": True,
            "data": data,
            "message": "Simulation comparison completed successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

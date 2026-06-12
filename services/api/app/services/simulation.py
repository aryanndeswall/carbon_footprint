import logging
import uuid
from uuid import UUID
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date, func

from app.models.simulation import SimulationScenario, SimulationResult, SimulationHistory
from app.models.activity import ActivityEvent
from app.repositories.simulation import (
    SimulationScenarioRepository,
    SimulationResultRepository,
    SimulationHistoryRepository
)
from app.repositories.gamification import SustainabilityScoreRepository
from app.services.forecast import ForecastService
from app.services.ai.gemini_client import GeminiClient, GeminiAPIError
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIExplanationService:
    def __init__(self):
        self.gemini_client = GeminiClient()

    def generate_explanation(self, scenario_name: str, scenario_type: str, change_details: dict) -> str:
        """
        Generates a natural language explanation of simulation results using Gemini,
        or falls back to a template-based explanation if the Gemini key is missing or calls fail.
        """
        fallback_msg = self._generate_template_explanation(scenario_name, scenario_type, change_details)

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "gemini_key_placeholder":
            return fallback_msg

        try:
            prompt = (
                f"You are the Carbon Sense Sustainability Coach. Explain the simulated scenario below in a supportive, encouraging, natural language tone.\n"
                f"Scenario Name: {scenario_name}\n"
                f"Scenario Type: {scenario_type}\n"
                f"Current Footprint: {change_details.get('current_footprint')} kg CO2/month\n"
                f"Projected Footprint: {change_details.get('projected_footprint')} kg CO2/month\n"
                f"Footprint Change: {change_details.get('footprint_change')} kg CO2/month\n"
                f"Current Sustainability Score: {change_details.get('current_score')}\n"
                f"Projected Sustainability Score: {change_details.get('projected_score')}\n"
                f"Score Change: {change_details.get('score_change')}\n\n"
                f"Write a short, engaging one or two sentence summary explaining the benefits of this choice."
            )
            system_instruction = "You are a professional sustainability coach helping users understand the impact of lifestyle changes."
            
            response = self.gemini_client.generate_content(
                prompt=prompt,
                system_instruction=system_instruction
            )
            if response and response.strip():
                return response.strip()
            return fallback_msg
        except Exception as e:
            logger.warning(f"Failed to generate AI explanation using Gemini, falling back: {str(e)}")
            return fallback_msg

    def _generate_template_explanation(self, scenario_name: str, scenario_type: str, change_details: dict) -> str:
        savings = abs(change_details.get("footprint_change", 0.0))
        score_diff = change_details.get("score_change", 0)
        
        # Exact templates matching user spec
        if scenario_type == "transport_change":
            return f"Switching transportation habits could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        elif scenario_type == "diet_change":
            return f"Eating more vegetarian meals could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        elif scenario_type == "electricity_change":
            return f"Reducing your electricity usage could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        elif scenario_type == "shopping_change":
            return f"Reducing your shopping could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        elif scenario_type == "mixed_change":
            return f"Implementing mixed lifestyle changes could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        elif scenario_type == "goal_based":
            return f"Meeting your carbon reduction goal could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."
        else:
            return f"Implementing this change could reduce your monthly footprint by approximately {savings:.1f}kg CO₂ and improve your Sustainability Score by {score_diff} points."


class SimulationService:
    def __init__(self, db: Session):
        self.db = db
        self.scenario_repo = SimulationScenarioRepository(db)
        self.result_repo = SimulationResultRepository(db)
        self.history_repo = SimulationHistoryRepository(db)
        self.score_repo = SustainabilityScoreRepository(db)
        self.forecast_service = ForecastService(db)
        self.explanation_service = AIExplanationService()

    def validate_inputs(self, scenario_type: str, parameters: dict) -> None:
        """
        Validates scenario parameters based on type. Raises ValueError if invalid.
        """
        valid_types = {
            "transport_change", "diet_change", "electricity_change", 
            "shopping_change", "mixed_change", "goal_based"
        }
        if scenario_type not in valid_types:
            raise ValueError(f"Unsupported scenario type: {scenario_type}")

        if not isinstance(parameters, dict):
            raise ValueError("Parameters must be a JSON dictionary")

        if scenario_type == "transport_change":
            val = parameters.get("weekly_car_trips_to_metro")
            if val is None or not isinstance(val, int) or val < 0:
                raise ValueError("weekly_car_trips_to_metro is required and must be a non-negative integer")

        elif scenario_type == "diet_change":
            val = parameters.get("weekly_vegetarian_meals")
            if val is None or not isinstance(val, int) or val < 0:
                raise ValueError("weekly_vegetarian_meals is required and must be a non-negative integer")

        elif scenario_type == "electricity_change":
            val = parameters.get("electricity_reduction_pct")
            if val is None or not isinstance(val, (int, float)) or val < 0 or val > 100:
                raise ValueError("electricity_reduction_pct is required and must be a number between 0 and 100")

        elif scenario_type == "shopping_change":
            val = parameters.get("shopping_reduction_pct")
            if val is None or not isinstance(val, (int, float)) or val < 0 or val > 100:
                raise ValueError("shopping_reduction_pct is required and must be a number between 0 and 100")

        elif scenario_type == "goal_based":
            val = parameters.get("target_carbon_reduction_pct")
            if val is None or not isinstance(val, (int, float)) or val < 0 or val > 100:
                raise ValueError("target_carbon_reduction_pct is required and must be a number between 0 and 100")

        elif scenario_type == "mixed_change":
            keys = {"weekly_car_trips_to_metro", "weekly_vegetarian_meals", "electricity_reduction_pct", "shopping_reduction_pct"}
            if not keys.intersection(parameters.keys()):
                raise ValueError("mixed_change requires at least one parameter: weekly_car_trips_to_metro, weekly_vegetarian_meals, electricity_reduction_pct, or shopping_reduction_pct")
            
            for k, val in parameters.items():
                if k == "weekly_car_trips_to_metro" or k == "weekly_vegetarian_meals":
                    if not isinstance(val, int) or val < 0:
                        raise ValueError(f"{k} must be a non-negative integer")
                elif k == "electricity_reduction_pct" or k == "shopping_reduction_pct":
                    if not isinstance(val, (int, float)) or val < 0 or val > 100:
                        raise ValueError(f"{k} must be a number between 0 and 100")

    def run_projection(self, user_id: UUID, scenario_type: str, parameters: dict) -> dict:
        """
        Runs the deterministic calculation engine for a scenario.
        Returns metrics mapping current vs projected footprints and scores.
        """
        # 1. Baselines
        current_footprint = self.forecast_service.get_monthly_baseline_footprint(user_id)
        score_obj = self.score_repo.get_by_user_id(user_id)
        current_score = score_obj.overall_score if score_obj else 82

        # 2. Calculations
        savings = 0.0
        score_change = 0.0

        if scenario_type == "transport_change":
            n = parameters.get("weekly_car_trips_to_metro", 0)
            savings = n * 4.67
            score_change = n * 2.0

        elif scenario_type == "diet_change":
            n = parameters.get("weekly_vegetarian_meals", 0)
            savings = n * 3.0
            score_change = n * 1.5

        elif scenario_type == "electricity_change":
            p = parameters.get("electricity_reduction_pct", 0)
            savings = (p / 100.0) * 40.0
            score_change = p / 2.5

        elif scenario_type == "shopping_change":
            p = parameters.get("shopping_reduction_pct", 0)
            savings = (p / 100.0) * 20.0
            score_change = p / 5.0

        elif scenario_type == "mixed_change":
            if "weekly_car_trips_to_metro" in parameters:
                savings += parameters["weekly_car_trips_to_metro"] * 4.67
                score_change += parameters["weekly_car_trips_to_metro"] * 2.0
            if "weekly_vegetarian_meals" in parameters:
                savings += parameters["weekly_vegetarian_meals"] * 3.0
                score_change += parameters["weekly_vegetarian_meals"] * 1.5
            if "electricity_reduction_pct" in parameters:
                savings += (parameters["electricity_reduction_pct"] / 100.0) * 40.0
                score_change += parameters["electricity_reduction_pct"] / 2.5
            if "shopping_reduction_pct" in parameters:
                savings += (parameters["shopping_reduction_pct"] / 100.0) * 20.0
                score_change += parameters["shopping_reduction_pct"] / 5.0

        elif scenario_type == "goal_based":
            p = parameters.get("target_carbon_reduction_pct", 0)
            savings = (p / 100.0) * current_footprint
            score_change = p * 0.5

        # 3. Projected metrics (bounded)
        projected_footprint = max(current_footprint - savings, 0.0)
        projected_score = min(max(current_score + int(round(score_change)), 0), 100)

        # 4. Confidence Score based on 30d history
        today = datetime.now(timezone.utc).date()
        start_30d = today - timedelta(days=29)
        distinct_days = (
            self.db.query(func.count(func.distinct(cast(ActivityEvent.created_at, Date))))
            .filter(
                ActivityEvent.user_id == user_id,
                cast(ActivityEvent.created_at, Date) >= start_30d,
                cast(ActivityEvent.created_at, Date) <= today
            )
            .scalar()
        ) or 0

        if distinct_days >= 15:
            confidence_score = 0.95
        elif distinct_days > 0:
            confidence_score = 0.85
        else:
            confidence_score = 0.70

        return {
            "current_footprint": round(current_footprint, 2),
            "projected_footprint": round(projected_footprint, 2),
            "footprint_change": round(-savings, 2),
            "current_score": current_score,
            "projected_score": projected_score,
            "score_change": projected_score - current_score,
            "confidence_score": confidence_score
        }

    def create_scenario(
        self,
        user_id: UUID,
        scenario_name: str,
        scenario_type: str,
        parameters: dict
    ) -> dict:
        """
        Creates a scenario, calculates projections, writes history, triggers AI explanation, and saves to database.
        """
        # Validate scenario_name
        if not scenario_name or not isinstance(scenario_name, str) or not scenario_name.strip():
            raise ValueError("scenario_name must be a non-empty string")

        # Validate inputs
        self.validate_inputs(scenario_type, parameters)

        # Run calculations
        projection = self.run_projection(user_id, scenario_type, parameters)

        # Save Scenario
        scenario = SimulationScenario(
            user_id=user_id,
            scenario_name=scenario_name.strip(),
            scenario_type=scenario_type,
            parameters=parameters
        )
        self.scenario_repo.create(scenario)

        # Save Result
        result = SimulationResult(
            scenario_id=scenario.id,
            predicted_footprint=projection["projected_footprint"],
            predicted_score=float(projection["projected_score"]),
            confidence_score=projection["confidence_score"]
        )
        self.result_repo.create(result)

        # Save History
        history = SimulationHistory(
            user_id=user_id,
            scenario_id=scenario.id
        )
        self.history_repo.create(history)

        # Log analytics for tracking created, type, and adoption rate
        logger.info(f"ANALYTICS: Simulation Created: user_id={user_id}, scenario_id={scenario.id}, type={scenario_type}")
        logger.info(f"ANALYTICS: Scenario Adopted: user_id={user_id}, type={scenario_type}")

        # AI Explanation
        explanation = self.explanation_service.generate_explanation(
            scenario_name=scenario.scenario_name,
            scenario_type=scenario_type,
            change_details=projection
        )

        return {
            "scenario_id": scenario.id,
            "scenario_name": scenario.scenario_name,
            "scenario_type": scenario.scenario_type,
            "parameters": scenario.parameters,
            "current_footprint": projection["current_footprint"],
            "projected_footprint": projection["projected_footprint"],
            "footprint_change": projection["footprint_change"],
            "current_score": projection["current_score"],
            "projected_score": projection["projected_score"],
            "score_change": projection["score_change"],
            "confidence_score": projection["confidence_score"],
            "explanation": explanation,
            "created_at": scenario.created_at
        }

    def get_scenario_details(self, user_id: UUID, scenario_id: UUID) -> dict:
        """
        Fetches scenario and result details if owned by user.
        """
        scenario = self.scenario_repo.get_by_id(scenario_id)
        if not scenario:
            raise ValueError("Scenario not found")
        if scenario.user_id != user_id:
            raise PermissionError("Access denied to this scenario")

        result = self.result_repo.get_by_scenario_id(scenario_id)
        if not result:
            raise ValueError("Simulation result not found")

        # Reconstruct baseline details
        current_footprint = self.forecast_service.get_monthly_baseline_footprint(user_id)
        score_obj = self.score_repo.get_by_user_id(user_id)
        current_score = score_obj.overall_score if score_obj else 82

        projection = {
            "current_footprint": round(current_footprint, 2),
            "projected_footprint": result.predicted_footprint,
            "footprint_change": round(result.predicted_footprint - current_footprint, 2),
            "current_score": current_score,
            "projected_score": int(result.predicted_score),
            "score_change": int(result.predicted_score) - current_score,
            "confidence_score": result.confidence_score
        }

        explanation = self.explanation_service.generate_explanation(
            scenario_name=scenario.scenario_name,
            scenario_type=scenario.scenario_type,
            change_details=projection
        )

        return {
            "scenario_id": scenario.id,
            "scenario_name": scenario.scenario_name,
            "scenario_type": scenario.scenario_type,
            "parameters": scenario.parameters,
            "current_footprint": projection["current_footprint"],
            "projected_footprint": projection["projected_footprint"],
            "footprint_change": projection["footprint_change"],
            "current_score": projection["current_score"],
            "projected_score": projection["projected_score"],
            "score_change": projection["score_change"],
            "confidence_score": projection["confidence_score"],
            "explanation": explanation,
            "created_at": scenario.created_at
        }

    def list_scenarios(self, user_id: UUID) -> List[dict]:
        """
        List scenarios saved by user.
        """
        scenarios = self.scenario_repo.list_by_user(user_id)
        results = []
        for scenario in scenarios:
            try:
                res = self.get_scenario_details(user_id, scenario.id)
                results.append(res)
            except Exception:
                continue
        return results

    def get_history(self, user_id: UUID, limit: int = 30) -> List[dict]:
        """
        Gets history logs of executed simulations.
        """
        history_logs = self.history_repo.list_by_user(user_id, limit)
        results = []
        for log in history_logs:
            try:
                details = self.get_scenario_details(user_id, log.scenario_id)
                details["executed_at"] = log.executed_at
                results.append(details)
            except Exception:
                continue
        return results


class DecisionAssistantService:
    def __init__(self, db: Session):
        self.db = db
        self.simulation_service = SimulationService(db)

    def compare_scenarios(self, user_id: UUID, scenarios_input: List[dict]) -> List[dict]:
        """
        Compares multiple scenarios side-by-side. 
        scenarios_input can contain either existing scenario UUIDs: {"scenario_id": "..."}
        or ad-hoc scenario parameters: {"scenario_type": "...", "parameters": {...}, "scenario_name": "..."}
        """
        results = []
        for item in scenarios_input:
            if "scenario_id" in item:
                # Existing saved scenario
                try:
                    s_id = uuid.UUID(str(item["scenario_id"])) if not isinstance(item["scenario_id"], uuid.UUID) else item["scenario_id"]
                    details = self.simulation_service.get_scenario_details(user_id, s_id)
                    results.append(details)
                except Exception as e:
                    logger.warning(f"Error fetching saved scenario in comparison: {str(e)}")
                    continue
            else:
                # Ad-hoc scenario
                stype = item.get("scenario_type")
                params = item.get("parameters", {})
                sname = item.get("scenario_name", f"Ad-hoc {stype}")
                
                try:
                    self.simulation_service.validate_inputs(stype, params)
                    proj = self.simulation_service.run_projection(user_id, stype, params)
                    explanation = self.simulation_service.explanation_service.generate_explanation(
                        scenario_name=sname,
                        scenario_type=stype,
                        change_details=proj
                    )
                    results.append({
                        "scenario_id": None,
                        "scenario_name": sname,
                        "scenario_type": stype,
                        "parameters": params,
                        "current_footprint": proj["current_footprint"],
                        "projected_footprint": proj["projected_footprint"],
                        "footprint_change": proj["footprint_change"],
                        "current_score": proj["current_score"],
                        "projected_score": proj["projected_score"],
                        "score_change": proj["score_change"],
                        "confidence_score": proj["confidence_score"],
                        "explanation": explanation
                    })
                except Exception as e:
                    logger.warning(f"Error executing ad-hoc scenario in comparison: {str(e)}")
                    continue

        # Rank: sort by footprint_change ascending (i.e. highest carbon reduction first)
        results.sort(key=lambda x: x["footprint_change"])

        # Log analytics for simulation comparisons
        logger.info(f"ANALYTICS: Simulation Comparison: user_id={user_id}, count={len(scenarios_input)}")
        return results

    def get_dashboard_recommendations(self, user_id: UUID) -> List[dict]:
        """
        Generate default "What If?" card recommendations customized for the user.
        """
        # Predefined options
        recommendations = [
            {
                "scenario_name": "Replace 3 car trips with metro",
                "scenario_type": "transport_change",
                "parameters": {"weekly_car_trips_to_metro": 3}
            },
            {
                "scenario_name": "Eat 2 vegetarian meals per week",
                "scenario_type": "diet_change",
                "parameters": {"weekly_vegetarian_meals": 2}
            },
            {
                "scenario_name": "Reduce electricity usage by 15%",
                "scenario_type": "electricity_change",
                "parameters": {"electricity_reduction_pct": 15.0}
            },
            {
                "scenario_name": "Reduce shopping footprint by 15%",
                "scenario_type": "shopping_change",
                "parameters": {"shopping_reduction_pct": 15.0}
            }
        ]

        results = []
        for rec in recommendations:
            try:
                proj = self.simulation_service.run_projection(user_id, rec["scenario_type"], rec["parameters"])
                results.append({
                    "scenario_name": rec["scenario_name"],
                    "scenario_type": rec["scenario_type"],
                    "parameters": rec["parameters"],
                    "potential_savings_co2": abs(proj["footprint_change"]),
                    "potential_score_impact": proj["score_change"]
                })
            except Exception:
                continue

        # Rank by potential carbon savings descending
        results.sort(key=lambda x: x["potential_savings_co2"], reverse=True)

        # Log analytics for recommended actions viewed
        logger.info(f"ANALYTICS: Recommended Actions Viewed: user_id={user_id}")
        return results

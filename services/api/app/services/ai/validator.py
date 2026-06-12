import re
import json
from typing import Dict, Any, List
from pydantic import BaseModel, Field, ValidationError
from typing import Literal

# Daily Coach Pydantic Schema
class DailyCoachSchema(BaseModel):
    headline: str = Field(..., min_length=1)
    body: str = Field(..., min_length=1)
    actionable_tip: str = Field(..., min_length=1)
    focus_category: Literal["transport", "food", "electricity", "shopping"]

# Weekly Summary Pydantic Schema
class WeeklySummarySchema(BaseModel):
    summary_text: str = Field(..., min_length=1)
    total_saved_co2: float = Field(...)
    highlights: List[str] = Field(...)
    next_week_goals: List[str] = Field(...)

class AIValidationError(Exception):
    """Custom exception raised when AI response validation fails."""
    pass

class OutputValidator:
    """
    Validates Gemini JSON outputs against strict schema, length, and safety guidelines.
    """
    HEALTH_KEYWORDS = [
        "doctor", "medical", "health advice", "diagnose", "medication", 
        "treatment", "prescription", "clinical", "disease", "therapy"
    ]
    
    FINANCIAL_KEYWORDS = [
        "invest", "portfolio", "stock", "share", "crypto", "mutual fund", 
        "financial advice", "broker", "equity", "dividend", "yield"
    ]

    @staticmethod
    def count_words(text: str) -> int:
        """Helper to count words in a string."""
        return len(re.findall(r'\b\w+\b', text))

    @classmethod
    def validate_daily_coach(cls, raw_json: str, context: Dict[str, Any]) -> DailyCoachSchema:
        """
        Validate and parse a daily coaching message.
        """
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            raise AIValidationError(f"Invalid JSON format: {str(e)}")

        try:
            schema = DailyCoachSchema(**data)
        except ValidationError as e:
            raise AIValidationError(f"Schema validation failed: {str(e)}")

        # 1. Word Count Check (Under 150 words total across all text fields)
        total_text = f"{schema.headline} {schema.body} {schema.actionable_tip}"
        word_count = cls.count_words(total_text)
        if word_count >= 150:
            raise AIValidationError(f"Response exceeds word limit: {word_count} words (limit: 150)")

        # 2. Safety / Advice Checks
        cls._run_safety_checks(total_text)

        # 3. Hallucination / Statistic Checks
        cls._run_statistic_checks(total_text, context)

        return schema

    @classmethod
    def validate_weekly_summary(cls, raw_json: str, context: Dict[str, Any]) -> WeeklySummarySchema:
        """
        Validate and parse a weekly summary.
        """
        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            raise AIValidationError(f"Invalid JSON format: {str(e)}")

        try:
            schema = WeeklySummarySchema(**data)
        except ValidationError as e:
            raise AIValidationError(f"Schema validation failed: {str(e)}")

        # 1. Word Count Check
        highlights_text = " ".join(schema.highlights)
        goals_text = " ".join(schema.next_week_goals)
        total_text = f"{schema.summary_text} {highlights_text} {goals_text}"
        word_count = cls.count_words(total_text)
        if word_count >= 150:
            raise AIValidationError(f"Response exceeds word limit: {word_count} words (limit: 150)")

        # 2. Safety / Advice Checks
        cls._run_safety_checks(total_text)

        # 3. Hallucination / Statistic Checks
        # Add total_saved_co2 to the text to verify it's not fabricated
        total_text_with_stats = f"{total_text} {schema.total_saved_co2}"
        cls._run_statistic_checks(total_text_with_stats, context)

        return schema

    @classmethod
    def _run_safety_checks(cls, text: str) -> None:
        """Check for forbidden advice keywords."""
        lower_text = text.lower()
        for word in cls.HEALTH_KEYWORDS:
            if word in lower_text:
                raise AIValidationError(f"Safety violation: Response contains health-related term '{word}'")
        
        for word in cls.FINANCIAL_KEYWORDS:
            if word in lower_text:
                raise AIValidationError(f"Safety violation: Response contains financial-related term '{word}'")

    @classmethod
    def _run_statistic_checks(cls, text: str, context: Dict[str, Any]) -> None:
        """
        Verify that generated statistics/percentages/numbers match context.
        Permits common units and counting numbers (0, 1, 2, 3).
        """
        # Extract all numbers, including percentages and decimals
        found_numbers = re.findall(r'\b\d+(?:\.\d+)?%?', text)
        
        # Flatten context values to string list to check membership
        context_str = json.dumps(context)
        
        for num in found_numbers:
            # Skip common small counting numbers/defaults
            clean_num = num.replace("%", "")
            if clean_num in ["0", "1", "2", "3", "7", "30"]:
                continue
            
            # If the number or percentage is not mentioned in context, it's hallucinated
            if num not in context_str and clean_num not in context_str:
                raise AIValidationError(f"Hallucination detected: Number or percentage '{num}' is not in context.")

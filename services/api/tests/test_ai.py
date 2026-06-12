import pytest
import uuid
import json
import httpx
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

from app.services.ai.gemini_client import GeminiClient, GeminiAPIError
from app.services.ai.prompts import PromptBuilder
from app.services.ai.validator import OutputValidator, AIValidationError
from app.services.ai.service import AIInsightService
from app.models.ai import AIInsight, AIGenerationLog

# ==========================================
# 1. UNIT TESTS: Prompt Builder
# ==========================================

def test_prompt_builder_contains_all_metrics():
    """Verify that PromptBuilder prompts contain required information and omit sensitive data."""
    context = {
        "user_profile": {
            "diet_type": "vegan",
            "transport_preference": "train",
            "state_code": "MH"
        },
        "weekly_footprint_totals": {
            "transport": 10.0,
            "food": 5.0,
            "electricity": 2.0,
            "shopping": 1.0,
            "total": 18.0
        },
        "highest_emission_category": "transport",
        "current_streak": 5,
        "longest_streak": 10,
        "mission_completion_rate": "80%",
        "recent_trend_information": "Your carbon footprint decreased by 10% compared to last week."
    }

    daily_prompt = PromptBuilder.get_daily_coach_user_prompt(context)
    weekly_prompt = PromptBuilder.get_weekly_summary_user_prompt(context)

    # Required fields checks
    for prompt in [daily_prompt, weekly_prompt]:
        assert "vegan" in prompt
        assert "train" in prompt
        assert "18.0" in prompt
        assert "transport" in prompt
        assert "5" in prompt
        assert "80%" in prompt
        assert "decreased by 10%" in prompt

        # Security/leak checks
        assert "jwt" not in prompt.lower()
        assert "token" not in prompt.lower()
        assert "secret" not in prompt.lower()
        assert "user_id" not in prompt.lower()


# ==========================================
# 2. UNIT TESTS: Output Validator
# ==========================================

def test_output_validator_daily_coach_valid():
    """Test validator with valid JSON daily coach input."""
    raw_json = json.dumps({
        "headline": "Clean Traveling!",
        "body": "Your transport footprint is down this week. Keep taking the train.",
        "actionable_tip": "Walk to nearby shops.",
        "focus_category": "transport"
    })
    context = {"weekly_footprint_totals": {"total": 10.0}} # Simple context
    schema = OutputValidator.validate_daily_coach(raw_json, context)
    assert schema.headline == "Clean Traveling!"
    assert schema.focus_category == "transport"

def test_output_validator_daily_coach_invalid_schema():
    """Test validator raises error on missing or invalid fields."""
    raw_json = json.dumps({
        "headline": "Missing fields",
        "focus_category": "invalid_category" # Invalid category enum
    })
    with pytest.raises(AIValidationError) as excinfo:
        OutputValidator.validate_daily_coach(raw_json, {})
    assert "Schema validation failed" in str(excinfo.value)

def test_output_validator_daily_coach_word_count_exceeded():
    """Test validator rejects responses exceeding 150 words."""
    long_body = "word " * 155
    raw_json = json.dumps({
        "headline": "Long headline",
        "body": long_body,
        "actionable_tip": "Just do it.",
        "focus_category": "transport"
    })
    with pytest.raises(AIValidationError) as excinfo:
        OutputValidator.validate_daily_coach(raw_json, {})
    assert "Response exceeds word limit" in str(excinfo.value)

def test_output_validator_safety_checks():
    """Test validator rejects responses containing health or financial advice."""
    raw_json_health = json.dumps({
        "headline": "Daily Advice",
        "body": "You should check with a doctor or clinical provider regarding this.",
        "actionable_tip": "Prescription remedies.",
        "focus_category": "food"
    })
    with pytest.raises(AIValidationError) as excinfo:
        OutputValidator.validate_daily_coach(raw_json_health, {})
    assert "Safety violation" in str(excinfo.value)
    assert "doctor" in str(excinfo.value)

    raw_json_finance = json.dumps({
        "headline": "Smart Finance",
        "body": "We suggest that you invest in clean energy stocks and crypto.",
        "actionable_tip": "Invest today.",
        "focus_category": "shopping"
    })
    with pytest.raises(AIValidationError) as excinfo:
        OutputValidator.validate_daily_coach(raw_json_finance, {})
    assert "Safety violation" in str(excinfo.value)
    assert "invest" in str(excinfo.value)

def test_output_validator_hallucination_check():
    """Test validator rejects fabricated percentages/numbers not in context."""
    raw_json = json.dumps({
        "headline": "Footprint reduction",
        "body": "You reduced transport footprint by 95.7%!", # 95.7% is not in context
        "actionable_tip": "Keep going.",
        "focus_category": "transport"
    })
    context = {
        "weekly_footprint_totals": {"total": 10.0},
        "recent_trend_information": "decreased by 12%"
    }
    with pytest.raises(AIValidationError) as excinfo:
        OutputValidator.validate_daily_coach(raw_json, context)
    assert "Hallucination detected" in str(excinfo.value)
    assert "95.7%" in str(excinfo.value)


# ==========================================
# 3. UNIT TESTS: Gemini Client
# ==========================================

@patch("httpx.Client.post")
def test_gemini_client_success(mock_post):
    """Test Gemini client handles successful API call."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "mocked gemini response text"}
                    ]
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    client = GeminiClient(api_key="mock-key")
    res = client.generate_content("hello")
    assert res == "mocked gemini response text"

@patch("httpx.Client.post")
def test_gemini_client_rate_limiting_and_retry(mock_post):
    """Test Gemini client retries on 429 rate limit."""
    mock_429 = MagicMock()
    mock_429.status_code = 429

    mock_success = MagicMock()
    mock_success.status_code = 200
    mock_success.json.return_value = {
        "candidates": [{"content": {"parts": [{"text": "success after retry"}]}}]
    }

    # Simulate 1 rate limit followed by success
    mock_post.side_effect = [mock_429, mock_success]

    client = GeminiClient(api_key="mock-key")
    # Set backoff factor to 0.01 for fast tests
    res = client.generate_content("hello", backoff_factor=0.01)
    assert res == "success after retry"
    assert mock_post.call_count == 2


# ==========================================
# 4. INTEGRATION TESTS: Endpoints & Flow
# ==========================================

@patch("app.services.ai.service.GeminiClient.generate_content")
def test_generate_daily_coach_endpoint_success(mock_generate, client: TestClient, create_jwt):
    """Test successful generation and retrieval endpoints for daily coach."""
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="alice.ai@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Populate profile (triggers get_or_create)
    client.get("/api/v1/users/me", headers=headers)

    mock_generate.return_value = json.dumps({
        "headline": "Great Job!",
        "body": "You saved carbon on transit. Your trend is decreasing.",
        "actionable_tip": "Keep taking the bus.",
        "focus_category": "transport"
    })

    # Trigger generation
    response = client.post("/api/v1/ai/insights/generate", json={"insight_type": "daily_coach"}, headers=headers)
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["title"] == "Great Job!"
    assert "Tip: Keep taking the bus." in res_data["content"]
    assert res_data["insight_type"] == "daily_coach"

    # Query latest endpoint
    response_latest = client.get("/api/v1/ai/insights/latest?type=daily_coaching", headers=headers)
    assert response_latest.status_code == 200
    assert response_latest.json()["data"]["title"] == "Great Job!"

    # Query history
    response_history = client.get("/api/v1/ai/insights/history", headers=headers)
    assert response_history.status_code == 200
    assert len(response_history.json()["data"]) == 1
    assert response_history.json()["pagination"]["total_items"] == 1

@patch("app.services.ai.service.GeminiClient.generate_content")
def test_generate_weekly_summary_endpoint_success(mock_generate, client: TestClient, create_jwt):
    """Test weekly summary generation and endpoint."""
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="bob.ai@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.get("/api/v1/users/me", headers=headers)

    mock_generate.return_value = json.dumps({
        "summary_text": "Good work this week. Total emissions are down.",
        "total_saved_co2": 0.0,
        "highlights": ["Completed 2 missions", "Decreased transport footprint"],
        "next_week_goals": ["Reduce food carbon", "Try a vegan meal"]
    })

    response = client.get("/api/v1/ai/weekly-summary", headers=headers)
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["title"] == "Weekly Progress"
    assert "**Total Saved CO2:** 0.0 kg" in res_data["content"]
    assert "goals" in res_data["content"].lower()

@patch("app.services.ai.service.GeminiClient.generate_content")
def test_ai_generation_fallback_on_api_failure(mock_generate, client: TestClient, create_jwt, db):
    """Verify that service falls back to static template when Gemini fails/times out and cache is empty."""
    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="carol.ai@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    client.get("/api/v1/users/me", headers=headers)

    # Force GeminiClient to throw exception (timeout/API failure)
    mock_generate.side_effect = GeminiAPIError("Connection Timeout")

    # Generate daily coach endpoint should fallback to static template and succeed
    response = client.post("/api/v1/ai/insights/generate", json={"insight_type": "daily_coach"}, headers=headers)
    assert response.status_code == 200
    res_data = response.json()["data"]
    assert res_data["title"] == "Keep Up the Clean Travel!"
    assert "metro transit" in res_data["content"]

    # Check that fallback is recorded as "failed" in logs
    log = db.query(AIGenerationLog).filter(AIGenerationLog.status == "failed").first()
    assert log is not None
    assert log.prompt_type == "daily_coach"

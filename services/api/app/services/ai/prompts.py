import json
from typing import Dict, Any

class PromptBuilder:
    """
    Constructs deterministic prompts for Gemini, safely injecting user context.
    Strictly avoids exposing internal database IDs, JWTs, or secrets.
    """
    
    @staticmethod
    def get_daily_coach_system_instruction() -> str:
        return (
            "You are Carbon Sense Coach, a highly professional environmental advisor.\n"
            "Your goal is to provide encouraging, context-aware carbon footprint insights and one actionable daily tip.\n"
            "Use the retrieved behavioral memories context to reference past achievements, habits, or struggles to make the coaching highly personalized.\n"
            "You MUST return your output in JSON matching the specified schema.\n"
            "CRITICAL RULES:\n"
            "- Do NOT calculate carbon values. Use only the provided totals.\n"
            "- Do NOT make scientific assertions unsupported by the user data.\n"
            "- Keep recommendations specific and realistic.\n"
            "- Response MUST be under 150 words.\n"
            "- Do NOT provide medical, health, or financial advice.\n"
        )

    @staticmethod
    def get_daily_coach_user_prompt(context: Dict[str, Any]) -> str:
        context_str = json.dumps(context, indent=2)
        return (
            f"Here is the structured context about the user's carbon footprint, streaks, and preferences, including retrieved behavioral memories:\n\n"
            f"{context_str}\n\n"
            f"Please generate a personalized daily coaching message in JSON format. The response must follow this schema:\n"
            f"{{\n"
            f"  \"headline\": \"A short motivational title (e.g. Keep Up the Clean Travel!)\",\n"
            f"  \"body\": \"A concise encouraging coaching feedback focusing on their progress or current status, incorporating historical context if relevant. Under 100 words.\",\n"
            f"  \"actionable_tip\": \"One specific actionable tip to reduce their footprint further today, matching their preferences.\",\n"
            f"  \"focus_category\": \"The emission category to focus on (must be one of: transport, food, electricity, shopping)\"\n"
            f"}}\n"
        )

    @staticmethod
    def get_weekly_summary_system_instruction() -> str:
        return (
            "You are Carbon Sense Auditor.\n"
            "Summarize the user's weekly footprint and contrast it with previous aggregates.\n"
            "Acknowledge streak completions and completed missions, using the retrieved behavioral memory patterns to add deep personalization.\n"
            "You MUST return your output in JSON matching the specified schema.\n"
            "CRITICAL RULES:\n"
            "- Never fabricate numbers. Contrast raw data values directly.\n"
            "- Focus on highlighting carbon savings and progress.\n"
            "- Response MUST be under 150 words.\n"
            "- Do NOT provide medical, health, or financial advice.\n"
        )

    @staticmethod
    def get_weekly_summary_user_prompt(context: Dict[str, Any]) -> str:
        context_str = json.dumps(context, indent=2)
        return (
            f"Here is the structured context about the user's weekly footprint history, streaks, and missions:\n\n"
            f"{context_str}\n\n"
            f"Please generate a weekly summary in JSON format. The response must follow this schema:\n"
            f"{{\n"
            f"  \"summary_text\": \"A concise paragraph summarizing the week's footprint trends, savings, and habit streaks. Under 100 words.\",\n"
            f"  \"total_saved_co2\": 0.0, // numeric estimate of CO2 saved compared to baseline/previous week\n"
            f"  \"highlights\": [\n"
            f"    \"Bullet point highlight 1 (e.g., Completed all transport missions this week)\",\n"
            f"    \"Bullet point highlight 2\"\n"
            f"  ],\n"
            f"  \"next_week_goals\": [\n"
            f"    \"Target goal 1 for next week\",\n"
            f"    \"Target goal 2 for next week\"\n"
            f"  ]\n"
            f"}}\n"
        )

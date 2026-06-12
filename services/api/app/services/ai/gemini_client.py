import time
import httpx
import logging
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiAPIError(Exception):
    """Base exception for Gemini API errors."""
    pass

class GeminiClient:
    """
    A low-level HTTP wrapper for the Gemini 2.5 Flash API.
    Handles communication, retry logic, timeouts, and JSON output formatting.
    """
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://generativelanguage.googleapis.com"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.base_url = base_url
        self.model = "gemini-2.5-flash"  # Default model specified in Sprint 6 design
        self.client = httpx.Client(timeout=15.0)

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_schema: Optional[Dict[str, Any]] = None,
        max_retries: int = 3,
        backoff_factor: float = 2.0
    ) -> str:
        """
        Send a generateContent request to Gemini API.
        
        Args:
            prompt: User prompt content.
            system_instruction: Optional system instruction/context.
            response_schema: Optional JSON schema to enforce on the output.
            max_retries: Number of retries on transient errors.
            backoff_factor: Multiplier for exponential backoff sleep.
            
        Returns:
            The raw text content (expected to be JSON if response_schema is provided).
        """
        if not self.api_key or self.api_key == "gemini_key_placeholder":
            raise GeminiAPIError("Gemini API key is not configured.")

        url = f"{self.base_url}/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        # Construct request body
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [
                    {"text": system_instruction}
                ]
            }

        generation_config = {}
        if response_schema:
            generation_config["responseMimeType"] = "application/json"
            generation_config["responseSchema"] = response_schema

        if generation_config:
            payload["generationConfig"] = generation_config

        headers = {"Content-Type": "application/json"}
        
        last_exception = None
        for attempt in range(max_retries):
            try:
                response = self.client.post(url, json=payload, headers=headers)
                
                # Check for rate limiting
                if response.status_code == 429:
                    logger.warning(f"Gemini API rate limited (429) on attempt {attempt + 1}. Retrying...")
                    time.sleep(backoff_factor ** attempt)
                    continue

                response.raise_for_status()
                response_json = response.json()
                
                # Parse candidate content
                candidates = response_json.get("candidates", [])
                if not candidates:
                    raise GeminiAPIError("No generation candidates returned from Gemini API.")
                
                parts = candidates[0].get("content", {}).get("parts", [])
                if not parts or "text" not in parts[0]:
                    raise GeminiAPIError("Invalid candidate content format from Gemini API.")
                
                return parts[0]["text"]

            except (httpx.HTTPError, httpx.TimeoutException) as e:
                logger.error(f"HTTP connection error to Gemini API on attempt {attempt + 1}: {str(e)}")
                last_exception = e
                time.sleep(backoff_factor ** attempt)

        raise GeminiAPIError(f"Gemini API request failed after {max_retries} attempts. Last error: {str(last_exception)}")

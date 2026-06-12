import httpx
import logging
from typing import List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmbeddingAPIError(Exception):
    """Exception raised for errors in the Embedding API."""
    pass

class EmbeddingService:
    """
    Service for generating vector embeddings using Gemini's text-embedding-004.
    Ensures the output vector size is exactly 1536 by padding with zeros.
    """
    def __init__(self, api_key: Optional[str] = None, base_url: str = "https://generativelanguage.googleapis.com"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.base_url = base_url
        self.model = "text-embedding-004"
        self.target_dimension = 1536
        self.client = httpx.Client(timeout=10.0)

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for the input text and pad/truncate to 1536 dimensions.
        """
        if not self.api_key or self.api_key == "gemini_key_placeholder":
            raise EmbeddingAPIError("Gemini API key is not configured.")

        url = f"{self.base_url}/v1beta/models/{self.model}:embedContent?key={self.api_key}"
        payload = {
            "content": {
                "parts": [
                    {"text": text}
                ]
            }
        }
        headers = {"Content-Type": "application/json"}

        try:
            response = self.client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            response_json = response.json()
            
            embedding_data = response_json.get("embedding", {})
            values = embedding_data.get("values", [])
            
            if not values:
                raise EmbeddingAPIError("Empty embedding values returned from API.")

            # Pad or truncate to target dimension (1536)
            current_dim = len(values)
            if current_dim < self.target_dimension:
                values = values + [0.0] * (self.target_dimension - current_dim)
            elif current_dim > self.target_dimension:
                values = values[:self.target_dimension]

            return values

        except Exception as e:
            logger.error(f"Failed to generate embedding from Gemini: {str(e)}")
            raise EmbeddingAPIError(f"Embedding generation failed: {str(e)}")

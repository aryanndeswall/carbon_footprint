import sys
import os

# Ensure the app folder is in sys.path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../api")))

from app.services.ai.gemini_client import GeminiClient, GeminiAPIError

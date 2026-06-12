import pytest
import uuid
import json
import httpx
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

from app.services.ai.embedding import EmbeddingService, EmbeddingAPIError
from app.services.ai.memory import MemoryService
from app.services.ai.memory_retrieval import MemoryRetrievalService
from app.services.ai.context_assembly import ContextAssemblyService
from app.models.ai_memory import UserMemory, MemoryRetrievalLog

# ==========================================
# 1. UNIT TESTS: Embedding Service
# ==========================================

@patch("httpx.Client.post")
def test_embedding_service_padding(mock_post):
    """Verify that EmbeddingService pads vectors to exactly 1536 dimensions."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    # Gemini outputs 768 size vectors by default
    mock_response.json.return_value = {
        "embedding": {
            "values": [0.1] * 768
        }
    }
    mock_post.return_value = mock_response

    service = EmbeddingService(api_key="mock-key")
    embedding = service.get_embedding("test text")
    
    assert len(embedding) == 1536
    # First 768 elements should be 0.1, the rest should be 0.0 (padded)
    assert embedding[0] == 0.1
    assert embedding[767] == 0.1
    assert embedding[768] == 0.0
    assert embedding[1535] == 0.0

@patch("httpx.Client.post")
def test_embedding_service_error_handling(mock_post):
    """Verify EmbeddingService properly catches HTTP errors."""
    mock_post.side_effect = httpx.ConnectError("Network is down")
    service = EmbeddingService(api_key="mock-key")
    with pytest.raises(EmbeddingAPIError) as excinfo:
        service.get_embedding("error text")
    assert "Embedding generation failed" in str(excinfo.value)


# ==========================================
# 2. UNIT TESTS: Context Assembly Service
# ==========================================

def test_context_assembly_service_empty():
    """Verify that context assembly handles empty memories list gracefully."""
    res = ContextAssemblyService.assemble_memory_context([])
    assert "No historical" in res

def test_context_assembly_service_formatting():
    """Verify that context assembly formats memories list into bullet points."""
    memories = [
        UserMemory(content="User prefers vegetarian meals.", memory_type="behavior_pattern"),
        UserMemory(content="User logs transport emissions daily.", memory_type="behavior_pattern")
    ]
    res = ContextAssemblyService.assemble_memory_context(memories)
    assert "User Behavior History & Preferences:" in res
    assert "- User prefers vegetarian meals." in res
    assert "- User logs transport emissions daily." in res


# ==========================================
# 3. INTEGRATION TESTS: AI Memory Endpoints
# ==========================================

@patch("app.services.ai.embedding.EmbeddingService.get_embedding")
def test_memory_rebuild_and_retrieval_flow(mock_get_embedding, client: TestClient, create_jwt, db):
    """Test memory rebuild, search, and list endpoints."""
    # Mock embedding to return a zero vector of size 1536
    mock_get_embedding.return_value = [0.0] * 1536

    user_id = str(uuid.uuid4())
    token = create_jwt(sub=user_id, email="memory.user@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # First request: get profile to initialize user record
    client.get("/api/v1/users/me", headers=headers)

    # 1. Rebuild memory
    response_rebuild = client.post("/api/v1/ai/memory/rebuild", headers=headers)
    assert response_rebuild.status_code == 200
    rebuild_data = response_rebuild.json()["data"]
    # Rebuild should create 5 standard behavior memories
    assert len(rebuild_data) == 5

    # 2. List memories
    response_list = client.get("/api/v1/ai/memory", headers=headers)
    assert response_list.status_code == 200
    list_data = response_list.json()["data"]
    assert len(list_data) == 5
    assert list_data[0]["content"] != ""
    assert list_data[0]["memory_type"] in ["behavior_pattern", "streak_pattern", "footprint_pattern", "mission_pattern"]

    # 3. Search memories
    search_payload = {"query": "metro travel habits", "limit": 2}
    response_search = client.post("/api/v1/ai/memory/search", json=search_payload, headers=headers)
    assert response_search.status_code == 200
    search_data = response_search.json()["data"]
    assert len(search_data) <= 2

    # Check search log is created
    log = db.query(MemoryRetrievalLog).first()
    assert log is not None
    assert log.query_type == "manual_search"
    assert log.memories_retrieved <= 2

    # 4. History log retrieval
    response_history = client.get("/api/v1/ai/memory/history", headers=headers)
    assert response_history.status_code == 200
    history_data = response_history.json()["data"]
    assert len(history_data) == 1
    assert history_data[0]["query_type"] == "manual_search"

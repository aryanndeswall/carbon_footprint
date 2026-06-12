import math
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from uuid import UUID

from app.database.session import get_db
from app.services.ai.memory import MemoryService
from app.services.ai.memory_retrieval import MemoryRetrievalService
from app.schemas.ai import (
    UserMemoryListResponse,
    MemoryRetrievalHistoryResponse,
    MemorySearchRequest
)

router = APIRouter(prefix="/ai", tags=["AI Memory"])

@router.get("/memory", response_model=UserMemoryListResponse)
def get_user_memories(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Retrieve all compiled behavioral memories for the current authenticated user.
    """
    auth_user_id = UUID(request.state.user_id)
    memory_service = MemoryService(db)
    
    try:
        memories = memory_service.get_user_memories(auth_user_id)
        return {
            "success": True,
            "data": memories,
            "message": "User memories retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user memories: {str(e)}"
        )

@router.get("/memory/history", response_model=MemoryRetrievalHistoryResponse)
def get_memory_history(
    request: Request,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """
    Retrieve paginated semantic memory retrieval history logs.
    """
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be >= 1")
    if page_size < 1 or page_size > 100:
        raise HTTPException(status_code=400, detail="Page size must be between 1 and 100")

    auth_user_id = UUID(request.state.user_id)
    retrieval_service = MemoryRetrievalService(db)
    
    try:
        logs, total_items = retrieval_service.get_retrieval_history(auth_user_id, page, page_size)
        total_pages = math.ceil(total_items / page_size) if total_items > 0 else 0
        return {
            "success": True,
            "data": logs,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_items": total_items,
                "total_pages": total_pages
            },
            "message": "Retrieval history logs retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve memory retrieval logs: {str(e)}"
        )

@router.post("/memory/rebuild", response_model=UserMemoryListResponse)
def rebuild_user_memories(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Delete and rebuild semantic behavioral user memories.
    """
    auth_user_id = UUID(request.state.user_id)
    memory_service = MemoryService(db)
    
    try:
        memories = memory_service.rebuild_user_memories(auth_user_id)
        return {
            "success": True,
            "data": memories,
            "message": "User memories rebuilt successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to rebuild user memories: {str(e)}"
        )

@router.post("/memory/search", response_model=UserMemoryListResponse)
def search_similar_memories(
    request: Request,
    payload: MemorySearchRequest,
    db: Session = Depends(get_db)
):
    """
    Execute a semantic/similarity search against the user's memories using a query string.
    """
    auth_user_id = UUID(request.state.user_id)
    retrieval_service = MemoryRetrievalService(db)
    
    try:
        limit = payload.limit or 5
        memories = retrieval_service.retrieve_similar_memories(
            auth_user_id, payload.query, query_type="manual_search", limit=limit
        )
        return {
            "success": True,
            "data": memories,
            "message": "Semantic memory search executed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute semantic search: {str(e)}"
        )

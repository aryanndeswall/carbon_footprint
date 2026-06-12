from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class AIInsightResponseData(BaseModel):
    id: UUID
    insight_type: str
    title: str
    content: str
    generated_at: datetime
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class AIInsightResponse(BaseModel):
    success: bool = True
    data: AIInsightResponseData
    message: Optional[str] = "Operation successful"

class PaginationInfo(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int

class AIInsightHistoryResponse(BaseModel):
    success: bool = True
    data: List[AIInsightResponseData]
    pagination: PaginationInfo
    message: Optional[str] = "Retrieval successful"

class GenerateInsightRequest(BaseModel):
    insight_type: Optional[str] = "daily_coach"

class UserMemoryResponseData(BaseModel):
    id: UUID
    memory_type: str
    content: str
    importance_score: float
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class UserMemoryListResponse(BaseModel):
    success: bool = True
    data: List[UserMemoryResponseData]
    message: Optional[str] = "Operation successful"

class MemoryRetrievalLogResponseData(BaseModel):
    id: UUID
    query_type: str
    memories_retrieved: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class MemoryRetrievalHistoryResponse(BaseModel):
    success: bool = True
    data: List[MemoryRetrievalLogResponseData]
    pagination: PaginationInfo
    message: Optional[str] = "Retrieval successful"

class MemorySearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 5

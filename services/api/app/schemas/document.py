from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class DocumentUploadResponseData(BaseModel):
    document_id: UUID
    status: str

class DocumentUploadResponse(BaseModel):
    success: bool = True
    data: DocumentUploadResponseData

class DocumentResponseData(BaseModel):
    id: UUID
    user_id: UUID
    document_type: str
    file_url: str
    processing_status: str
    uploaded_at: datetime

    model_config = {
        "from_attributes": True
    }

class DocumentResponse(BaseModel):
    success: bool = True
    data: DocumentResponseData
    message: Optional[str] = "Document processed successfully"

class DocumentListResponse(BaseModel):
    success: bool = True
    data: List[DocumentResponseData]
    message: Optional[str] = "Documents retrieved successfully"

class ExtractionResultResponseData(BaseModel):
    id: UUID
    document_id: UUID
    raw_text: str
    structured_data: Dict[str, Any]
    confidence_score: float
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class ExtractionResultResponse(BaseModel):
    success: bool = True
    data: ExtractionResultResponseData
    message: Optional[str] = "Document extraction completed successfully"

class DocumentApproveRequest(BaseModel):
    category: str = Field(..., min_length=1)
    activity_type: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0.0)
    unit: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None

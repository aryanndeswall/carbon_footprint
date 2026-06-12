from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional

from app.database.session import get_db
from app.models.user import User
from app.models.document import UploadedDocument
from app.schemas.document import (
    DocumentUploadResponse,
    DocumentResponse,
    DocumentListResponse,
    ExtractionResultResponse,
    DocumentApproveRequest
)
from app.repositories.document import UploadedDocumentRepository, ExtractionAuditRepository
from app.services.document import DocumentStorageService, DocumentReviewService

router = APIRouter(prefix="/documents", tags=["Documents & OCR Ingestion"])

def _get_db_user(request: Request, db: Session) -> User:
    auth_user_id = UUID(request.state.user_id)
    user = db.query(User).filter(User.auth_user_id == auth_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user profile not found"
        )
    return user

def _verify_doc_ownership(document_id: UUID, user: User, db: Session) -> UploadedDocument:
    doc_repo = UploadedDocumentRepository(db)
    doc = doc_repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    if doc.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this document"
        )
    return doc

@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    request: Request,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document (receipt, electricity_bill, etc.).
    Validates file format, file size (< 5MB), and user profile.
    """
    user = _get_db_user(request, db)

    # 1. Validate file format
    allowed_extensions = {"jpg", "jpeg", "png", "pdf"}
    filename_parts = file.filename.split(".")
    if len(filename_parts) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File has no extension"
        )
    ext = filename_parts[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(allowed_extensions)}"
        )

    # 2. Validate document_type
    allowed_types = {"receipt", "electricity_bill", "shopping_invoice", "transport_ticket", "other"}
    if document_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document_type '{document_type}'. Allowed types: {', '.join(allowed_types)}"
        )

    # 3. Read content & validate file size (< 5MB)
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read upload file: {str(e)}"
        )
    
    max_size = 5 * 1024 * 1024  # 5MB
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 5MB"
        )

    # 4. Upload to storage
    storage_service = DocumentStorageService()
    try:
        file_url = storage_service.upload_file(document_type, file.filename, content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File storage upload failed: {str(e)}"
        )

    # 5. Save document record
    doc_repo = UploadedDocumentRepository(db)
    doc = UploadedDocument(
        user_id=user.id,
        document_type=document_type,
        file_url=file_url,
        processing_status="uploaded"
    )
    created_doc = doc_repo.create(doc)

    # 6. Log audit event
    audit_repo = ExtractionAuditRepository(db)
    audit_repo.create_log(created_doc.id, "upload", "success")

    return {
        "success": True,
        "data": {
            "document_id": created_doc.id,
            "status": "processing"
        }
    }

@router.get("", response_model=DocumentListResponse)
def list_documents(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    List all uploaded documents for the current user.
    """
    user = _get_db_user(request, db)
    doc_repo = UploadedDocumentRepository(db)
    docs = doc_repo.list_by_user(user.id)
    return {
        "success": True,
        "data": docs,
        "message": "Documents retrieved successfully"
    }

@router.get("/{id}", response_model=DocumentResponse)
def get_document_details(
    request: Request,
    id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get detailed breakdown of a single document upload.
    """
    user = _get_db_user(request, db)
    doc = _verify_doc_ownership(id, user, db)
    return {
        "success": True,
        "data": doc,
        "message": "Document details retrieved successfully"
    }

@router.post("/{id}/extract", response_model=ExtractionResultResponse)
def extract_document_data(
    request: Request,
    id: UUID,
    db: Session = Depends(get_db)
):
    """
    Run OCR and AI Extraction on an uploaded document.
    """
    user = _get_db_user(request, db)
    _verify_doc_ownership(id, user, db)
    
    review_service = DocumentReviewService(db)
    try:
        res = review_service.process_ocr_and_extract(id)
        return {
            "success": True,
            "data": res,
            "message": "Document extraction completed successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )

@router.post("/{id}/approve")
def approve_document_extraction(
    request: Request,
    id: UUID,
    payload: DocumentApproveRequest,
    db: Session = Depends(get_db)
):
    """
    Approve extraction results (with manual corrections if needed) and log activity.
    """
    user = _get_db_user(request, db)
    _verify_doc_ownership(id, user, db)
    
    review_service = DocumentReviewService(db)
    try:
        review_service.approve_extraction(
            document_id=id,
            corrected_category=payload.category,
            corrected_activity_type=payload.activity_type,
            corrected_quantity=payload.quantity,
            corrected_unit=payload.unit,
            corrected_metadata=payload.metadata
        )
        return {
            "success": True,
            "message": "Document approved and activity logged successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/{id}/reject")
def reject_document_extraction(
    request: Request,
    id: UUID,
    db: Session = Depends(get_db)
):
    """
    Reject document extraction results.
    """
    user = _get_db_user(request, db)
    _verify_doc_ownership(id, user, db)
    
    review_service = DocumentReviewService(db)
    try:
        review_service.reject_extraction(id)
        return {
            "success": True,
            "message": "Document marked as rejected"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

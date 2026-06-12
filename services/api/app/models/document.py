import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base

class UploadedDocument(Base):
    """
    SQLAlchemy database model representing user-uploaded files for OCR/extraction.
    """
    __tablename__ = "uploaded_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(50), nullable=False)  # receipt, electricity_bill, shopping_invoice, transport_ticket, other
    file_url = Column(Text, nullable=False)
    processing_status = Column(String(50), nullable=False)  # uploaded, extracted, extraction_failed, approved, rejected
    uploaded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="uploaded_documents")


class ExtractionResult(Base):
    """
    SQLAlchemy database model for raw text and structured data extracted by OCR & AI.
    """
    __tablename__ = "extraction_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    raw_text = Column(Text, nullable=False)
    structured_data = Column(JSONB, nullable=False)  # Contains category, activity_type, quantity, unit, metadata
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("UploadedDocument", backref="extraction_result", uselist=False)


class ExtractionAuditLog(Base):
    """
    SQLAlchemy database model for auditing OCR & extraction processing stages.
    """
    __tablename__ = "extraction_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("uploaded_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(100), nullable=False)  # upload, ocr, extraction, validation, approval, rejection
    status = Column(String(50), nullable=False)  # success, failure, pending
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("UploadedDocument", backref="audit_logs")

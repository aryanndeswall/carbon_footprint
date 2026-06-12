from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional, List
from app.models.document import UploadedDocument, ExtractionResult, ExtractionAuditLog

class UploadedDocumentRepository:
    """
    Repository layer for the UploadedDocument model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, document_id: UUID) -> Optional[UploadedDocument]:
        return self.db.query(UploadedDocument).filter(UploadedDocument.id == document_id).first()

    def list_by_user(self, user_id: UUID) -> List[UploadedDocument]:
        return (
            self.db.query(UploadedDocument)
            .filter(UploadedDocument.user_id == user_id)
            .order_by(UploadedDocument.uploaded_at.desc())
            .all()
        )

    def create(self, doc: UploadedDocument) -> UploadedDocument:
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def update(self, doc: UploadedDocument) -> UploadedDocument:
        self.db.commit()
        self.db.refresh(doc)
        return doc


class ExtractionResultRepository:
    """
    Repository layer for the ExtractionResult model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_document_id(self, document_id: UUID) -> Optional[ExtractionResult]:
        return self.db.query(ExtractionResult).filter(ExtractionResult.document_id == document_id).first()

    def create(self, res: ExtractionResult) -> ExtractionResult:
        self.db.add(res)
        self.db.commit()
        self.db.refresh(res)
        return res

    def update(self, res: ExtractionResult) -> ExtractionResult:
        self.db.commit()
        self.db.refresh(res)
        return res


class ExtractionAuditRepository:
    """
    Repository layer for the ExtractionAuditLog model.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_logs_by_document(self, document_id: UUID) -> List[ExtractionAuditLog]:
        return (
            self.db.query(ExtractionAuditLog)
            .filter(ExtractionAuditLog.document_id == document_id)
            .order_by(ExtractionAuditLog.created_at.asc())
            .all()
        )

    def create_log(self, document_id: UUID, stage: str, status: str) -> ExtractionAuditLog:
        log = ExtractionAuditLog(
            document_id=document_id,
            stage=stage,
            status=status
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

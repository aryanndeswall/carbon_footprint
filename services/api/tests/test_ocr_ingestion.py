import pytest
from datetime import datetime, timezone, date
import uuid
from uuid import UUID
import io
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.document import UploadedDocument, ExtractionResult, ExtractionAuditLog
from app.models.activity import ActivityEvent
from app.services.document import (
    OCRService,
    DocumentExtractionService,
    DocumentReviewService
)

# =====================================================================
# UNIT TESTS - OCR & EXTRACTION LOGIC
# =====================================================================

def test_ocr_service_mock_parsing():
    ocr = OCRService()
    
    # 1. Transport metro ticket
    txt_metro = ocr.extract_text(b"", "my_metro_ticket.png")
    assert "Metro Ticket" in txt_metro
    assert "Distance 12 km" in txt_metro

    # 2. Electricity bill
    txt_elec = ocr.extract_text(b"", "electricity_bill.pdf")
    assert "240 kWh" in txt_elec

    # 3. Corrupted file raises error
    with pytest.raises(ValueError, match="corrupted file structure"):
        ocr.extract_text(b"", "corrupted_receipt.jpg")


def test_extraction_service_fallback():
    extractor = DocumentExtractionService()
    
    # 1. Metro text parsing
    data_metro = extractor.extract_data("Metro Ticket\nDistance 12 km")
    assert data_metro["category"] == "transport"
    assert data_metro["activity_type"] == "metro"
    assert data_metro["quantity"] == 12.0
    assert data_metro["confidence_score"] == 0.95

    # 2. Electricity text parsing
    data_elec = extractor.extract_data("Consumption: 240 kWh")
    assert data_elec["category"] == "electricity"
    assert data_elec["activity_type"] == "electricity_usage"
    assert data_elec["quantity"] == 240.0

    # 3. Low confidence garbage text parsing
    data_garbage = extractor.extract_data("Garbage text with no clear values")
    assert data_garbage["confidence_score"] < 0.70


def test_review_service_validation(db: Session):
    # Setup test user
    user = User(id=uuid.uuid4(), auth_user_id=uuid.uuid4(), email="review_val@example.com")
    db.add(user)
    db.commit()

    doc = UploadedDocument(
        user_id=user.id,
        document_type="receipt",
        file_url="http://localhost:8000/uploads/receipts/test.png",
        processing_status="extracted"
    )
    db.add(doc)
    db.commit()

    review_service = DocumentReviewService(db)

    # 1. Reject invalid category
    with pytest.raises(ValueError, match="Invalid category"):
        review_service.approve_extraction(
            document_id=doc.id,
            corrected_category="invalid_cat",
            corrected_activity_type="metro",
            corrected_quantity=10.0,
            corrected_unit="km"
        )

    # 2. Reject invalid activity type
    with pytest.raises(ValueError, match="Invalid activity type"):
        review_service.approve_extraction(
            document_id=doc.id,
            corrected_category="transport",
            corrected_activity_type="invalid_type",
            corrected_quantity=10.0,
            corrected_unit="km"
        )

    # 3. Reject negative quantity
    with pytest.raises(ValueError, match="Quantity must be greater than 0"):
        review_service.approve_extraction(
            document_id=doc.id,
            corrected_category="transport",
            corrected_activity_type="metro",
            corrected_quantity=-5.0,
            corrected_unit="km"
        )


# =====================================================================
# INTEGRATION TESTS - ENDPOINTS
# =====================================================================

def test_full_upload_extract_approve_flow(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="ocr_flow@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Initialize user profile
    client.get("/api/v1/users/me", headers=headers)

    # 1. Upload mock metro ticket file
    file_data = {"file": ("my_metro_receipt.png", b"Mock image bytes", "image/png")}
    form_data = {"document_type": "receipt"}
    
    upload_res = client.post(
        "/api/v1/documents/upload",
        files=file_data,
        data=form_data,
        headers=headers
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()["data"]
    assert upload_data["status"] == "processing"
    
    doc_id = UUID(upload_data["document_id"])

    # 2. Trigger Extraction
    extract_res = client.post(f"/api/v1/documents/{doc_id}/extract", headers=headers)
    assert extract_res.status_code == 200
    ext_data = extract_res.json()["data"]
    assert ext_data["structured_data"]["category"] == "transport"
    assert ext_data["structured_data"]["activity_type"] == "metro"
    assert ext_data["structured_data"]["quantity"] == 12.0
    assert ext_data["confidence_score"] >= 0.90

    # Verify audit logs generated
    audit_logs = db.query(ExtractionAuditLog).filter_by(document_id=doc_id).all()
    stages = {log.stage: log.status for log in audit_logs}
    assert stages["ocr"] == "success"
    assert stages["extraction"] == "success"

    # 3. Approve with manual correction (change distance/quantity to 15 km)
    approve_payload = {
        "category": "transport",
        "activity_type": "metro",
        "quantity": 15.0,
        "unit": "km",
        "metadata": {"custom_note": "adjusted"}
    }
    approve_res = client.post(
        f"/api/v1/documents/{doc_id}/approve",
        json=approve_payload,
        headers=headers
    )
    assert approve_res.status_code == 200
    
    # Check document status is updated to approved
    doc_in_db = db.query(UploadedDocument).filter_by(id=doc_id).first()
    assert doc_in_db.processing_status == "approved"

    # Check that ActivityEvent has been created
    user_db = db.query(User).filter_by(email="ocr_flow@example.com").first()
    activity = db.query(ActivityEvent).filter_by(user_id=user_db.id).first()
    assert activity is not None
    assert activity.category == "transport"
    assert activity.activity_type == "metro"
    assert float(activity.quantity) == 15.0
    assert activity.metadata_json["custom_note"] == "adjusted"


def test_rejection_flow(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="ocr_reject@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # 1. Upload file
    file_data = {"file": ("any_bill.jpg", b"raw bytes", "image/jpeg")}
    form_data = {"document_type": "electricity_bill"}
    upload_res = client.post(
        "/api/v1/documents/upload",
        files=file_data,
        data=form_data,
        headers=headers
    )
    doc_id = upload_res.json()["data"]["document_id"]

    # 2. Extract
    client.post(f"/api/v1/documents/{doc_id}/extract", headers=headers)

    # 3. Reject
    reject_res = client.post(f"/api/v1/documents/{doc_id}/reject", headers=headers)
    assert reject_res.status_code == 200

    # Verify document status updated to rejected
    doc_in_db = db.query(UploadedDocument).filter_by(id=doc_id).first()
    assert doc_in_db.processing_status == "rejected"


# =====================================================================
# VALIDATION & EDGE CASE TESTS
# =====================================================================

def test_invalid_upload_validations(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="ocr_invalid@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # 1. Invalid file extension (.txt)
    file_data = {"file": ("report.txt", b"simple text file content", "text/plain")}
    form_data = {"document_type": "receipt"}
    res_ext = client.post(
        "/api/v1/documents/upload",
        files=file_data,
        data=form_data,
        headers=headers
    )
    assert res_ext.status_code == 400
    assert "Unsupported file format" in res_ext.json()["detail"]

    # 2. File size too large (> 5MB)
    large_bytes = b"0" * (6 * 1024 * 1024) # 6MB
    file_large = {"file": ("huge_image.png", large_bytes, "image/png")}
    res_size = client.post(
        "/api/v1/documents/upload",
        files=file_large,
        data=form_data,
        headers=headers
    )
    assert res_size.status_code == 400
    assert "exceeds maximum limit" in res_size.json()["detail"]


def test_corrupted_file_ocr_error_handling(client: TestClient, create_jwt, db: Session):
    u_auth_id = uuid.uuid4()
    token = create_jwt(sub=str(u_auth_id), email="ocr_corrupt@example.com")
    headers = {"Authorization": f"Bearer {token}"}
    client.get("/api/v1/users/me", headers=headers)

    # Upload file with "corrupted" in filename
    file_data = {"file": ("corrupted_receipt.png", b"Mock corrupted bytes", "image/png")}
    form_data = {"document_type": "receipt"}
    upload_res = client.post(
        "/api/v1/documents/upload",
        files=file_data,
        data=form_data,
        headers=headers
    )
    doc_id = upload_res.json()["data"]["document_id"]

    # Extracting corrupted document should fail
    extract_res = client.post(f"/api/v1/documents/{doc_id}/extract", headers=headers)
    assert extract_res.status_code == 422
    assert "OCR failed" in extract_res.json()["detail"]

    # Verify status is extraction_failed in database
    doc_in_db = db.query(UploadedDocument).filter_by(id=doc_id).first()
    assert doc_in_db.processing_status == "extraction_failed"

    # Verify audit log recorded failure
    audit_logs = db.query(ExtractionAuditLog).filter_by(document_id=doc_id).all()
    stages = {log.stage: log.status for log in audit_logs}
    assert stages["ocr"] == "failure"

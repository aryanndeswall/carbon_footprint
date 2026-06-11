from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import text

def test_health_check_endpoint(client: TestClient):
    """
    Verifies that GET /health returns a 200 status code and {"status": "ok"}.
    """
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_database_connectivity(db: Session):
    """
    Verifies that the database connection is alive and can execute queries.
    """
    result = db.execute(text("SELECT 1")).scalar()
    assert result == 1

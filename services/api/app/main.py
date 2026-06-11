import sys
import os
# Append packages path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../packages/carbon-core")))

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db, SessionLocal
from app.middleware.jwt_auth import JWTAuthMiddleware
from app.api.users import router as user_router
from app.api.activities import router as activity_router
from app.api.footprints import router as footprint_router
from app.api.missions import router as mission_router
from app.services.seed import seed_emission_factors, seed_mission_templates

app = FastAPI(
    title="Carbon Footprint Awareness Platform API",
    description="Sprint 4 API including mission engine and habit formation systems",
    version="0.4.0"
)

# Add JWT Authentication middleware globally
app.add_middleware(JWTAuthMiddleware)

# Seed emission factors and mission templates on API startup
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_emission_factors(db)
        seed_mission_templates(db)
    finally:
        db.close()

# Include core routers under versioned prefix
app.include_router(user_router, prefix="/api/v1")
app.include_router(activity_router, prefix="/api/v1")
app.include_router(footprint_router, prefix="/api/v1")
app.include_router(mission_router, prefix="/api/v1")

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Perform a lightweight query to verify db connection is alive
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection check failed: {str(e)}"
        )

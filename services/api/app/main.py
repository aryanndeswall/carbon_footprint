from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.middleware.jwt_auth import JWTAuthMiddleware
from app.api.users import router as user_router
from app.api.activities import router as activity_router

app = FastAPI(
    title="Carbon Footprint Awareness Platform API",
    description="Sprint 1 API including auth and user lifecycle systems",
    version="0.2.0"
)

# Add JWT Authentication middleware globally
app.add_middleware(JWTAuthMiddleware)

# Include core routers under versioned prefix
app.include_router(user_router, prefix="/api/v1")
app.include_router(activity_router, prefix="/api/v1")

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

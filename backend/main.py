"""
GL Primary Rater Backend API
Main FastAPI application for round-trip rating system
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import os
from pathlib import Path

from api import quotes, comparison, validation, workflow
from core.config import settings
from core.database import init_db, engine
from core.users import (
    fastapi_users, jwt_backend, cookie_backend,
    UserRead, UserCreate, UserUpdate,
)
from core.admin import setup_admin
from core.init_users import create_first_superuser

# Create quotes storage directories
QUOTES_DIR = Path(settings.QUOTES_STORAGE_PATH)
QUOTES_DIR.mkdir(parents=True, exist_ok=True)

# Ensure all other directories exist
for path in [settings.EXCEL_EXPORT_PATH, settings.JSON_EXPORT_PATH, settings.UPLOAD_PATH, settings.LOG_PATH]:
    Path(path).mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("Starting GL Primary Rater Backend...")
    await init_db()
    await create_first_superuser()

    yield

    # Shutdown
    print("Shutting down GL Primary Rater Backend...")

# Create FastAPI application
app = FastAPI(
    title="GL Primary Rater API",
    description="Backend API for Excel-based insurance rating calculations",
    version="1.0.0",
    lifespan=lifespan
)

# ---------------------------------------------------------------------------
# Middleware (order matters — outermost first)
# ---------------------------------------------------------------------------

# Session middleware (required by SQLAdmin)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Auth routers (FastAPI-Users)
# ---------------------------------------------------------------------------

app.include_router(
    fastapi_users.get_auth_router(jwt_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_auth_router(cookie_backend),
    prefix="/auth/cookie",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# ---------------------------------------------------------------------------
# Business routers
# ---------------------------------------------------------------------------

app.include_router(quotes.router, prefix="/api/quotes", tags=["quotes"])
app.include_router(comparison.router, prefix="/api/comparison", tags=["comparison"])
app.include_router(validation.router, prefix="/api/validation", tags=["validation"])
app.include_router(workflow.router, prefix="/api/workflow", tags=["workflow"])

# ---------------------------------------------------------------------------
# SQLAdmin
# ---------------------------------------------------------------------------

admin_instance = setup_admin(app, engine)

# ---------------------------------------------------------------------------
# Root / health
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GL Primary Rater API",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "excel_available": os.path.exists(settings.EXCEL_TEMPLATE_PATH),
        "storage_available": QUOTES_DIR.exists(),
        "database": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

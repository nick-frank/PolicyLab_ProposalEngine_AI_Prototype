"""
Configuration settings for the backend application
"""

from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""

    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "ProposalEngine"
    VERSION: str = "1.0.0"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://proposalengine.com"
    ]

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:////Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/database/quotes.db"

    # Excel Configuration
    EXCEL_TEMPLATE_PATH: str = "../GL_Primary_Rater_unprotected_MklQuote_Txn9163632.xlsm"
    QUOTES_STORAGE_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/quotes"

    # Additional Storage Paths
    BACKEND_DATA_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data"
    EXCEL_EXPORT_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/exports/excel"
    JSON_EXPORT_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/exports/json"
    UPLOAD_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/uploads"
    LOG_PATH: str = "/Users/73563/Documents/3-experiment/13-GL_Rater/backend_data/logs"

    # Storage Configuration
    MAX_QUOTE_AGE_DAYS: int = 90
    ENABLE_DEBUG_MODE: bool = True

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # File Limits
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB

    # Calculation Timeout
    CALCULATION_TIMEOUT: int = 60  # seconds

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
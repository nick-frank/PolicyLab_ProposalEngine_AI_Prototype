"""
SQLAlchemy models for database
"""

from sqlalchemy import Column, String, Float, DateTime, JSON, Text, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .database import Base

class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    CALCULATING = "calculating"
    CALCULATED = "calculated"
    ERROR = "error"
    APPROVED = "approved"
    BOUND = "bound"

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)

    # Quote metadata
    insured_name = Column(String)
    deal_number = Column(String, nullable=True)
    pl2_selection = Column(String)
    status = Column(Enum(QuoteStatus), default=QuoteStatus.DRAFT)

    # Premium values
    technical_premium = Column(Float, nullable=True)
    bound_premium = Column(Float, nullable=True)
    experience_modifier = Column(Float, default=1.0)

    # JSON data storage
    input_data = Column(JSON)
    output_data = Column(JSON, nullable=True)
    validation_results = Column(JSON, nullable=True)

    # File references
    excel_file_path = Column(String, nullable=True)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="quote", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="quote", cascade="all, delete-orphan")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quote_id = Column(String, ForeignKey("quotes.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    event_details = Column(JSON)
    user = Column(String, nullable=True)
    duration_ms = Column(Float, nullable=True)

    # Relationship
    quote = relationship("Quote", back_populates="audit_logs")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quote_id = Column(String, ForeignKey("quotes.id"))
    workflow_id = Column(String)
    stage = Column(String)
    status = Column(String)
    approver = Column(String, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationship
    quote = relationship("Quote", back_populates="approvals")
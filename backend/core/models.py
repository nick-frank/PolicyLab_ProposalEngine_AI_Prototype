"""
SQLAlchemy models for database
"""

from sqlalchemy import Column, String, Float, DateTime, JSON, Text, Enum, ForeignKey, Integer, Boolean, Date
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
import enum
import uuid as _uuid

from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID

from .database import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    User model for authentication.
    Inherits from FastAPI-Users mixin which provides:
      - id (UUID, PK)
      - email (String, unique, indexed)
      - hashed_password (String)
      - is_active (Boolean, default True)
      - is_superuser (Boolean, default False)
      - is_verified (Boolean, default False)
    """
    __tablename__ = "user"

    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="viewer")
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    CALCULATING = "calculating"
    CALCULATED = "calculated"
    ERROR = "error"
    APPROVED = "approved"
    BOUND = "bound"


class SubmissionStatus(str, enum.Enum):
    RECEIVED = "received"
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    PROPOSAL_PRODUCED = "proposal_produced"
    BOUND = "bound"
    DECLINED = "declined"
    CLOSED = "closed"


class ProposalStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    DECLINED = "declined"


class RatingType(str, enum.Enum):
    GL_RATER = "gl_rater"
    PL_RATING = "pl_rating"
    CYBER = "cyber"
    UMBRELLA = "umbrella"


class ExtractionStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class NoteType(str, enum.Enum):
    INTERNAL = "internal"
    EMAIL_INBOUND = "email_inbound"
    EMAIL_OUTBOUND = "email_outbound"


class SublineType(str, enum.Enum):
    PREM_OPS = "prem_ops"
    LIQUOR_LIABILITY = "liquor_liability"


class LiquorLiabilityLimit(str, enum.Enum):
    L100K_100K = "100K/100K"
    L300K_300K = "300K/300K"
    L500K_500K = "500K/500K"
    L1M_1M = "1M/1M"
    L1M_2M = "1M/2M"


# ---------------------------------------------------------------------------
# Legacy models
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Submission & Proposal models
# ---------------------------------------------------------------------------

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    reference_number = Column(String, unique=True, nullable=False)
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.RECEIVED)

    # Insured info
    insured_name = Column(String, nullable=False)
    dba = Column(String, nullable=True)
    fein = Column(String, nullable=True)
    entity_type = Column(String, nullable=True)
    primary_operations = Column(String, nullable=True)
    naics_code = Column(String, nullable=True)
    naics_description = Column(String, nullable=True)
    years_in_business = Column(Integer, nullable=True)
    number_of_employees = Column(Integer, nullable=True)
    annual_revenue = Column(Float, nullable=True)
    subcontractor_pct = Column(Float, nullable=True)

    # Policy info
    line_of_business = Column(String, nullable=True)
    territory = Column(String, nullable=True)
    estimated_premium = Column(Float, nullable=True)
    effective_date = Column(Date, nullable=True)
    expiration_date = Column(Date, nullable=True)

    # People
    underwriter_id = Column(String, ForeignKey("user.id"), nullable=True)
    approver_id = Column(String, ForeignKey("user.id"), nullable=True)
    created_by = Column(String, ForeignKey("user.id"), nullable=True)

    # Broker
    broker_name = Column(String, nullable=True)
    broker_contact = Column(String, nullable=True)

    # Underwriting
    underwriting_summary = Column(Text, nullable=True)

    # Timestamps
    received_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proposals = relationship("Proposal", back_populates="submission", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="submission", cascade="all, delete-orphan")
    loss_runs = relationship("LossRun", back_populates="submission", cascade="all, delete-orphan")
    notes = relationship("SubmissionNote", back_populates="submission", cascade="all, delete-orphan")
    structured_fields = relationship("StructuredField", back_populates="submission", cascade="all, delete-orphan")
    status_events = relationship("StatusEvent", back_populates="submission", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="submission")


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)

    name = Column(String, nullable=False)
    version = Column(Integer, default=1)
    status = Column(Enum(ProposalStatus), default=ProposalStatus.DRAFT)
    rating_type = Column(Enum(RatingType), nullable=True)
    line_of_business = Column(String, nullable=True)

    # Premium values
    total_premium = Column(Float, nullable=True)
    indicated_premium = Column(Float, nullable=True)
    technical_premium = Column(Float, nullable=True)
    bound_premium = Column(Float, nullable=True)

    # JSON data
    policy_details = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    validation_results = Column(JSON, nullable=True)

    # File references
    excel_file_path = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, ForeignKey("user.id"), nullable=True)

    # Relationships
    submission = relationship("Submission", back_populates="proposals")
    rates = relationship("ProposalRate", back_populates="proposal", cascade="all, delete-orphan")
    forms = relationship("ProposalForm", back_populates="proposal", cascade="all, delete-orphan")
    notes = relationship("ProposalNote", back_populates="proposal", cascade="all, delete-orphan")
    approvals = relationship("Approval", back_populates="proposal")
    audit_logs = relationship("AuditLog", back_populates="proposal")


class ProposalRate(Base):
    __tablename__ = "proposal_rates"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=False)

    row_index = Column(Integer, nullable=True)
    class_code = Column(String, nullable=True)
    class_code_description = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    location_number = Column(Integer, nullable=True)
    territory = Column(String, nullable=True)
    subline = Column(String, nullable=True)
    dominant_class_indicator = Column(Boolean, default=False)
    liquor_liability_limit = Column(String, nullable=True)

    # Exposure fields
    exposures = Column(Float, nullable=True)
    prior_year_exposures = Column(Float, nullable=True)
    exposure_base = Column(String, nullable=True)

    # Rate fields
    premops_liquor_rate = Column(Float, nullable=True)
    products_rate = Column(Float, nullable=True)
    total_rate = Column(Float, nullable=True)

    # Premium fields
    premops_liquor_prem = Column(Float, nullable=True)
    products_premium = Column(Float, nullable=True)
    technical_premium = Column(Float, nullable=True)
    modified_rate = Column(Float, nullable=True)
    modified_premium = Column(Float, nullable=True)

    # Audit fields
    audit_rate_selection = Column(String, nullable=True)
    base_rate = Column(Float, nullable=True)
    manual_premium = Column(Float, nullable=True)
    lcm = Column(Float, nullable=True)
    adjusted_premium = Column(Float, nullable=True)

    # Relationships
    proposal = relationship("Proposal", back_populates="rates")


class ProposalForm(Base):
    __tablename__ = "proposal_forms"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=False)

    form_number = Column(String, nullable=True)
    edition = Column(String, nullable=True)
    form_name = Column(String, nullable=True)
    form_type = Column(String, nullable=True)
    premium_adjustment = Column(Float, nullable=True)
    is_included = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    proposal = relationship("Proposal", back_populates="forms")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)

    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String, ForeignKey("user.id"), nullable=True)

    # Extraction
    extraction_status = Column(Enum(ExtractionStatus), default=ExtractionStatus.PENDING)
    extraction_completed_at = Column(DateTime, nullable=True)
    extraction_confidence = Column(Float, nullable=True)

    # Relationships
    submission = relationship("Submission", back_populates="documents")
    structured_fields = relationship("StructuredField", back_populates="document")


class StructuredField(Base):
    __tablename__ = "structured_fields"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)

    field_group = Column(String, nullable=True)
    field_name = Column(String, nullable=False)
    extracted_value = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    override_value = Column(String, nullable=True)
    overridden_by = Column(String, ForeignKey("user.id"), nullable=True)
    overridden_at = Column(DateTime, nullable=True)

    # Relationships
    submission = relationship("Submission", back_populates="structured_fields")
    document = relationship("Document", back_populates="structured_fields")


class LossRun(Base):
    __tablename__ = "loss_runs"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)

    policy_year = Column(String, nullable=True)
    carrier = Column(String, nullable=True)
    premium = Column(Float, nullable=True)
    claim_count = Column(Integer, nullable=True)
    incurred = Column(Float, nullable=True)
    paid = Column(Float, nullable=True)
    reserves = Column(Float, nullable=True)
    loss_ratio = Column(Float, nullable=True)
    date_of_loss = Column(Date, nullable=True)
    ground_up_indemnity = Column(Float, nullable=True)
    ground_up_expense = Column(Float, nullable=True)
    ground_up_total_incurred = Column(Float, nullable=True)
    indemnity_less_deductible = Column(Float, nullable=True)
    includable_losses = Column(Float, nullable=True)
    policy_period = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)

    # Relationships
    submission = relationship("Submission", back_populates="loss_runs")


class SubmissionNote(Base):
    __tablename__ = "submission_notes"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)

    note_type = Column(Enum(NoteType), default=NoteType.INTERNAL)
    subject = Column(String, nullable=True)
    body = Column(Text, nullable=True)
    from_address = Column(String, nullable=True)
    to_address = Column(String, nullable=True)
    author_id = Column(String, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submission = relationship("Submission", back_populates="notes")


class ProposalNote(Base):
    __tablename__ = "proposal_notes"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=False)

    body = Column(Text, nullable=True)
    author_id = Column(String, ForeignKey("user.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    proposal = relationship("Proposal", back_populates="notes")


class StatusEvent(Base):
    __tablename__ = "status_events"

    id = Column(String, primary_key=True, default=lambda: str(_uuid.uuid4()))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)

    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=True)
    description = Column(String, nullable=True)
    actor_id = Column(String, ForeignKey("user.id"), nullable=True)
    actor_name = Column(String, nullable=True)
    occurred_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    submission = relationship("Submission", back_populates="status_events")


# ---------------------------------------------------------------------------
# Modified legacy models
# ---------------------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quote_id = Column(String, ForeignKey("quotes.id"))
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=True)
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    event_type = Column(String)
    event_details = Column(JSON)
    user = Column(String, nullable=True)
    duration_ms = Column(Float, nullable=True)

    # Relationships
    quote = relationship("Quote", back_populates="audit_logs")
    submission = relationship("Submission", back_populates="audit_logs")
    proposal = relationship("Proposal", back_populates="audit_logs")


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    quote_id = Column(String, ForeignKey("quotes.id"))
    proposal_id = Column(String, ForeignKey("proposals.id"), nullable=True)
    workflow_id = Column(String)
    stage = Column(String)
    status = Column(String)
    approver = Column(String, nullable=True)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    quote = relationship("Quote", back_populates="approvals")
    proposal = relationship("Proposal", back_populates="approvals")

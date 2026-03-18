"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, validator
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from enum import Enum

# Enums
class PL2Type(str, Enum):
    CONTRACTORS = "Contractors"
    GENERAL_LIABILITY = "General Liability"
    PRODUCTS_LIABILITY = "Products Liability - Occurrence"
    OTHER = "Other"

class SIRType(str, Enum):
    SIR = "SIR"
    DEDUCTIBLE = "Deductible"

# Policy Details Schemas
class PolicyDates(BaseModel):
    new: Optional[date] = None
    expiring: Optional[date] = None

class PolicyLimits(BaseModel):
    new: Optional[float] = None
    expiring: Optional[float] = None

class PolicyDetails(BaseModel):
    insured: str
    deal_number: Optional[str] = None
    pl2: PL2Type
    territory: str = "None"
    policy_effective_date: PolicyDates
    policy_expiration_date: PolicyDates
    occurrence_limit: PolicyLimits
    aggregate_limit: PolicyLimits
    sir_type: Dict[str, SIRType]
    sir_amount: PolicyLimits
    commission: PolicyLimits

# Class Row Schema
class ClassRow(BaseModel):
    class_code: str
    description: Optional[str] = None
    location_number: Optional[str] = None
    subline: Optional[str] = None
    dominant_class: Optional[str] = None
    liquor_liability_limit: Optional[str] = None
    zip_code: Optional[str] = None
    exposures: Optional[float] = None
    prior_year_exposures: Optional[float] = None
    exposure_base: Optional[str] = None

# Loss Detail Schema
class LossDetail(BaseModel):
    date_of_loss: Optional[date] = None
    ground_up_indemnity: Optional[float] = None
    ground_up_expense: Optional[float] = None

# Input Schema (from Web to Backend)
class ExposureRatingInput(BaseModel):
    policy_details: PolicyDetails
    sales: Optional[Dict[str, Optional[float]]] = None
    class_rows: List[ClassRow]

class ExperienceModifierInput(BaseModel):
    evaluation_date: Optional[date] = None
    policy_year_1: Optional[str] = None
    policy_year_2: Optional[str] = None
    losses: List[LossDetail] = []

class QuoteInput(BaseModel):
    metadata: Optional[Dict[str, Any]] = None
    exposure_rating: ExposureRatingInput
    experience_modifier: Optional[ExperienceModifierInput] = None
    uw_notes: Optional[str] = None

# Output Schema (from Backend to Web)
class CalculatedValues(BaseModel):
    technical_premium_pre_emod: float
    experience_modifier: float
    technical_premium_post_emod: float
    calculated_premium: Optional[float] = None
    technical_ratio: Optional[float] = None
    rate_change: Optional[float] = None
    composite_rates: Optional[Dict[str, float]] = None

class ClassCalculation(BaseModel):
    row_index: int
    class_code: str
    premops_rate: Optional[float] = None
    premops_prem: Optional[float] = None
    products_rate: Optional[float] = None
    products_prem: Optional[float] = None
    total_rate: Optional[float] = None
    technical_premium: Optional[float] = None
    modified_rate: Optional[float] = None
    modified_premium: Optional[float] = None
    audit_rate_selection: Optional[str] = None

class QuoteOutput(BaseModel):
    metadata: Dict[str, Any]
    calculated_values: CalculatedValues
    class_calculations: List[ClassCalculation]
    experience_calculations: Optional[Dict[str, Any]] = None

# Quote Response Schema
class QuoteResponse(BaseModel):
    quote_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    insured_name: str
    deal_number: Optional[str] = None
    pl2_selection: str
    technical_premium: Optional[float] = None
    bound_premium: Optional[float] = None
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None

# Validation Schemas
class ValidationError(BaseModel):
    field: str
    message: str
    severity: str = "error"

class ValidationWarning(BaseModel):
    field: str
    message: str
    severity: str = "warning"
    suggested_value: Optional[Any] = None

class ValidationSuggestion(BaseModel):
    field: str
    message: str
    severity: str = "suggestion"
    recommended_action: Optional[str] = None

class AutoCorrection(BaseModel):
    field: str
    original_value: Any
    corrected_value: Any
    reason: str
    confidence: float

class ValidationResult(BaseModel):
    errors: List[ValidationError] = []
    warnings: List[ValidationWarning] = []
    suggestions: List[ValidationSuggestion] = []
    auto_corrections: List[AutoCorrection] = []
    confidence_scores: Dict[str, float] = {}
    is_valid: bool = True

# Comparison Schemas
class ComparisonRequest(BaseModel):
    quote_ids: List[str]
    comparison_type: str = "side_by_side"

class ComparisonHighlight(BaseModel):
    field_path: str
    values: Dict[str, Any]
    difference: Optional[Any] = None
    percentage_change: Optional[float] = None
    significance: str

class ComparisonResponse(BaseModel):
    comparison_id: str
    highlights: List[ComparisonHighlight]
    differences: List[Dict[str, Any]]
    recommendations: List[str]

# Workflow Schemas
class WorkflowStage(BaseModel):
    stage_id: str
    stage_name: str
    status: str
    assigned_to: Optional[str] = None
    sla_hours: int
    deadline: Optional[datetime] = None

class WorkflowInstance(BaseModel):
    instance_id: str
    workflow_type: str
    quote_id: str
    current_stage: WorkflowStage
    status: str
    created_at: datetime
    created_by: str

class ApprovalDecision(BaseModel):
    decision: str  # approve, reject, return
    comments: Optional[str] = None
    next_assignee: Optional[str] = None
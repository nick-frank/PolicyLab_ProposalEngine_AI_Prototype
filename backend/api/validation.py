"""
Validation API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from validation.validator import IntelligentValidator

router = APIRouter()
validator = IntelligentValidator()

class ValidationRequest(BaseModel):
    quote_input: Optional[Dict[str, Any]] = None
    # Also accept raw quote data at top level
    exposure_rating: Optional[Dict[str, Any]] = None
    experience_modifier: Optional[Dict[str, Any]] = None
    uw_notes: Optional[str] = None

class FieldValidationRequest(BaseModel):
    field_name: str
    value: Any

@router.post("/validate")
async def validate_quote(request: ValidationRequest):
    """Validate quote input"""
    # Support both wrapped (quote_input) and raw format
    if request.quote_input:
        quote_data = request.quote_input
    elif request.exposure_rating:
        quote_data = {
            "exposure_rating": request.exposure_rating,
            "experience_modifier": request.experience_modifier,
            "uw_notes": request.uw_notes,
        }
    else:
        quote_data = {}
    result = await validator.validate_quote(quote_data)
    return result

@router.post("/field")
async def validate_field(request: FieldValidationRequest):
    """Validate individual field"""
    result = await validator.validate_field(request.field_name, request.value)
    return {"warnings": result.warnings, "errors": result.errors}

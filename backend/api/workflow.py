"""
Workflow API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class SubmitRequest(BaseModel):
    quote_id: str
    submitted_by: Optional[str] = "system"
    notes: Optional[str] = ""

@router.get("/status")
async def workflow_status():
    """Get workflow status"""
    return {
        "status": "active",
        "pending_approvals": 0,
        "message": "Workflow system is operational"
    }

@router.post("/submit")
async def submit_for_approval(request: SubmitRequest):
    """Submit a quote for approval"""
    return {
        "status": "submitted",
        "quote_id": request.quote_id,
        "submitted_by": request.submitted_by,
        "submitted_at": datetime.utcnow().isoformat(),
        "message": f"Quote {request.quote_id} submitted for approval"
    }

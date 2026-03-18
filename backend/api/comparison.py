"""
Quote comparison API endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from pathlib import Path

from core.config import settings

router = APIRouter()

class CompareRequest(BaseModel):
    quote_ids: List[str]

@router.post("/compare")
async def compare_quotes(request: CompareRequest):
    """Compare multiple quotes"""
    quotes_dir = Path(settings.QUOTES_STORAGE_PATH)
    results = []

    for qid in request.quote_ids:
        quote_file = quotes_dir / f"{qid}.json"
        if quote_file.exists():
            data = json.loads(quote_file.read_text())
            input_data = data.get("input_data", {})
            output_data = data.get("output_data", {})
            policy = input_data.get("exposure_rating", {}).get("policy_details", {})
            results.append({
                "quote_id": qid,
                "insured_name": policy.get("insured", "Unknown"),
                "pl2_selection": policy.get("pl2", "-"),
                "territory": policy.get("territory", "-"),
                "technical_premium": output_data.get("calculated_values", {}).get("technical_premium_post_emod", 0),
            })
        else:
            results.append({
                "quote_id": qid,
                "insured_name": "Not Found",
                "pl2_selection": "-",
                "territory": "-",
                "technical_premium": 0,
            })

    return {"quotes": results, "count": len(results)}

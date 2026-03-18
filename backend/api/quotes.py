"""
Quotes API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import json
import uuid
from pathlib import Path
from datetime import datetime

from core.database import get_db
from core.models import Quote as QuoteModel, QuoteStatus, AuditLog
from core.schemas import QuoteInput, QuoteOutput, QuoteResponse, ValidationResult
from excel.processor import ExcelProcessor
from storage.quote_manager import QuoteManager
from validation.validator import IntelligentValidator

router = APIRouter()

# Initialize processors
excel_processor = ExcelProcessor()
quote_manager = QuoteManager()
validator = IntelligentValidator()

@router.post("/new", response_model=dict)
async def create_quote(
    quote_input: QuoteInput,
    db: AsyncSession = Depends(get_db)
):
    """Create and process a new quote"""
    try:
        # Validate input
        validation_result = await validator.validate_quote(quote_input.model_dump())

        if validation_result.errors:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "validation_error",
                    "validation_result": validation_result.model_dump()
                }
            )

        # Process quote through Excel
        result = await excel_processor.process_quote(quote_input)

        # Save to database
        quote_model = QuoteModel(
            id=result["quote_id"],
            insured_name=quote_input.exposure_rating.policy_details.insured,
            deal_number=quote_input.exposure_rating.policy_details.deal_number,
            pl2_selection=quote_input.exposure_rating.policy_details.pl2.value,
            status=QuoteStatus.CALCULATED,
            input_data=quote_input.model_dump(),
            output_data=result["output"],
            validation_results=validation_result.model_dump(),
            excel_file_path=f"quotes/{result['quote_id']}/GL_Primary_Rater_{result['quote_id']}.xlsm"
        )

        # Extract premium values from output
        if "calculated_values" in result["output"]:
            quote_model.technical_premium = result["output"]["calculated_values"].get("technical_premium_post_emod", 0)
            quote_model.experience_modifier = result["output"]["calculated_values"].get("experience_modifier", 1.0)

        db.add(quote_model)
        await db.commit()

        return {
            "quote_id": result["quote_id"],
            "status": "success",
            "validation_result": validation_result.model_dump(),
            "output": result["output"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=dict)
async def list_quotes(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    insured: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all quotes with pagination and filtering"""
    try:
        query = db.query(QuoteModel)

        # Apply filters
        if status:
            query = query.filter(QuoteModel.status == status)
        if insured:
            query = query.filter(QuoteModel.insured_name.contains(insured))

        # Get total count
        total = await db.scalar(query.count())

        # Apply pagination
        offset = (page - 1) * limit
        quotes = await db.scalars(
            query.order_by(QuoteModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        # Convert to response format
        quote_list = []
        for quote in quotes:
            quote_list.append({
                "quote_id": quote.id,
                "insured_name": quote.insured_name,
                "deal_number": quote.deal_number,
                "pl2_selection": quote.pl2_selection,
                "status": quote.status.value,
                "technical_premium": quote.technical_premium,
                "bound_premium": quote.bound_premium,
                "created_at": quote.created_at.isoformat(),
                "updated_at": quote.updated_at.isoformat()
            })

        return {
            "quotes": quote_list,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }

    except Exception as e:
        # If database isn't set up, return from filesystem
        return await quote_manager.list_quotes_from_filesystem(page, limit, status, insured)

@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get specific quote details"""
    try:
        quote = await db.get(QuoteModel, quote_id)

        if not quote:
            # Try to load from filesystem
            quote_data = await quote_manager.load_quote_from_filesystem(quote_id)
            if not quote_data:
                raise HTTPException(status_code=404, detail="Quote not found")
            return quote_data

        return QuoteResponse(
            quote_id=quote.id,
            status=quote.status.value,
            created_at=quote.created_at,
            updated_at=quote.updated_at,
            insured_name=quote.insured_name,
            deal_number=quote.deal_number,
            pl2_selection=quote.pl2_selection,
            technical_premium=quote.technical_premium,
            bound_premium=quote.bound_premium,
            input_data=quote.input_data,
            output_data=quote.output_data
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quote_id}/input")
async def get_quote_input(quote_id: str):
    """Get original input JSON for a quote"""
    try:
        input_path = Path(f"quotes/{quote_id}/input.json")

        if not input_path.exists():
            raise HTTPException(status_code=404, detail="Input file not found")

        return FileResponse(
            path=input_path,
            media_type="application/json",
            filename=f"quote_{quote_id}_input.json"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quote_id}/output")
async def get_quote_output(quote_id: str):
    """Get calculated output JSON for a quote"""
    try:
        output_path = Path(f"quotes/{quote_id}/output.json")

        if not output_path.exists():
            raise HTTPException(status_code=404, detail="Output file not found")

        return FileResponse(
            path=output_path,
            media_type="application/json",
            filename=f"quote_{quote_id}_output.json"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quote_id}/excel")
async def download_excel(quote_id: str):
    """Download Excel file for a quote"""
    try:
        # Try .xlsm first, then .xlsx
        excel_path = Path(f"quotes/{quote_id}/GL_Primary_Rater_{quote_id}.xlsm")
        if not excel_path.exists():
            excel_path = Path(f"quotes/{quote_id}/GL_Primary_Rater_{quote_id}.xlsx")

        if not excel_path.exists():
            raise HTTPException(status_code=404, detail="Excel file not found")

        return FileResponse(
            path=excel_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=excel_path.name
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quote_id}/audit")
async def get_audit_trail(quote_id: str):
    """Get audit trail for a quote"""
    try:
        audit_path = Path(f"quotes/{quote_id}/audit_log.json")

        if not audit_path.exists():
            raise HTTPException(status_code=404, detail="Audit log not found")

        with open(audit_path, "r") as f:
            audit_data = json.load(f)

        return audit_data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{quote_id}/debug")
async def get_debug_info(quote_id: str):
    """Get debug information for a quote"""
    try:
        debug_info = {
            "quote_id": quote_id,
            "files": {}
        }

        quote_dir = Path(f"quotes/{quote_id}")

        if not quote_dir.exists():
            raise HTTPException(status_code=404, detail="Quote directory not found")

        # List all files in quote directory
        for file_path in quote_dir.iterdir():
            if file_path.is_file():
                debug_info["files"][file_path.name] = {
                    "size": file_path.stat().st_size,
                    "modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat()
                }

        # Load metadata if exists
        metadata_path = quote_dir / "metadata.json"
        if metadata_path.exists():
            with open(metadata_path, "r") as f:
                debug_info["metadata"] = json.load(f)

        # Load audit summary if exists
        audit_path = quote_dir / "audit_log.json"
        if audit_path.exists():
            with open(audit_path, "r") as f:
                audit_data = json.load(f)
                debug_info["audit_summary"] = audit_data.get("summary", {})

        return debug_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{quote_id}/recalculate")
async def recalculate_quote(
    quote_id: str,
    quote_input: QuoteInput,
    db: AsyncSession = Depends(get_db)
):
    """Recalculate an existing quote with updated input"""
    try:
        # Validate input
        validation_result = await validator.validate_quote(quote_input.model_dump())

        if validation_result.errors:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "validation_error",
                    "validation_result": validation_result.model_dump()
                }
            )

        # Create version backup
        await quote_manager.create_version_backup(quote_id)

        # Process updated quote
        result = await excel_processor.process_quote(quote_input)

        # Update database
        quote = await db.get(QuoteModel, quote_id)
        if quote:
            quote.input_data = quote_input.model_dump()
            quote.output_data = result["output"]
            quote.validation_results = validation_result.model_dump()
            quote.updated_at = datetime.utcnow()
            quote.status = QuoteStatus.CALCULATED

            if "calculated_values" in result["output"]:
                quote.technical_premium = result["output"]["calculated_values"].get("technical_premium_post_emod", 0)
                quote.experience_modifier = result["output"]["calculated_values"].get("experience_modifier", 1.0)

            await db.commit()

        return {
            "quote_id": quote_id,
            "status": "recalculated",
            "validation_result": validation_result.model_dump(),
            "output": result["output"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{quote_id}")
async def delete_quote(
    quote_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete a quote"""
    try:
        # Delete from database
        quote = await db.get(QuoteModel, quote_id)
        if quote:
            await db.delete(quote)
            await db.commit()

        # Delete from filesystem
        await quote_manager.delete_quote_from_filesystem(quote_id)

        return {"status": "deleted", "quote_id": quote_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate")
async def calculate_quote(quote_input: QuoteInput):
    """Calculate quote without saving (for preview/testing)"""
    try:
        # Validate input
        validation_result = await validator.validate_quote(quote_input.model_dump())

        # Process quote
        result = await excel_processor.process_quote(quote_input)

        return {
            "validation_result": validation_result.model_dump(),
            "output": result["output"],
            "quote_id": result["quote_id"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
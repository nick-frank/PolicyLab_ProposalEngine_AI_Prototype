"""
Quote input validation module
"""

from typing import Dict, Any, List
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_valid: bool = True
    errors: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []

class IntelligentValidator:
    """Validates quote inputs and provides feedback"""

    async def validate_quote(self, quote_data: Dict[str, Any]) -> ValidationResult:
        """Validate quote input data"""
        result = ValidationResult()

        # Basic validation
        if not quote_data:
            result.is_valid = False
            result.errors.append("No quote data provided")
            return result

        # Check for required fields
        if 'exposure_rating' not in quote_data:
            result.is_valid = False
            result.errors.append("Exposure rating section is required")
            return result

        exposure = quote_data.get('exposure_rating', {})
        policy_details = exposure.get('policy_details', {})

        # Validate insured name
        if not policy_details.get('insured'):
            result.is_valid = False
            result.errors.append("Insured name is required")

        # Validate PL2
        if not policy_details.get('pl2'):
            result.is_valid = False
            result.errors.append("PL2 selection is required")
        else:
            valid_pl2 = ['Contractors', 'General Liability', 'Products Liability - Occurrence', 'Other']
            if policy_details['pl2'] not in valid_pl2:
                result.warnings.append(f"PL2 value '{policy_details['pl2']}' may not be recognized")

        # Validate class codes
        class_rows = exposure.get('class_rows', [])
        if not class_rows:
            result.warnings.append("No class codes provided")
        else:
            for i, row in enumerate(class_rows):
                if not row.get('class_code'):
                    result.warnings.append(f"Class code missing in row {i+1}")
                if not row.get('exposures') and row.get('exposures') != 0:
                    result.warnings.append(f"Exposure amount missing in row {i+1}")

        # Add suggestions
        if policy_details.get('pl2') == 'Contractors':
            if not policy_details.get('sales'):
                result.suggestions.append("Consider adding sales information for Contractors")

        # Experience modifier validation
        exp_mod = quote_data.get('experience_modifier', {})
        if exp_mod:
            modifier = exp_mod.get('modifier_value')
            if modifier and (modifier < 0.5 or modifier > 2.0):
                result.warnings.append(f"Experience modifier {modifier} seems unusual (typically 0.5-2.0)")

        return result

    async def validate_field(self, field_name: str, value: Any) -> ValidationResult:
        """Validate individual field"""
        result = ValidationResult()

        if field_name == 'insured' and not value:
            result.is_valid = False
            result.errors.append("Insured name is required")

        if field_name == 'territory' and value:
            if not value.startswith(('CA-', 'NY-', 'TX-', 'FL-')):
                result.warnings.append(f"Territory '{value}' format may be incorrect")

        if field_name == 'commission' and value is not None:
            try:
                val = float(value)
                if val > 0.30:
                    result.warnings.append("Commission exceeds typical range (>30%)")
            except (ValueError, TypeError):
                pass

        return result
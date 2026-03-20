# Exposure Rating Tab - Business Rules and Requirements

## Overview
The Exposure Rating tab in the GL Primary Rater workbook is a complex rating calculator that changes its behavior significantly based on the PL_2 (Product Line 2) dropdown selection. This document comprehensively describes all input fields, dropdown behaviors, conditional logic, and calculation rules.

## Input Fields (Beige Color: #FFF4F2EB)

### Policy Details Section (Rows 6-14)
All fields in columns C and D with beige background are user inputs:

1. **PL_2 (C6)** - Primary dropdown that controls entire screen behavior
   - Type: Dropdown
   - Options:
     - Contractors
     - General Liability
     - Products Liability - Occurrence
     - Other
   - **Critical**: This selection fundamentally changes how the entire tab behaves

2. **Policy Status (C7)**
   - Type: Dropdown (inferred)
   - Current value: "New / Renewal"
   - Background: White (not beige, may be calculated)

3. **Territory (C8)**
   - Type: Input field
   - Background: Beige
   - Default: "None"

4. **Policy Expiration Date (C9)**
   - Type: Calculated field
   - Formula: `=IF(pol_eff_dt = "","",DATE(YEAR(pol_eff_dt)+1,MONTH(pol_eff_dt),DAY(pol_eff_dt)))`
   - Depends on: Policy Effective Date

5. **Each Occurrence Limit (C10/D10)**
   - Type: Numeric input
   - Background: Beige
   - Default: 1000000

6. **General Aggregate Limit (C11/D11)**
   - Type: Numeric input
   - Background: Beige
   - Default: 2000000

7. **SIR Type (C12/D12)**
   - Type: Dropdown
   - Options: "SIR", "Deductible"
   - Background: Beige
   - Default: "Deductible"

8. **SIR Amount (C13/D13)**
   - Type: Numeric input
   - Background: Beige
   - Default: 5000

### Table 2: Class Rating Details (Rows 18-57)

#### Always Available Input Columns:

1. **Class Code (Column C)**
   - Type: Text input (should be dropdown with 1,184 codes)
   - Background: Beige
   - Example: "94007"

2. **Class Code Description (Column D)**
   - Type: Text/Formula hybrid
   - Background: Beige
   - Either manual input or VLOOKUP from Class Codes sheet
   - Formula when empty: `=IFERROR(VLOOKUP(C[row],'Class Codes'!B:F,2,FALSE),"")`

3. **Exposures (Column K)**
   - Type: Numeric input
   - Background: Beige
   - Used in rate calculations

#### Conditionally Available Columns (Based on PL_2 Selection):

##### When PL_2 = "General Liability":

4. **Location Number (Column G)**
   - Type: Numeric input
   - Background: Unknown (likely beige when enabled)
   - **Required** when Subline is entered
   - Error message if missing: "Enter Location Number"

5. **Subline (Column H)**
   - Type: Dropdown
   - Options: "Prem/Ops", "Liquor Liability"
   - Background: Beige when enabled
   - **Only available when PL_2 = "General Liability"**
   - Validation range: H18:H37

6. **Dominant Class Indicator (Column I)**
   - Type: Dropdown
   - Options: "Prem/Ops Dominant Class", "Liquor Liability Dominant Class"
   - **Only relevant when PL_2 = "General Liability"**
   - Validation range: I18:I37

7. **Liquor Liability Limit (Column J)**
   - Type: Dropdown
   - Options: "100K/100K", "300K/300K", "500K/500K", "1M/1M", "1M/2M"
   - **Only used when Subline = "Liquor Liability"**
   - Validation range: J18:J37

##### When PL_2 = "Contractors", "Products Liability", or "Other":
- Columns G, H, I, J are **not used/disabled**
- Different calculation columns become active (AI-AJ for Contractors, AP-AQ for Products)

## Dynamic Headers and Labels

### Column Headers That Change (Row 17):

1. **Column N Header**
   - When PL_2 ≠ "General Liability": Shows "PremOps Rate"
   - When PL_2 = "General Liability": Shows "PremOps / Liquor Rate"
   - Formula: `=IF(PL_2<>"General Liability","PremOps Rate","PremOps / Liquor Rate")`

2. **Column Q Header**
   - When PL_2 ≠ "General Liability": Shows "PremOps Prem"
   - When PL_2 = "General Liability": Shows "PremOps / Liquor Prem"
   - Formula: `=IF(PL_2<>"General Liability","PremOps Prem","PremOps / Liquor Prem")`

## Business Rules by PL_2 Selection

### 1. When PL_2 = "General Liability"

**Enabled Features:**
- Subline dropdown (H) becomes active
- Location Number (G) becomes required when Subline is populated
- Liquor Liability options become available
- Headers change to show "PremOps / Liquor"

**Required Field Validations:**
- If Class Code is entered but Subline is empty: Show "Enter Subline"
- If Subline is entered but Location Number is empty: Show "Enter Location Number"

**Calculation Logic:**
- Uses standard PremOps calculations
- When Subline = "Liquor Liability":
  - Applies Liquor Liability Limit factors
  - Uses different rate lookup tables
  - Calculates separate Liquor premiums

**Column Visibility:**
- Columns N, O, P, Q, R, S, T, U all active
- Special Liquor calculations in background columns

### 2. When PL_2 = "Contractors"

**Enabled Features:**
- Contractors-specific minimum premium logic
- Uses columns AI-AJ for special Contractors calculations

**Disabled Features:**
- Subline (H) - not used
- Location Number (G) - not used
- Liquor options - not available

**Calculation Logic:**
- Modified Premium (U) = MAX(Technical Premium (S), Contractors Calculation (AI))
- Special Contractors rate modifications apply
- Minimum premium rules enforced

**Column Visibility:**
- Standard rate columns active
- Columns AI-AJ used for Contractors calculations
- No Liquor-related columns

### 3. When PL_2 = "Products Liability - Occurrence"

**Enabled Features:**
- Products-specific rate calculations
- Uses columns AP-AQ for Products calculations

**Disabled Features:**
- Subline (H) - not used
- Location Number (G) - not used
- Liquor options - not available

**Calculation Logic:**
- Modified Premium (U) = MAX(Technical Premium (S), Products Calculation (AP))
- Products-specific rate factors apply
- Different exposure base calculations

**Column Visibility:**
- Standard rate columns active
- Columns AP-AQ used for Products calculations
- No Liquor-related columns

### 4. When PL_2 = "Other"

**Enabled Features:**
- Simplest calculation mode
- No special modifications

**Disabled Features:**
- Subline (H) - not used
- Location Number (G) - not used
- Liquor options - not available
- No minimum premium adjustments

**Calculation Logic:**
- Modified Premium (U) = Technical Premium (S)
- Standard rates apply without modifications
- No special calculations

**Column Visibility:**
- Only basic rate columns active
- No special calculation columns

## Validation Rules and Error Messages

### Field-Level Validations:

1. **Policy Effective Date Required**
   - If empty, many calculations return 0
   - Error prevention: Most formulas check `IF(pol_eff_dt="",0,...)`

2. **Class Code Dependencies**
   - Class Code must exist in 'Class Codes' sheet for lookups to work
   - Description auto-populates if code is valid

3. **Subline Requirements (General Liability only)**
   - Error: "Enter Subline" - when Class Code entered but Subline empty
   - Error: "Enter Location Number" - when Subline entered but Location empty

4. **Data Type Validations**
   - Numeric fields: Must be positive numbers
   - Dropdown fields: Must select from provided list
   - Date fields: Must be valid dates

## Calculation Flow

### Rate Calculation Sequence:

1. **Base Rate Lookup**
   - VLOOKUP from 'Class Codes' sheet using Class Code
   - Different columns used based on exposure type

2. **Exposure Calculation**
   - Rate × (Exposures / Exposure Base Factor)
   - Factor typically 100 or 1000 depending on class

3. **PremOps/Liquor Split (General Liability only)**
   - If Subline = "Prem/Ops": Standard calculation
   - If Subline = "Liquor Liability": Apply Liquor factors

4. **Technical Premium**
   - Sum of PremOps Premium + Products Premium
   - Column S aggregates the components

5. **Modified Premium**
   - Column U applies final modifications based on PL_2:
     - Contractors: MAX(Technical, Contractors Min)
     - Products: MAX(Technical, Products Min)
     - General Liability: Special Liquor adjustments if applicable
     - Other: No modification (Technical = Modified)

## Hidden Columns and Background Calculations

### Support Columns (Not visible to user but critical for calculations):

- **Columns AI-AJ**: Contractors minimum premium calculations
- **Columns AP-AQ**: Products Liability calculations
- **Columns AS+**: Various VLOOKUP results and intermediate calculations
- **Named Ranges**: PL_2 (refers to C6), pol_eff_dt (policy effective date)

## VBA Macros

The workbook contains VBA macros (xl/vbaProject.bin) that may:
- Handle worksheet change events
- Perform additional validations
- Update dependent fields automatically
- Control dropdown list population

## Implementation Notes for Web Application

### Critical Behaviors to Replicate:

1. **PL_2 Selection is Primary Control**
   - Must trigger immediate UI updates
   - Enable/disable appropriate fields
   - Update column headers dynamically

2. **Field Interdependencies**
   - Implement cascading validations
   - Show inline error messages like Excel
   - Prevent invalid data entry combinations

3. **Calculation Engine**
   - Replicate all Excel formulas in JavaScript/TypeScript
   - Maintain calculation sequence integrity
   - Handle circular reference prevention

4. **State Management**
   - Track which fields are enabled/disabled per PL_2 selection
   - Maintain validation state for each row
   - Calculate totals and summaries in real-time

5. **Data Validation**
   - Implement all dropdown lists with exact values
   - Enforce numeric constraints
   - Provide helpful error messages

### UI/UX Considerations:

1. **Visual Feedback**
   - Beige (#FFF4F2EB) for input fields
   - White for calculated fields
   - Gray/disabled for non-applicable fields based on PL_2

2. **Dynamic Visibility**
   - Hide/show columns based on PL_2 selection
   - Update headers in real-time
   - Disable fields that don't apply

3. **Performance**
   - Lazy load class code list (1,184 items)
   - Debounce calculations on rapid input
   - Cache VLOOKUP results

## Testing Scenarios

### Test Case 1: General Liability with Liquor
1. Select PL_2 = "General Liability"
2. Enter Class Code
3. Verify Subline dropdown appears
4. Select "Liquor Liability"
5. Verify Liquor Limit dropdown appears
6. Verify calculations use Liquor rates

### Test Case 2: Contractors Mode
1. Select PL_2 = "Contractors"
2. Enter Class Code and Exposures
3. Verify Subline fields are disabled
4. Verify Modified Premium uses MAX logic
5. Check Contractors calculations in effect

### Test Case 3: Field Validation
1. Leave Policy Effective Date empty
2. Verify calculations show 0 or appropriate errors
3. Enter Class Code without Subline (GL mode)
4. Verify "Enter Subline" error appears

### Test Case 4: Products Liability
1. Select PL_2 = "Products Liability - Occurrence"
2. Enter multiple class codes
3. Verify Products calculations apply
4. Check Modified Premium logic

### Test Case 5: Other Mode
1. Select PL_2 = "Other"
2. Enter data
3. Verify simplest calculation path
4. Confirm Modified = Technical Premium

## Summary

The Exposure Rating tab is a sophisticated insurance rating calculator with multiple modes of operation controlled primarily by the PL_2 dropdown. The most complex mode is "General Liability" which enables Liquor Liability sub-ratings, while "Contractors" and "Products Liability" apply different minimum premium rules. The "Other" option provides the simplest calculation path.

Key implementation challenges include:
- Replicating complex conditional formulas
- Managing field interdependencies
- Dynamic UI updates based on dropdown selections
- Maintaining calculation accuracy across all scenarios

The web application must carefully replicate these behaviors to ensure accurate premium calculations and a familiar user experience for underwriters transitioning from the Excel workbook.
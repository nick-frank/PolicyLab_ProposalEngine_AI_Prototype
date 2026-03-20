# Experience Modifier Tab - Business Rules and Requirements

## Overview
The Experience Modifier tab calculates an experience modification factor based on historical loss data. This modifier adjusts insurance premiums based on a company's actual loss experience compared to expected losses. The calculation uses industry-standard credibility weighting to balance actual experience against expected experience.

## Input Fields (Beige Color: #FFF4F2EB)

### Configuration Section (Rows 4-6)

1. **Evaluation Date of Loss Run (D4)**
   - Type: Date input
   - Purpose: Sets the evaluation date for loss data
   - Background: Default (not beige in current state, may be optional)
   - Used for: Determining which losses to include in calculation

2. **Policy Year 1 (F5)**
   - Type: Year input
   - Purpose: First policy year to include in experience
   - Background: Default (may be optional)
   - Validation: Must be consistent with losses entered

3. **Policy Year 2 (G5)**
   - Type: Year input
   - Purpose: Second policy year to include in experience
   - Background: Beige (input field)
   - Validation: Formula in H5 checks consistency with loss dates
   - Error message: "***Year entered not consistent with losses entered" if dates don't match

4. **Experience Modifier Value (F6)**
   - Type: Display/Override field
   - Default: 1.00 (unity modifier)
   - Formula (G6): `=IF(OR(G4="",G5=""),1,AC17)`
   - Logic: Shows 1.00 if no data entered, otherwise shows calculated modifier from AC17

### Loss Detail Table (Rows 11-60)

The main data entry area where users input historical loss information. Each row can contain one loss occurrence.

#### Input Columns (All Beige Background):

1. **Date of Loss (Column B, rows 11-60)**
   - Type: Date input
   - Format: MM/DD/YYYY
   - Purpose: Date when loss occurred
   - Used for: Determining policy period and age of loss

2. **Ground-Up Indemnity (Column C, rows 11-60)**
   - Type: Currency input
   - Purpose: Total indemnity payment before deductibles
   - Validation: Must be non-negative number
   - Used in: Calculating total incurred and deductible application

3. **Ground-Up Expense (Column D, rows 11-60)**
   - Type: Currency input
   - Purpose: Total expense/allocated loss adjustment expense
   - Validation: Must be non-negative number
   - Note: Expenses are not reduced by deductible

#### Calculated Columns (White Background):

4. **Ground-Up Total Incurred (Column E)**
   - Formula: `=C[row]+D[row]`
   - Purpose: Sum of indemnity and expense

5. **Indemnity Less Deductible (Column F)**
   - Formula: `=IFERROR(MAX(C[row]-SIR_ded_amt,0),0)`
   - Purpose: Applies deductible to indemnity only
   - Links to: SIR_ded_amt from Exposure Rating tab
   - Logic: Indemnity minus deductible, minimum of 0

6. **Includable Losses (Column G)**
   - Formula: `=IFERROR(MIN(MIN(IF(F[row]="",0,F[row]),100000)+IF(D[row]="",0,D[row]),$AC$15),0)`
   - Purpose: Capped loss amount for experience rating
   - Components:
     - Indemnity (after deductible) capped at $100,000
     - Plus full expense amount
     - Total capped at Maximum Single Loss (AC15)

7. **Policy Period (Column H)**
   - Formula: `=IF(B[row]="","",VLOOKUP($B[row],$M$11:$N$32,2,TRUE))`
   - Purpose: Determines which policy year the loss belongs to
   - Uses: Lookup table in columns M-N

## Calculation Areas

### Policy Period Lookup Table (Columns M-N, Rows 11-32)

Hidden helper columns that determine policy periods based on loss dates:

- **Column M**: Policy period start dates (calculated)
  - Formula pattern: `=DATEVALUE(MONTH(M[row+2])&"/"&DAY(M[row+2])&"/"&(YEAR(M[row+2])-1))`
  - Creates a rolling series of policy periods

- **Column N**: Policy year numbers
  - Formula: `=YEAR(M[row])`
  - Extracts year from policy period date

### Experience Rating Factors (Columns V-AC)

Complex calculation area that determines:

1. **Basic Limits Loss Cost by Policy Period**
   - Column V: Loss cost factors by year
   - Adjusted for age, coverage, and trend factors

2. **Subject Loss Cost (AC12)**
   - Formula: `=IF(O29<18,SUM(V23:V28),SUM(V25:V30))`
   - Logic: Different year ranges based on policy age
   - This is the expected loss amount for the risk

3. **Credibility Factor (AC13)**
   - Formula: `=XLOOKUP(AC12,'Experience Mod Tables'!D7:D104,'Experience Mod Tables'!E7:E104,,1)`
   - Purpose: Weight given to actual experience vs. expected
   - Range: 0.03 to 1.00 based on subject loss cost
   - Higher expected losses = higher credibility

4. **Expected Experience Ratio (AC14)**
   - Lookup from Experience Mod Tables based on subject loss cost
   - Represents industry average loss ratio
   - Typically ranges from 0.705 to 0.95+

5. **Maximum Single Loss (AC15)**
   - Formula: Complex VLOOKUP from Experience Mod Tables
   - Purpose: Cap for individual losses in experience rating
   - Prevents single large loss from distorting experience
   - Typically ranges from $63,850 to $200,000+

6. **Actual Experience Ratio (AC16)**
   - Formula: `=(AC11+Y34)/V34`
   - Numerator: Total includable losses plus adjustments
   - Denominator: Total expected losses

7. **Experience Modification Factor (AC17)**
   - Formula: `=IFERROR((AC16-AC14)*AC13/AC14+1,1)`
   - Components:
     - (Actual Ratio - Expected Ratio) × Credibility ÷ Expected Ratio + 1
     - Default to 1.00 if calculation error
   - This is the final modifier applied to premium

## Links to Other Tabs

### From Exposure Rating Tab:
- **SIR_ded_amt**: SIR/Deductible amount from policy details
- **pol_eff_dt**: Policy effective date (may be used in date calculations)

### From Experience Mod Tables Tab:
- Credibility factors (Column E)
- Expected experience ratios (Column F)
- Maximum single loss values (Column G)
- Lookup ranges based on expected loss amounts

## Business Rules

### 1. Loss Inclusion Rules
- Only losses within specified policy periods are included
- Losses must have valid dates to be counted
- Empty rows are ignored in calculations

### 2. Deductible Application
- Deductible applies only to indemnity, not expenses
- Formula ensures result is never negative
- Links dynamically to current deductible amount

### 3. Loss Capping
- Individual indemnity amounts capped at $100,000 (after deductible)
- Total includable loss (indemnity + expense) capped at Maximum Single Loss
- Capping prevents large losses from over-influencing modifier

### 4. Credibility Weighting
- Low expected losses = low credibility (0.03-0.10)
- Medium expected losses = moderate credibility (0.10-0.50)
- High expected losses = high credibility (0.50-1.00)
- Credibility determines how much actual experience affects modifier

### 5. Experience Modifier Bounds
- Minimum modifier: Typically around 0.60 (40% discount)
- Unity modifier: 1.00 (no change from manual rate)
- Maximum modifier: Can exceed 2.00 (100%+ surcharge)
- Default: 1.00 if insufficient data

## Validation Rules

### 1. Date Validations
- Loss dates must be valid dates
- Policy years must be consistent with loss dates
- Warning displayed if mismatch detected

### 2. Numeric Validations
- All currency fields must be non-negative
- Indemnity and expense can be zero but not negative
- Calculations handle empty cells as zero

### 3. Calculation Safeguards
- IFERROR functions prevent calculation errors from displaying
- Division by zero handled gracefully
- Missing data defaults to unity modifier (1.00)

## Calculation Flow

### Step 1: Data Entry
1. User enters evaluation date and policy years
2. User enters individual losses with dates and amounts
3. System validates date consistency

### Step 2: Loss Processing
1. Apply deductible to indemnity amounts
2. Calculate total incurred for each loss
3. Determine policy period for each loss
4. Cap losses at individual and aggregate limits

### Step 3: Experience Calculation
1. Sum all includable losses (AC11)
2. Calculate subject loss cost based on exposure (AC12)
3. Look up credibility factor (AC13)
4. Look up expected experience ratio (AC14)
5. Calculate actual experience ratio (AC16)

### Step 4: Modifier Calculation
1. Apply credibility-weighted formula
2. Result = (Actual - Expected) × Credibility ÷ Expected + 1
3. Display final modifier in F6

## Experience Mod Tables Structure

The Experience Mod Tables sheet contains a lookup table with the following columns:

1. **Column B-D**: Expected loss ranges
   - Format: "Lower Bound - Upper Bound"
   - Example: "9,056 - 12,809"

2. **Column E**: Credibility factors
   - Range: 0.03 to 1.00
   - Increases with expected losses

3. **Column F**: Expected experience ratios
   - Range: ~0.705 to 0.95+
   - Industry average loss ratios

4. **Column G**: Maximum single loss values
   - Range: $63,850 to $200,000+
   - Loss capping thresholds

## Implementation Notes for Web Application

### Critical Features to Implement:

1. **Dynamic Loss Table**
   - Support up to 50 loss entries
   - Auto-calculate totals as data entered
   - Handle empty rows gracefully

2. **Real-time Validation**
   - Check date consistency
   - Validate numeric inputs
   - Display inline error messages

3. **Calculation Engine**
   - Implement all formulas in JavaScript/TypeScript
   - Maintain calculation sequence
   - Cache intermediate results for performance

4. **Lookup Tables**
   - Store credibility table in application
   - Implement VLOOKUP/XLOOKUP equivalents
   - Handle edge cases in lookups

### UI/UX Considerations:

1. **Visual Design**
   - Beige (#FFF4F2EB) for input fields
   - White for calculated fields
   - Clear distinction between input and output

2. **Data Entry**
   - Date pickers for date fields
   - Currency formatting for amounts
   - Tab order optimized for data entry

3. **Results Display**
   - Prominent display of final modifier
   - Show calculation details on demand
   - Indicate when default modifier applied

## Testing Scenarios

### Test Case 1: No Loss History
- Enter no losses
- Verify modifier defaults to 1.00
- Check that no errors displayed

### Test Case 2: Single Small Loss
- Enter one loss under deductible
- Verify deductible applied correctly
- Check modifier calculation

### Test Case 3: Multiple Losses
- Enter losses across multiple years
- Verify policy period assignment
- Check total calculations

### Test Case 4: Large Loss Capping
- Enter loss over $100,000
- Verify indemnity capping at $100,000
- Check maximum single loss cap applied

### Test Case 5: Date Validation
- Enter inconsistent policy years
- Verify warning message appears
- Check calculation still proceeds

### Test Case 6: Full Experience
- Enter 20+ losses over 3+ years
- Verify all calculations correct
- Check credibility weighting appropriate

## Summary

The Experience Modifier tab implements a sophisticated actuarial calculation that balances a company's actual loss experience against industry expectations. The modifier directly impacts premium calculations, providing discounts for better-than-average experience or surcharges for worse-than-average experience.

Key implementation challenges include:
- Accurate replication of credibility tables
- Proper application of loss capping rules
- Maintaining linkage to Exposure Rating tab values
- Handling edge cases in date calculations
- Providing clear feedback on calculation status

The web application must carefully implement these calculations to ensure accurate experience modification factors that align with insurance industry standards.
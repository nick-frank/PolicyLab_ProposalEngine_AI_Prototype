# Manual Testing Checklist - MklQuote_Txn9163632

This checklist verifies the GL Primary Rater application works correctly with the data from MklQuote_Txn9163632.

## Test Data from PDF

### Policy Level Details
- **Insured**: ABC Construction Co.
- **Deal Number**: Txn9163632
- **PL_2**: Contractors
- **Territory**: CA-01
- **Policy Period**: 03/03/2026 - 03/03/2027
- **Occurrence Limit**: $1,000,000
- **Aggregate Limit**: $2,000,000
- **SIR Type**: SIR
- **SIR Amount**: $2,500
- **Commission**: 15%

### Sales (for Contractors)
- **New/Renewal Sales**: $8,000,000
- **Expiring Sales**: $7,500,000

### Class & Territory Details
#### Class 1:
- **Class Code**: 10026
- **Description**: Commercial Construction
- **Location**: 001
- **Exposure**: $5,000,000
- **Exposure Basis**: Sales
- **PremOps Rate**: 1.25
- **Expected Premium**: $6,250

#### Class 2:
- **Class Code**: 10033
- **Description**: Residential Construction
- **Location**: 002
- **Exposure**: $3,000,000
- **Exposure Basis**: Sales
- **PremOps Rate**: 1.50
- **Expected Premium**: $4,500

### Experience Modifier
- **Evaluation Date**: 01/01/2024
- **Experience Modifier**: 1.15
- **Loss 1**: Date: 06/15/2023, Indemnity: $25,000, Expense: $5,000
- **Loss 2**: Date: 11/20/2022, Indemnity: $15,000, Expense: $3,000

### Expected Calculations
- **Total Exposure**: $8,000,000
- **Technical Premium (pre-emod)**: $10,750
- **Experience Modifier**: 1.15
- **Technical Premium (post-emod)**: $12,362.50

---

## Testing Steps

### 1. Initial Setup ✓
- [ ] Navigate to http://localhost:3000/rating/primary-gl-rater
- [ ] Verify page loads with "Primary GL Rater" title
- [ ] Verify three tabs are visible: Exposure Rating, Experience Modifier, UW Notes

### 2. Policy Details Entry ✓
- [ ] Enter "ABC Construction Co." in Insured field
- [ ] Select "Contractors" from PL_2 dropdown
- [ ] Enter "CA-01" in Territory field
- [ ] Select "SIR" from SIR Type dropdown
- [ ] Enter commission as 15% (if field exists)
- [ ] **VERIFY**: Sales section becomes visible when Contractors is selected

### 3. Sales Information ✓
- [ ] Enter $8,000,000 in New/Renewal Sales
- [ ] Enter $7,500,000 in Expiring Sales
- [ ] **VERIFY**: Fields accept numeric input and format correctly

### 4. Class Code Entry ✓
- [ ] Enter class code "10026" in first row
- [ ] **VERIFY**: Description auto-populates or can be entered
- [ ] Enter location "001"
- [ ] Enter exposure "$5,000,000"
- [ ] Enter rate "1.25" if manual rate field exists
- [ ] Repeat for class code "10033" with respective data
- [ ] **VERIFY**: Premium calculations appear if shown

### 5. Experience Modifier Tab ✓
- [ ] Click on "Experience Modifier" tab
- [ ] Enter evaluation date "01/01/2024"
- [ ] Enter modifier value "1.15" if input exists
- [ ] Add losses if form supports it
- [ ] **VERIFY**: Tab switches correctly and data persists

### 6. UW Notes Tab ✓
- [ ] Click on "UW Notes" tab
- [ ] Enter comprehensive notes about the quote
- [ ] **VERIFY**: Notes are saved when switching tabs

### 7. Quote Calculation ✓
- [ ] Return to "Exposure Rating" tab
- [ ] Click "Calculate" button
- [ ] **VERIFY**: Success toast appears with premium amount
- [ ] **VERIFY**: Technical Premium shows approximately $12,362.50
- [ ] **VERIFY**: No validation errors appear

### 8. Save Quote ✓
- [ ] Click "Save" button
- [ ] **VERIFY**: Success toast appears with quote ID
- [ ] **VERIFY**: Quote ID is displayed in toast message
- [ ] Note the quote ID for later reference

### 9. Export to Excel ✓
- [ ] Click "Export" button (Excel icon)
- [ ] **VERIFY**: File downloads with .xlsx extension
- [ ] **VERIFY**: Success toast appears
- [ ] Open the Excel file and verify:
  - [ ] Exposure Rating sheet contains all policy details
  - [ ] Class rows are correctly populated
  - [ ] Experience Modifier sheet exists
  - [ ] UW Notes sheet contains the notes

### 10. Export to JSON ✓
- [ ] Click "Export JSON" button
- [ ] **VERIFY**: File downloads with .json extension
- [ ] **VERIFY**: JSON contains all entered data

### 11. Quote History ✓
- [ ] Click "History" button or navigate to history page
- [ ] **VERIFY**: Quote appears in the list
- [ ] **VERIFY**: Shows correct insured name "ABC Construction Co."
- [ ] **VERIFY**: Shows PL2 as "Contractors"
- [ ] **VERIFY**: Shows territory as "CA-01"
- [ ] **VERIFY**: Shows status (draft/calculated)
- [ ] **VERIFY**: Shows premium if calculated

### 12. Load from History ✓
- [ ] Click eye icon to view quote
- [ ] **VERIFY**: Returns to rating form
- [ ] **VERIFY**: All fields are populated with saved data
- [ ] **VERIFY**: Insured name is "ABC Construction Co."
- [ ] **VERIFY**: PL2 is "Contractors"
- [ ] **VERIFY**: Sales values are correct
- [ ] **VERIFY**: Class codes are loaded

### 13. Delete from History ✓
- [ ] Return to history page
- [ ] Click trash icon on the quote
- [ ] Confirm deletion
- [ ] **VERIFY**: Success toast appears
- [ ] **VERIFY**: Quote is removed from list

### 14. Import Test ✓
- [ ] Click "Import" button on rating page
- [ ] Select the previously exported Excel file
- [ ] **VERIFY**: Success toast appears
- [ ] **VERIFY**: All fields are populated correctly
- [ ] **VERIFY**: Can calculate with imported data

### 15. Error Handling ✓
- [ ] Try to calculate without required fields
- [ ] **VERIFY**: Error messages appear
- [ ] Try to import invalid file
- [ ] **VERIFY**: Error toast appears with helpful message
- [ ] Try to save without insured name
- [ ] **VERIFY**: Appropriate validation message appears

---

## Test Results Summary

- **Date Tested**: _________________
- **Tested By**: _________________
- **Version**: _________________

### Overall Results:
- [ ] All tests passed
- [ ] Some tests failed (list below)
- [ ] Blocked by issues (list below)

### Issues Found:
1. _________________________________
2. _________________________________
3. _________________________________

### Notes:
_____________________________________
_____________________________________
_____________________________________

---

## Additional Verification

### Performance
- [ ] Page loads quickly (< 3 seconds)
- [ ] Calculations complete quickly (< 2 seconds)
- [ ] No console errors in browser
- [ ] UI remains responsive during operations

### User Experience
- [ ] Toast notifications are clear and helpful
- [ ] Loading states are visible during operations
- [ ] Tab navigation works smoothly
- [ ] Form validation is helpful not frustrating
- [ ] Excel export opens correctly in Excel/Google Sheets

### Data Persistence
- [ ] Data persists when switching tabs
- [ ] Quote saves to local storage
- [ ] Quote loads correctly from history
- [ ] Excel import preserves all data
- [ ] JSON import preserves all data
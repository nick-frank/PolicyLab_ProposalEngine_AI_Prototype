import { test, expect } from '@playwright/test';

test.describe('Primary GL Rater - Exposure Rating Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Primary GL Rater")');
  });

  test('should have correct PL2 dropdown options', async ({ page }) => {
    // Find the PL_2 dropdown
    const pl2Dropdown = page.locator('select').first();

    // Get all options
    const options = await pl2Dropdown.locator('option').allTextContents();

    // Verify correct options exist
    expect(options).toContain('Contractors');
    expect(options).toContain('General Liability');
    expect(options).toContain('Products Liability - Occurrence');
    expect(options).toContain('Other');

    // Verify no old options exist
    expect(options).not.toContain('Commercial Wholesale Primary');
    expect(options).not.toContain('Commercial Wholesale Excess');
    expect(options).not.toContain('Commercial Retail Excess');
    expect(options).not.toContain('Environmental');
  });

  test('should have Territory field after PL_2', async ({ page }) => {
    // Check that Territory field exists
    const territoryLabel = page.locator('label:has-text("Territory:")');
    await expect(territoryLabel).toBeVisible();

    const territoryInput = territoryLabel.locator('..').locator('input');
    await expect(territoryInput).toBeVisible();
    await expect(territoryInput).toHaveClass(/bg-\[#FFF4F2EB\]/);
  });

  test('should have beige background for SIR/Deductible dropdowns', async ({ page }) => {
    // Find SIR/Deductible dropdowns
    const sirDropdowns = page.locator('select').filter({ hasText: /Deductible|SIR/ });

    // Check first dropdown has beige background
    const firstDropdown = sirDropdowns.first();
    await expect(firstDropdown).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Check second dropdown has beige background
    const secondDropdown = sirDropdowns.nth(1);
    await expect(secondDropdown).toHaveClass(/bg-\[#FFF4F2EB\]/);
  });

  test('should have beige background for limit fields', async ({ page }) => {
    // Check Each Occurrence Limit
    const occurrenceLimitInputs = page.locator('label:has-text("Each Occurrence Limit:")').locator('..').locator('input');
    const firstOccurrenceInput = occurrenceLimitInputs.first();
    await expect(firstOccurrenceInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Check General Aggregate Limit
    const aggregateLimitInputs = page.locator('label:has-text("General Aggregate Limit:")').locator('..').locator('input');
    const firstAggregateInput = aggregateLimitInputs.first();
    await expect(firstAggregateInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Check SIR/Ded Amount
    const dedAmountInputs = page.locator('label:has-text("SIR/Ded Amount:")').locator('..').locator('input');
    const firstDedAmount = dedAmountInputs.first();
    await expect(firstDedAmount).toHaveClass(/bg-\[#FFF4F2EB\]/);
  });

  test.describe('General Liability Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Select General Liability
      const pl2Dropdown = page.locator('select').first();
      await pl2Dropdown.selectOption('General Liability');
      await page.waitForTimeout(500); // Wait for UI to update
    });

    test('should show additional columns when General Liability is selected', async ({ page }) => {
      // Check for Location Number header
      const locationHeader = page.locator('th:has-text("Location Number")');
      await expect(locationHeader).toBeVisible();

      // Check for Subline header
      const sublineHeader = page.locator('th:has-text("Subline")');
      await expect(sublineHeader).toBeVisible();

      // Check for Dominant Class Indicator header
      const dominantHeader = page.locator('th:has-text("Dominant Class Indicator")');
      await expect(dominantHeader).toBeVisible();

      // Check for Liquor Liability Limit header
      const liquorHeader = page.locator('th:has-text("Liquor Liability Limit")');
      await expect(liquorHeader).toBeVisible();
    });

    test('should change column headers for General Liability', async ({ page }) => {
      // Check PremOps Rate header changes
      const premOpsRateHeader = page.locator('th:has-text("PremOps / Liquor Rate")');
      await expect(premOpsRateHeader).toBeVisible();

      // Check PremOps Prem header changes
      const premOpsPremHeader = page.locator('th:has-text("PremOps / Liquor Prem")');
      await expect(premOpsPremHeader).toBeVisible();

      // Verify old headers don't exist
      await expect(page.locator('th:has-text("PremOps Rate"):not(:has-text("Liquor"))')).not.toBeVisible();
      await expect(page.locator('th:has-text("PremOps Prem"):not(:has-text("Liquor"))')).not.toBeVisible();
    });

    test('should have correct Subline dropdown options', async ({ page }) => {
      // Find first Subline dropdown in the table
      const sublineDropdown = page.locator('select').filter({ hasText: /Select Subline|Prem\/Ops|Liquor Liability/ }).first();
      await sublineDropdown.click();

      const options = await sublineDropdown.locator('option').allTextContents();
      expect(options).toContain('Select Subline');
      expect(options).toContain('Prem/Ops');
      expect(options).toContain('Liquor Liability');

      // Should not have old values
      expect(options).not.toContain('PremOps');
      expect(options).not.toContain('Products');
    });

    test('should show validation message when class code entered without subline', async ({ page }) => {
      // Wait for the table to be ready
      await page.waitForSelector('tbody tr:first-child');

      // Click on the class code dropdown in the first row
      const classCodeDropdown = page.locator('tbody tr:first-child').locator('div:has-text("Select class code...")').first();
      await classCodeDropdown.click();

      // Wait for and fill the search input
      const searchInput = page.locator('input[placeholder="Type to search..."]');
      await searchInput.waitFor({ state: 'visible' });
      await searchInput.fill('10026');

      // Wait for results and select the first one
      await page.waitForSelector('.hover\\:bg-blue-50');
      await page.locator('.hover\\:bg-blue-50').first().click();

      // Wait a moment for validation
      await page.waitForTimeout(500);

      // Check for validation message
      const validationMsg = page.locator('span:has-text("Enter Subline")').first();
      await expect(validationMsg).toBeVisible();
    });

    test('should show validation message when subline entered without location number', async ({ page }) => {
      // Wait for the table to be ready
      await page.waitForSelector('tbody tr:first-child');

      // Click on the class code dropdown in the first row
      const classCodeDropdown = page.locator('tbody tr:first-child').locator('div:has-text("Select class code...")').first();
      await classCodeDropdown.click();

      // Wait for and fill the search input
      const searchInput = page.locator('input[placeholder="Type to search..."]');
      await searchInput.waitFor({ state: 'visible' });
      await searchInput.fill('10026');

      // Wait for results and select the first one
      await page.waitForSelector('.hover\\:bg-blue-50');
      await page.locator('.hover\\:bg-blue-50').first().click();

      // Select a subline
      const sublineDropdown = page.locator('select').filter({ hasText: /Select Subline|Prem\/Ops|Liquor Liability/ }).first();
      await sublineDropdown.selectOption('Prem/Ops');

      // Wait a moment for validation
      await page.waitForTimeout(500);

      // Check for validation message
      const validationMsg = page.locator('span:has-text("Enter Location Number")').first();
      await expect(validationMsg).toBeVisible();
    });

    test('should enable Liquor Liability Limit only when Liquor Liability subline selected', async ({ page }) => {
      // Find first row's liquor limit dropdown
      const liquorDropdown = page.locator('select').filter({ hasText: /100K|300K|500K|1M/ }).first();

      // Initially should be disabled
      await expect(liquorDropdown).toBeDisabled();

      // Select Liquor Liability subline
      const sublineDropdown = page.locator('select').filter({ hasText: /Select Subline|Prem\/Ops|Liquor Liability/ }).first();
      await sublineDropdown.selectOption('Liquor Liability');

      // Now liquor dropdown should be enabled
      await expect(liquorDropdown).toBeEnabled();

      // Verify options
      const options = await liquorDropdown.locator('option').allTextContents();
      expect(options).toContain('100K/100K');
      expect(options).toContain('300K/300K');
      expect(options).toContain('500K/500K');
      expect(options).toContain('1M/1M');
      expect(options).toContain('1M/2M');
    });

    test('should enable Dominant Class Indicator when subline is selected', async ({ page }) => {
      // Find dominant class dropdown
      const dominantDropdown = page.locator('select').filter({ hasText: /Prem\/Ops Dominant Class|Liquor Liability Dominant Class/ }).first();

      // Initially should be disabled
      await expect(dominantDropdown).toBeDisabled();

      // Select a subline
      const sublineDropdown = page.locator('select').filter({ hasText: /Select Subline|Prem\/Ops|Liquor Liability/ }).first();
      await sublineDropdown.selectOption('Prem/Ops');

      // Now dominant dropdown should be enabled
      await expect(dominantDropdown).toBeEnabled();

      // Verify options
      const options = await dominantDropdown.locator('option').allTextContents();
      expect(options).toContain('Prem/Ops Dominant Class');
      expect(options).toContain('Liquor Liability Dominant Class');
    });

    test('should hide Sales section for General Liability', async ({ page }) => {
      // Check that Sales label is NOT visible
      await expect(page.locator('label:has-text("Sales:")')).not.toBeVisible();

      // Check that Sales input fields are NOT visible
      await expect(page.locator('input[placeholder="New/Renewal"]')).not.toBeVisible();
      await expect(page.locator('input[placeholder="Expiring"]')).not.toBeVisible();

      // Check that composite rate fields related to Sales are NOT visible
      await expect(page.locator('text=/Tech Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Calculated Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Bound Composite Rate.*per \\$1000/')).not.toBeVisible();
    });
  });

  test.describe('Contractors Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Select Contractors
      const pl2Dropdown = page.locator('select').first();
      await pl2Dropdown.selectOption('Contractors');
      await page.waitForTimeout(500);
    });

    test('should hide General Liability specific columns', async ({ page }) => {
      // Check that GL-specific columns are hidden
      await expect(page.locator('th:has-text("Location Number")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Subline")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Dominant Class Indicator")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Liquor Liability Limit")')).not.toBeVisible();
    });

    test('should show standard column headers for Contractors', async ({ page }) => {
      // Check PremOps Rate header (without Liquor)
      const premOpsRateHeader = page.locator('th').filter({ hasText: /^PremOps Rate$/ });
      await expect(premOpsRateHeader).toBeVisible();

      // Check PremOps Prem header (without Liquor)
      const premOpsPremHeader = page.locator('th').filter({ hasText: /^PremOps Prem$/ });
      await expect(premOpsPremHeader).toBeVisible();

      // Verify Liquor headers don't exist
      await expect(page.locator('th:has-text("PremOps / Liquor Rate")')).not.toBeVisible();
      await expect(page.locator('th:has-text("PremOps / Liquor Prem")')).not.toBeVisible();
    });

    test('should not show validation messages for subline or location', async ({ page }) => {
      // Wait for the table to be ready
      await page.waitForSelector('tbody tr:first-child');

      // Click on the class code dropdown in the first row
      const classCodeDropdown = page.locator('tbody tr:first-child').locator('div:has-text("Select class code...")').first();
      await classCodeDropdown.click();

      // Wait for and fill the search input
      const searchInput = page.locator('input[placeholder="Type to search..."]');
      await searchInput.waitFor({ state: 'visible' });
      await searchInput.fill('10026');

      // Wait for results and select the first one
      await page.waitForSelector('.hover\\:bg-blue-50');
      await page.locator('.hover\\:bg-blue-50').first().click();

      // Wait a moment
      await page.waitForTimeout(500);

      // Check that no validation messages appear
      await expect(page.locator('span:has-text("Enter Subline")')).not.toBeVisible();
      await expect(page.locator('span:has-text("Enter Location Number")')).not.toBeVisible();
    });

    test('should show Sales section for Contractors', async ({ page }) => {
      // Check that Sales label is visible
      await expect(page.locator('label:has-text("Sales:")')).toBeVisible();

      // Check that both Sales input fields are visible
      const salesInputs = page.locator('input[placeholder="New/Renewal"], input[placeholder="Expiring"]');
      await expect(salesInputs).toHaveCount(2);
      await expect(salesInputs.first()).toBeVisible();
      await expect(salesInputs.nth(1)).toBeVisible();

      // Check that composite rate fields are visible - be specific
      await expect(page.locator('label:has-text("Tech Composite Rate (pre-emod) per $1000:")')).toBeVisible();
      await expect(page.locator('label:has-text("Tech Composite Rate (post-emod) per $1000:")')).toBeVisible();
      await expect(page.locator('label:has-text("Calculated Composite Rate per $1000:")')).toBeVisible();
      await expect(page.locator('label:has-text("Bound Composite Rate per $1000:")')).toBeVisible();
    });
  });

  test.describe('Products Liability Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Select Products Liability
      const pl2Dropdown = page.locator('select').first();
      await pl2Dropdown.selectOption('Products Liability - Occurrence');
      await page.waitForTimeout(500);
    });

    test('should hide General Liability specific columns', async ({ page }) => {
      // Check that GL-specific columns are hidden
      await expect(page.locator('th:has-text("Location Number")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Subline")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Dominant Class Indicator")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Liquor Liability Limit")')).not.toBeVisible();
    });

    test('should show standard column headers', async ({ page }) => {
      // Check standard headers without Liquor
      const premOpsRateHeader = page.locator('th').filter({ hasText: /^PremOps Rate$/ });
      await expect(premOpsRateHeader).toBeVisible();

      const premOpsPremHeader = page.locator('th').filter({ hasText: /^PremOps Prem$/ });
      await expect(premOpsPremHeader).toBeVisible();
    });

    test('should hide Sales section for Products Liability', async ({ page }) => {
      // Check that Sales label is NOT visible
      await expect(page.locator('label:has-text("Sales:")')).not.toBeVisible();

      // Check that Sales input fields are NOT visible
      await expect(page.locator('input[placeholder="New/Renewal"]')).not.toBeVisible();
      await expect(page.locator('input[placeholder="Expiring"]')).not.toBeVisible();

      // Check that composite rate fields related to Sales are NOT visible
      await expect(page.locator('text=/Tech Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Calculated Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Bound Composite Rate.*per \\$1000/')).not.toBeVisible();
    });
  });

  test.describe('Other Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Default is Other, but let's explicitly select it
      const pl2Dropdown = page.locator('select').first();
      await pl2Dropdown.selectOption('Other');
      await page.waitForTimeout(500);
    });

    test('should hide General Liability specific columns', async ({ page }) => {
      // Check that GL-specific columns are hidden
      await expect(page.locator('th:has-text("Location Number")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Subline")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Dominant Class Indicator")')).not.toBeVisible();
      await expect(page.locator('th:has-text("Liquor Liability Limit")')).not.toBeVisible();
    });

    test('should show standard column headers', async ({ page }) => {
      // Check standard headers without Liquor
      const premOpsRateHeader = page.locator('th').filter({ hasText: /^PremOps Rate$/ });
      await expect(premOpsRateHeader).toBeVisible();

      const premOpsPremHeader = page.locator('th').filter({ hasText: /^PremOps Prem$/ });
      await expect(premOpsPremHeader).toBeVisible();
    });

    test('should hide Sales section for Other', async ({ page }) => {
      // Check that Sales label is NOT visible
      await expect(page.locator('label:has-text("Sales:")')).not.toBeVisible();

      // Check that Sales input fields are NOT visible
      await expect(page.locator('input[placeholder="New/Renewal"]')).not.toBeVisible();
      await expect(page.locator('input[placeholder="Expiring"]')).not.toBeVisible();

      // Check that composite rate fields related to Sales are NOT visible
      await expect(page.locator('text=/Tech Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Calculated Composite Rate.*per \\$1000/')).not.toBeVisible();
      await expect(page.locator('text=/Bound Composite Rate.*per \\$1000/')).not.toBeVisible();
    });
  });

  test.describe('Class Code Dropdown', () => {
    test('should show searchable class code dropdown', async ({ page }) => {
      // Wait for the table to be ready
      await page.waitForSelector('tbody tr:first-child');

      // Click on first class code field
      const classCodeField = page.locator('tbody tr:first-child').locator('div:has-text("Select class code...")').first();
      await classCodeField.click();

      // Search input should appear
      const searchInput = page.locator('input[placeholder="Type to search..."]');
      await searchInput.waitFor({ state: 'visible' });
      await expect(searchInput).toBeVisible();

      // Type a search term
      await searchInput.fill('Antique');

      // Wait for results to load
      await page.waitForTimeout(500);

      // Results should show
      await expect(page.locator('text=10026')).toBeVisible();
      await expect(page.locator('text=Antique Stores')).toBeVisible();
    });

    test('should populate description when class code selected', async ({ page }) => {
      // Wait for the table to be ready
      await page.waitForSelector('tbody tr:first-child');

      // Click on class code field
      const classCodeField = page.locator('tbody tr:first-child').locator('div:has-text("Select class code...")').first();
      await classCodeField.click();

      // Search and select
      const searchInput = page.locator('input[placeholder="Type to search..."]');
      await searchInput.waitFor({ state: 'visible' });
      await searchInput.fill('10026');

      // Wait for results and click on the first one
      await page.waitForSelector('.hover\\:bg-blue-50');
      await page.locator('.hover\\:bg-blue-50').first().click();

      // Check that description is populated
      const descriptionField = page.locator('input[value*="Antique"]').first();
      await expect(descriptionField).toBeVisible();
    });
  });
});

test.describe('Experience Modifier Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');
    // Switch to Experience Modifier tab
    await page.locator('button:has-text("Experience Modifier")').click();
    await page.waitForTimeout(500);
  });

  test('should show Experience Modifier tab content', async ({ page }) => {
    await expect(page.locator('h3:has-text("Experience Modifier Calculation")')).toBeVisible();
    await expect(page.locator('text=LOSS DETAIL')).toBeVisible();
  });

  test('should have correct input fields in Experience Modifier', async ({ page }) => {
    // Check Evaluation Date field
    const evalDateInput = page.locator('label:has-text("Evaluation Date of Loss Run:")').locator('..').locator('input[type="date"]');
    await expect(evalDateInput).toBeVisible();
    await expect(evalDateInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Check policy year fields
    const yearInputs = page.locator('input[placeholder*="Year"]');
    await expect(yearInputs).toHaveCount(2);

    // Year 1 should be white (not input)
    await expect(yearInputs.first()).toHaveClass(/bg-white/);

    // Year 2 should be beige (input)
    await expect(yearInputs.nth(1)).toHaveClass(/bg-\[#FFF4F2EB\]/);
  });

  test('should have loss detail table with correct columns', async ({ page }) => {
    // Check for all required columns
    await expect(page.locator('th:has-text("Date of Loss")')).toBeVisible();
    await expect(page.locator('th:has-text("Ground-Up Indemnity")')).toBeVisible();
    await expect(page.locator('th:has-text("Ground-Up Expense")')).toBeVisible();
    await expect(page.locator('th:has-text("Ground-Up Total Incurred")')).toBeVisible();
    await expect(page.locator('th:has-text("Indemnity Less Deductible")')).toBeVisible();
    await expect(page.locator('th:has-text("Includable Losses")')).toBeVisible();
    await expect(page.locator('th:has-text("Policy Period")')).toBeVisible();
  });

  test('should have beige input fields for loss data entry', async ({ page }) => {
    // Get first row of loss detail table
    const firstRow = page.locator('tbody tr').first();

    // Date of Loss should be beige input
    const dateInput = firstRow.locator('input[type="date"]');
    await expect(dateInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Ground-Up Indemnity should be beige input
    const indemnityInput = firstRow.locator('td:nth-child(2) input');
    await expect(indemnityInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Ground-Up Expense should be beige input
    const expenseInput = firstRow.locator('td:nth-child(3) input');
    await expect(expenseInput).toHaveClass(/bg-\[#FFF4F2EB\]/);

    // Total Incurred should be white (calculated)
    const totalInput = firstRow.locator('td:nth-child(4) input');
    await expect(totalInput).toHaveClass(/bg-white/);
    await expect(totalInput).toHaveAttribute('readonly');
  });
});

test.describe('UW Notes Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');
    // Switch to UW Notes tab
    await page.locator('button:has-text("UW Notes")').click();
    await page.waitForTimeout(500);
  });

  test('should show UW Notes tab content', async ({ page }) => {
    await expect(page.locator('h3:has-text("Primary General Liability - UW Notes")')).toBeVisible();
    await expect(page.locator('text=Please document your selections')).toBeVisible();
  });

  test('should have beige textarea for notes', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder="Enter underwriting notes..."]');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveClass(/bg-\[#FFF4F2EB\]/);
  });

  test('should have Clear Text button', async ({ page }) => {
    const clearButton = page.locator('button:has-text("Clear Text")');
    await expect(clearButton).toBeVisible();
  });
});

test.describe('Integration Tests', () => {
  test('should maintain state when switching tabs', async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');

    // Select General Liability
    const pl2Dropdown = page.locator('select').first();
    await pl2Dropdown.selectOption('General Liability');

    // Enter territory
    const territoryInput = page.locator('label:has-text("Territory:")').locator('..').locator('input');
    await territoryInput.fill('Test Territory');

    // Switch to Experience Modifier tab
    await page.locator('button:has-text("Experience Modifier")').click();
    await page.waitForTimeout(500);

    // Switch back to Exposure Rating
    await page.locator('button:has-text("Exposure Rating")').click();
    await page.waitForTimeout(500);

    // Check that PL2 is still General Liability
    const currentPL2 = await pl2Dropdown.inputValue();
    expect(currentPL2).toBe('General Liability');

    // Check that territory is preserved
    const currentTerritory = await territoryInput.inputValue();
    expect(currentTerritory).toBe('Test Territory');

    // Check that GL columns are still visible
    await expect(page.locator('th:has-text("Location Number")')).toBeVisible();
  });

  test('should handle multiple rows with different validations', async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');

    // Select General Liability
    const pl2Dropdown = page.locator('select').first();
    await pl2Dropdown.selectOption('General Liability');
    await page.waitForTimeout(500);

    // Wait for the table to be ready
    await page.waitForSelector('tbody tr:nth-child(2)');

    // Enter class code in first row
    const firstClassCodeDropdown = page.locator('tbody tr:nth-child(1)').locator('div:has-text("Select class code...")').first();
    await firstClassCodeDropdown.click();

    // Wait for search input and fill it
    let searchInput = page.locator('input[placeholder="Type to search..."]');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('10026');

    // Wait for results and click first one
    await page.waitForSelector('.hover\\:bg-blue-50');
    await page.locator('.hover\\:bg-blue-50').first().click();
    await page.waitForTimeout(500);

    // Enter class code in second row
    // Wait a bit for first dropdown to close
    await page.waitForTimeout(500);

    const secondClassCodeDropdown = page.locator('tbody tr:nth-child(2)').locator('div').filter({ hasText: /Select class code|10026/ }).first();
    await secondClassCodeDropdown.click();

    // Wait for search input again and fill it
    searchInput = page.locator('input[placeholder="Type to search..."]');
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill('10027');

    // Wait a moment for results to load
    await page.waitForTimeout(500);

    // Click on the visible result (there might be multiple results)
    const resultsDropdown = page.locator('.hover\\:bg-blue-50');
    const count = await resultsDropdown.count();
    if (count > 0) {
      await resultsDropdown.first().click();
    } else {
      // If no results, just press escape to close the dropdown
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500);

    // At least the first row should show validation for subline
    const validationMessages = page.locator('span:has-text("Enter Subline")');
    const msgCount = await validationMessages.count();
    expect(msgCount).toBeGreaterThanOrEqual(1); // At least one validation message should appear
  });
});
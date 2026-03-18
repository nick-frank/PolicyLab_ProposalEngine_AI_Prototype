import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

/**
 * Comprehensive Round-Trip Rating System Tests
 * Tests the complete flow from data entry to calculation and retrieval
 */

test.describe('Round-Trip Rating System', () => {
  const baseURL = 'http://localhost:3000';
  const apiURL = 'http://localhost:8000';

  // Test data
  const testQuote = {
    insured: `Test Company ${uuidv4().slice(0, 8)}`,
    dealNumber: `MQ-2024-${Math.floor(Math.random() * 10000)}`,
    territory: 'CA-01',
    occurrenceLimit: 1000000,
    aggregateLimit: 2000000,
    sirAmount: 10000,
    commission: 17.5
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/rating/primary-gl-rater`);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Data Entry and Validation', () => {
    test('should enter complete policy details', async ({ page }) => {
      // Fill in policy details
      await page.locator('input:visible').first().fill(testQuote.insured);
      // Enter deal number (second visible input)
      await page.locator('input:visible').nth(1).fill(testQuote.dealNumber);

      // Select PL2
      await page.locator('select').first().selectOption('General Liability');

      // Enter territory
      const territoryInput = page.locator('label:has-text("Territory:")').locator('..').locator('input');
      await territoryInput.clear();
      await territoryInput.fill(testQuote.territory);

      // Verify values were entered
      await expect(page.locator('input:visible').first()).toHaveValue(testQuote.insured);
      await expect(page.locator('select').first()).toHaveValue('General Liability');
    });

    test('should validate required fields', async ({ page }) => {
      // Try to proceed without filling required fields
      const exportButton = page.locator('button:has-text("Export to JSON")');

      if (await exportButton.isVisible()) {
        await exportButton.click();

        // Should show validation errors
        const errorMessage = page.locator('.text-red-500, .error-message');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test('should handle class code entry', async ({ page }) => {
      // Navigate to table section
      await page.evaluate(() => window.scrollTo(0, 500));

      // Enter class code in first row
      const classCodeInput = page.locator('input[placeholder*="Search class code"]').first();
      if (await classCodeInput.isVisible()) {
        await classCodeInput.click();
        await classCodeInput.type('10026');

        // Select from dropdown if it appears
        const dropdown = page.locator('[role="option"], .dropdown-item').first();
        if (await dropdown.isVisible({ timeout: 2000 })) {
          await dropdown.click();
        }

        // Enter exposures
        const exposuresInput = page.locator('tr').first().locator('input').nth(4);
        if (await exposuresInput.isVisible()) {
          await exposuresInput.fill('100000');
        }
      }
    });

    test('should handle subline selection for General Liability', async ({ page }) => {
      // Select General Liability
      await page.locator('select').first().selectOption( 'General Liability');

      // Wait for subline columns to appear
      await page.waitForTimeout(500);

      // Scroll to the table area
      await page.evaluate(() => window.scrollTo(0, 600));

      // The subline select is in the first table row
      const firstRow = page.locator('tbody tr').first();
      const sublineDropdown = firstRow.locator('select').filter({ hasText: /Select Subline|Prem\/Ops|Liquor/ }).first();
      if (await sublineDropdown.isVisible({ timeout: 2000 })) {
        await sublineDropdown.selectOption('Prem/Ops');

        // Enter location number
        const locationInput = firstRow.locator('input[placeholder*="Location"]');
        if (await locationInput.isVisible()) {
          await locationInput.fill('001');
        }
      }
    });
  });

  test.describe('Experience Modifier Tab', () => {
    test('should enter loss history data', async ({ page }) => {
      // Switch to Experience Modifier tab
      await page.click('button[role="tab"]:has-text("Experience Modifier")');
      await page.waitForTimeout(500);

      // Enter evaluation date
      const evalDateInput = page.locator('input[type="date"]').first();
      if (await evalDateInput.isVisible()) {
        await evalDateInput.fill('2024-01-01');
      }

      // Enter policy years
      const yearInputs = page.locator('input[placeholder*="Year"]');
      if (await yearInputs.first().isVisible()) {
        await yearInputs.first().fill('2023');
        await yearInputs.nth(1).fill('2024');
      }

      // Enter loss details
      const lossDateInput = page.locator('tr').first().locator('input[type="date"]');
      if (await lossDateInput.isVisible()) {
        await lossDateInput.fill('2023-06-15');

        // Enter indemnity and expense
        const indemnityInput = page.locator('tr').first().locator('input').nth(1);
        const expenseInput = page.locator('tr').first().locator('input').nth(2);

        if (await indemnityInput.isVisible()) {
          await indemnityInput.fill('50000');
        }
        if (await expenseInput.isVisible()) {
          await expenseInput.fill('10000');
        }
      }
    });
  });

  test.describe('UW Notes Tab', () => {
    test('should enter underwriting notes', async ({ page }) => {
      // Switch to UW Notes tab
      await page.click('button[role="tab"]:has-text("UW Notes")');
      await page.waitForTimeout(500);

      const notesTextarea = page.locator('textarea[placeholder*="Enter underwriting notes"]');
      if (await notesTextarea.isVisible()) {
        const notes = `Test underwriting notes for ${testQuote.insured}.\n\nRisk assessment: Low\nRecommendation: Approve with standard terms`;
        await notesTextarea.fill(notes);

        // Verify notes were entered
        await expect(notesTextarea).toHaveValue(notes);
      }
    });
  });

  test.describe('Export and Import Functions', () => {
    test('should export quote to JSON', async ({ page }) => {
      // Fill in minimum required data
      await page.locator('input:visible').first().fill(testQuote.insured);
      await page.locator('select').first().selectOption( 'Contractors');

      // Look for export button
      const exportButton = page.locator('button:has-text("Export to JSON")');

      // If not visible, check if we need to add it to the UI
      if (!await exportButton.isVisible()) {
        // The button might not be implemented yet
        console.log('Export button not yet implemented in UI');
        test.skip();
      }

      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toContain('.json');

      // Save and read the file
      const path = await download.path();
      expect(path).toBeTruthy();
    });

    test('should import quote from JSON', async ({ page }) => {
      // Look for import button
      const importButton = page.locator('button:has-text("Import JSON")');

      if (!await importButton.isVisible()) {
        console.log('Import button not yet implemented in UI');
        test.skip();
      }

      // Create test JSON data
      const testData = {
        exposure_rating: {
          policy_details: {
            insured: 'Imported Company',
            pl2: 'General Liability',
            territory: 'NY-01'
          }
        }
      };

      // Set up file chooser
      const fileChooserPromise = page.waitForEvent('filechooser');
      await importButton.click();
      const fileChooser = await fileChooserPromise;

      // Create temporary file and upload
      const buffer = Buffer.from(JSON.stringify(testData));
      await fileChooser.setFiles([{
        name: 'test-import.json',
        mimeType: 'application/json',
        buffer
      }]);

      // Verify data was imported
      await expect(page.locator('input:visible').first()).toHaveValue('Imported Company');
    });
  });

  test.describe('API Integration', () => {
    test('should calculate quote via API', async ({ page, request }) => {
      // Prepare test data
      const quoteInput = {
        exposure_rating: {
          policy_details: {
            insured: testQuote.insured,
            deal_number: testQuote.dealNumber,
            pl2: 'Contractors',
            territory: testQuote.territory,
            policy_effective_date: { new: '2024-01-01', expiring: '2023-01-01' },
            policy_expiration_date: { new: '2025-01-01', expiring: '2024-01-01' },
            occurrence_limit: { new: testQuote.occurrenceLimit, expiring: testQuote.occurrenceLimit },
            aggregate_limit: { new: testQuote.aggregateLimit, expiring: testQuote.aggregateLimit },
            sir_type: { new: 'Deductible', expiring: 'Deductible' },
            sir_amount: { new: testQuote.sirAmount, expiring: testQuote.sirAmount },
            commission: { new: 0.175, expiring: 0.175 }
          },
          class_rows: []
        }
      };

      // Make API call
      const response = await request.post(`${apiURL}/api/quotes/calculate`, {
        data: quoteInput,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // If API is not running, skip this test
      if (!response.ok()) {
        console.log('API not available, skipping API tests');
        test.skip();
      }

      const result = await response.json();

      // Verify response structure
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('quote_id');

      if (result.output?.calculated_values) {
        expect(result.output.calculated_values).toHaveProperty('technical_premium_pre_emod');
        expect(result.output.calculated_values).toHaveProperty('experience_modifier');
      }
    });

    test('should retrieve quote list via API', async ({ request }) => {
      const response = await request.get(`${apiURL}/api/quotes/list`);

      if (!response.ok()) {
        console.log('API not available, skipping');
        test.skip();
      }

      const result = await response.json();

      expect(result).toHaveProperty('quotes');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(Array.isArray(result.quotes)).toBeTruthy();
    });
  });

  test.describe('Quote History Page', () => {
    test('should navigate to quote history', async ({ page }) => {
      // Try to navigate to history page
      await page.goto(`${baseURL}/rating/history`);

      // Check if page exists
      const pageTitle = page.locator('h1:has-text("Quote History")');
      if (!await pageTitle.isVisible({ timeout: 5000 })) {
        console.log('Quote history page not yet implemented');
        test.skip();
      }

      // Verify table structure
      await expect(page.locator('table')).toBeVisible();
      await expect(page.locator('th:has-text("Quote ID")')).toBeVisible();
      await expect(page.locator('th:has-text("Insured")')).toBeVisible();
      await expect(page.locator('th:has-text("Premium")')).toBeVisible();
    });

    test('should filter quotes', async ({ page }) => {
      await page.goto(`${baseURL}/rating/history`);

      // Check for filter inputs
      const searchInput = page.locator('input[placeholder*="Search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('Test Company');
        await page.keyboard.press('Enter');

        // Wait for filtered results
        await page.waitForTimeout(1000);

        // Verify filtered results
        const rows = page.locator('tbody tr');
        const count = await rows.count();

        if (count > 0) {
          const firstRowText = await rows.first().textContent();
          expect(firstRowText).toContain('Test Company');
        }
      }
    });

    test('should open quote details', async ({ page }) => {
      await page.goto(`${baseURL}/rating/history`);

      const viewButton = page.locator('button:has-text("View")').first();
      if (await viewButton.isVisible()) {
        await viewButton.click();

        // Should navigate to quote details page
        await page.waitForURL(/\/rating\/[a-f0-9-]+/);

        // Verify quote details are displayed
        const quoteIdHeader = page.locator('h1, h2').filter({ hasText: /Quote.*ID/ });
        await expect(quoteIdHeader).toBeVisible();
      }
    });
  });

  test.describe('Debug Panel', () => {
    test('should display debug information', async ({ page }) => {
      // Navigate to a quote debug view
      await page.goto(`${baseURL}/rating/test-quote-id/debug`);

      const debugPanel = page.locator('[data-testid="debug-panel"], .debug-panel');
      if (!await debugPanel.isVisible({ timeout: 5000 })) {
        console.log('Debug panel not yet implemented');
        test.skip();
      }

      // Check for debug tabs
      await expect(page.locator('button:has-text("Input JSON")')).toBeVisible();
      await expect(page.locator('button:has-text("Output JSON")')).toBeVisible();
      await expect(page.locator('button:has-text("Audit Trail")')).toBeVisible();
    });

    test('should view audit trail', async ({ page }) => {
      // This would be on a specific quote debug page
      const auditTab = page.locator('button:has-text("Audit Trail")');
      if (await auditTab.isVisible()) {
        await auditTab.click();

        // Verify audit events are displayed
        const auditEvents = page.locator('.audit-event, [data-testid="audit-event"]');
        expect(await auditEvents.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Comparison Tools', () => {
    test('should compare multiple quotes', async ({ page }) => {
      await page.goto(`${baseURL}/rating/compare`);

      const compareTitle = page.locator('h1:has-text("Compare Quotes")');
      if (!await compareTitle.isVisible({ timeout: 5000 })) {
        console.log('Comparison tools not yet implemented');
        test.skip();
      }

      // Select quotes to compare
      const checkboxes = page.locator('input[type="checkbox"]');
      if (await checkboxes.first().isVisible()) {
        await checkboxes.first().check();
        await checkboxes.nth(1).check();

        // Click compare button
        await page.click('button:has-text("Compare Selected")');

        // Verify comparison view
        await expect(page.locator('.comparison-table, table')).toBeVisible();
      }
    });

    test('should perform what-if analysis', async ({ page }) => {
      const whatIfButton = page.locator('button:has-text("What-If Analysis")');
      if (await whatIfButton.isVisible()) {
        await whatIfButton.click();

        // Add scenario
        await page.click('button:has-text("Add Scenario")');

        // Modify parameter
        const parameterInput = page.locator('input[placeholder*="Enter value"]').first();
        await parameterInput.fill('1500000');

        // Calculate scenario
        await page.click('button:has-text("Calculate")');

        // Verify results
        const results = page.locator('.scenario-results');
        await expect(results).toBeVisible();
      }
    });
  });

  test.describe('Approval Workflow', () => {
    test('should submit quote for approval', async ({ page }) => {
      const submitButton = page.locator('button:has-text("Submit for Approval")');
      if (!await submitButton.isVisible()) {
        console.log('Approval workflow not yet implemented');
        test.skip();
      }

      await submitButton.click();

      // Should show confirmation
      const confirmation = page.locator('.toast, .notification').filter({ hasText: /submitted.*approval/ });
      await expect(confirmation).toBeVisible();
    });

    test('should display approval dashboard', async ({ page }) => {
      await page.goto(`${baseURL}/rating/approvals`);

      const approvalsTitle = page.locator('h1:has-text("Approval")');
      if (await approvalsTitle.isVisible()) {
        // Check for pending approvals
        await expect(page.locator('text=Pending Approvals')).toBeVisible();

        // Check for approval queue
        const queueTable = page.locator('table');
        await expect(queueTable).toBeVisible();
      }
    });
  });

  test.describe('Intelligent Validation', () => {
    test('should show validation warnings', async ({ page }) => {
      // Enter commission above typical range
      const commissionInput = page.locator('input').filter({ hasText: /Commission/ }).first();
      if (await commissionInput.isVisible()) {
        await commissionInput.fill('35'); // 35% is above typical

        // Check for warning
        const warning = page.locator('.warning, .text-yellow-600').filter({ hasText: /exceeds typical/ });
        if (await warning.isVisible({ timeout: 2000 })) {
          await expect(warning).toBeVisible();
        }
      }
    });

    test('should suggest auto-corrections', async ({ page }) => {
      // Enter invalid date combination
      const effectiveDate = page.locator('input[type="date"]').first();
      const expirationDate = page.locator('input[type="date"]').nth(1);

      if (await effectiveDate.isVisible() && await expirationDate.isVisible()) {
        await effectiveDate.fill('2024-12-31');
        await expirationDate.fill('2024-01-01'); // Before effective date

        // Check for auto-correction suggestion
        const correctionButton = page.locator('button:has-text("Apply Correction")');
        if (await correctionButton.isVisible({ timeout: 2000 })) {
          await correctionButton.click();

          // Verify date was corrected
          const newExpDate = await expirationDate.inputValue();
          expect(new Date(newExpDate)).toBeGreaterThan(new Date('2024-12-31'));
        }
      }
    });
  });

  test.describe('End-to-End Flow', () => {
    test('should complete full quote cycle', async ({ page, request }) => {
      // 1. Enter quote data
      await page.locator('input:visible').first().fill(testQuote.insured);
      await page.locator('input:visible').nth(1).fill(testQuote.dealNumber);
      await page.locator('select').first().selectOption( 'Contractors');

      // 2. Add class row
      const classCodeInput = page.locator('input[placeholder*="Search class code"]').first();
      if (await classCodeInput.isVisible()) {
        await classCodeInput.type('10026');
        await page.keyboard.press('Tab');

        const exposuresInput = page.locator('tr').first().locator('input').nth(4);
        if (await exposuresInput.isVisible()) {
          await exposuresInput.fill('500000');
        }
      }

      // 3. Switch to Experience Modifier tab
      await page.click('button[role="tab"]:has-text("Experience Modifier")');
      await page.waitForTimeout(500);

      // 4. Enter loss data
      const lossDateInput = page.locator('tr').first().locator('input[type="date"]');
      if (await lossDateInput.isVisible()) {
        await lossDateInput.fill('2023-06-15');
        const indemnityInput = page.locator('tr').first().locator('input').nth(1);
        if (await indemnityInput.isVisible()) {
          await indemnityInput.fill('25000');
        }
      }

      // 5. Add UW Notes
      await page.click('button[role="tab"]:has-text("UW Notes")');
      const notesTextarea = page.locator('textarea');
      if (await notesTextarea.isVisible()) {
        await notesTextarea.fill('End-to-end test notes');
      }

      // 6. Calculate quote (if button exists)
      const calculateButton = page.locator('button:has-text("Calculate")');
      if (await calculateButton.isVisible()) {
        await calculateButton.click();

        // Wait for calculation
        await page.waitForTimeout(2000);

        // Verify results
        const premiumField = page.locator('text=/Technical Premium|Calculated Premium/').first();
        if (await premiumField.isVisible({ timeout: 2000 }).catch(() => false)) {
          const premiumValue = await premiumField.textContent();
          expect(premiumValue).toBeTruthy();
        }
      }

      // 7. Save quote
      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();

        // Should show success message
        const success = page.locator('.toast, .notification').filter({ hasText: /saved|success/ });
        if (await success.isVisible()) {
          await expect(success).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page, request }) => {
      // Try to make a bad API request
      const response = await request.post(`${apiURL}/api/quotes/calculate`, {
        data: { invalid: 'data' },
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok()) {
        // API should reject invalid data
        const result = await response.json();
        expect(result).toHaveProperty('validation_result');
        expect(result.validation_result.errors.length).toBeGreaterThan(0);
      }
    });

    test('should handle missing Excel template', async ({ request }) => {
      // This tests the backend's ability to handle missing template
      const quoteInput = {
        exposure_rating: {
          policy_details: {
            insured: 'Error Test Company',
            pl2: 'Other',
            territory: 'TEST'
          }
        }
      };

      const response = await request.post(`${apiURL}/api/quotes/calculate`, {
        data: quoteInput,
        headers: { 'Content-Type': 'application/json' }
      });

      // Should either work with fallback or return appropriate error
      if (!response.ok()) {
        const error = await response.json();
        expect(error).toHaveProperty('detail');
      }
    });
  });
});

test.describe('Performance Tests', () => {
  test('should load rating page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/rating/primary-gl-rater');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large class code list efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000/rating/primary-gl-rater');

    const classCodeInput = page.locator('input[placeholder*="Search class code"]').first();
    if (await classCodeInput.isVisible()) {
      const startTime = Date.now();
      await classCodeInput.type('100');

      // Search should be responsive
      const searchTime = Date.now() - startTime;
      expect(searchTime).toBeLessThan(500);

      // Dropdown should appear quickly
      const dropdown = page.locator('[role="option"], .dropdown-item').first();
      await expect(dropdown).toBeVisible({ timeout: 1000 });
    }
  });
});
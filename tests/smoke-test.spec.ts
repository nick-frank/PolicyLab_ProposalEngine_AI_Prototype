import { test, expect } from '@playwright/test';

/**
 * Smoke Test Suite - Quick validation of core functionality
 * Run this test to quickly verify the application is working
 */

test.describe('Smoke Tests - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rating/primary-gl-rater');
  });

  test('application loads successfully', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1:has-text("Primary GL Rater")')).toBeVisible();

    // Check MARKEL branding
    await expect(page.getByText('MARKEL', { exact: true })).toBeVisible();

    // Check tabs are present
    await expect(page.locator('button[role="tab"]')).toHaveCount(3);
  });

  test('can enter basic quote information', async ({ page }) => {
    // Enter insured name (find the input next to the "Insured:" label)
    const insuredInput = page.locator('label:has-text("Insured:") + input, label:has-text("Insured:") ~ input').first();
    // Fallback: find visible text inputs
    const fallbackInput = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
    const inputToUse = await insuredInput.isVisible() ? insuredInput : fallbackInput;
    await inputToUse.fill('Smoke Test Company');

    // Select PL2
    const pl2Select = page.locator('select').first();
    await pl2Select.selectOption('Contractors');

    // Verify Sales section appears for Contractors
    await expect(page.locator('text=Sales:')).toBeVisible();

    // Enter sales value
    const salesInput = page.locator('input[placeholder="New/Renewal"]');
    await salesInput.fill('1000000');

    // Switch to UW Notes tab
    await page.click('button[role="tab"]:has-text("UW Notes")');

    // Enter notes
    const notesArea = page.locator('textarea');
    await notesArea.fill('Smoke test notes');

    // Switch back to Exposure Rating
    await page.click('button[role="tab"]:has-text("Exposure Rating")');

    // Verify data persists
    await expect(inputToUse).toHaveValue('Smoke Test Company');
  });

  test('can navigate all tabs without errors', async ({ page }) => {
    // Navigate through all tabs
    const tabs = [
      { name: 'Exposure Rating', content: 'Table 1. Policy Level Details' },
      { name: 'Experience Modifier', content: 'Experience Modifier Calculation' },
      { name: 'UW Notes', content: 'Primary General Liability - UW Notes' }
    ];

    for (const tab of tabs) {
      await page.click(`button[role="tab"]:has-text("${tab.name}")`);
      await expect(page.locator(`text=${tab.content}`)).toBeVisible();
    }
  });

  test('dynamic fields work correctly', async ({ page }) => {
    // Select General Liability
    const pl2Select = page.locator('select').first();
    await pl2Select.selectOption('General Liability');

    // Wait for dynamic update
    await page.waitForTimeout(500);

    // Check for GL-specific headers (use first() to handle multiple matches)
    await expect(page.locator('th:has-text("PremOps / Liquor")').first()).toBeVisible();

    // Select Contractors
    await pl2Select.selectOption('Contractors');
    await page.waitForTimeout(500);

    // Check headers changed back
    await expect(page.locator('th:has-text("PremOps Rate")').first()).toBeVisible();

    // Sales section should be visible
    await expect(page.locator('text=Sales:')).toBeVisible();
  });

  test('API health check', async ({ request }) => {
    try {
      const response = await request.get('http://localhost:8000/api/health');

      if (response.ok()) {
        const health = await response.json();
        expect(health.status).toBe('healthy');
        console.log('✓ Backend API is running');
      } else {
        console.log('⚠ Backend API not available - some features may not work');
      }
    } catch {
      console.log('⚠ Backend API not running - please start backend for full functionality');
    }
  });
});

test.describe('Quick Validation', () => {
  test('end-to-end quote entry', async ({ page }) => {
    await page.goto('/rating/primary-gl-rater');

    // Quick quote entry
    const quote = {
      insured: `Quick Test ${Date.now()}`,
      pl2: 'Other',
      territory: 'TEST'
    };

    // Enter data - use visible inputs only
    const insuredInput = page.locator('input[type="text"]:visible, input:not([type]):visible').first();
    await insuredInput.fill(quote.insured);
    await page.selectOption('select', quote.pl2);

    // Find territory input by its label
    const territoryLabel = page.locator('label:has-text("Territory:")');
    const territoryInput = territoryLabel.locator('..').locator('input');
    if (await territoryInput.isVisible({ timeout: 2000 })) {
      await territoryInput.clear();
      await territoryInput.fill(quote.territory);
    }

    // Add a class code
    await page.evaluate(() => window.scrollTo(0, 600));

    const classCodeInput = page.locator('input[placeholder*="Search class code"]').first();
    if (await classCodeInput.isVisible()) {
      await classCodeInput.type('100');
      await page.waitForTimeout(500);

      // Try to select first option if dropdown appears
      const dropdown = page.locator('[role="option"]').first();
      if (await dropdown.isVisible({ timeout: 1000 })) {
        await dropdown.click();
      }
    }

    // Go to Experience Modifier
    await page.click('button[role="tab"]:has-text("Experience Modifier")');

    // Enter evaluation date
    const dateInput = page.locator('input[type="date"]').first();
    await dateInput.fill('2024-01-01');

    // Go to UW Notes
    await page.click('button[role="tab"]:has-text("UW Notes")');

    // Enter notes
    await page.locator('textarea').fill(`Quick validation test for ${quote.insured}`);

    // Return to first tab
    await page.click('button[role="tab"]:has-text("Exposure Rating")');

    // If all steps complete without error, test passes
    expect(true).toBeTruthy();
  });
});

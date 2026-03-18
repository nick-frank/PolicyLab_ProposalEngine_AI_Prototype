import { test, expect } from "@playwright/test";

test.describe("Debug Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rating/primary-gl-rater");
  });

  test("Debug button opens panel without requiring a saved quote", async ({ page }) => {
    // Panel should not be visible initially
    await expect(page.locator("text=Debug Information")).not.toBeVisible();

    // Click the Debug button
    await page.click('button:has-text("Debug")');

    // Panel should now be visible
    await expect(page.locator("text=Debug Information")).toBeVisible();

    // Should show Quote Input section
    await expect(page.locator("text=Quote Input (Form State)")).toBeVisible();

    // Should show Calculated Output section header
    await expect(page.getByRole("button", { name: "Calculated Output" })).toBeVisible();

    // Should NOT show Quote ID (no quote saved yet)
    await expect(page.locator("text=Quote ID:")).not.toBeVisible();

    // Should NOT show API download buttons (no quote saved)
    await expect(page.locator("text=API Downloads")).not.toBeVisible();
  });

  test("Debug panel shows JSON data from form state", async ({ page }) => {
    // Fill in insured field (find by label)
    const insuredInput = page.locator('label:has-text("Insured:") + input, label:has-text("Insured:") ~ input').first();
    // The insured input is in a grid, use the label to find it
    const insuredRow = page.locator('text=Insured:').locator('..').locator('input').first();
    await insuredRow.fill("Test Company");

    // Open debug panel
    await page.click('button:has-text("Debug")');

    // The input section should be expanded by default and contain form data
    const preBlock = page.locator("pre").first();
    await expect(preBlock).toBeVisible();
    const jsonText = await preBlock.textContent();
    expect(jsonText).toContain("Test Company");
  });

  test("Refresh button updates the snapshot", async ({ page }) => {
    // Open debug panel
    await page.click('button:has-text("Debug")');

    // Get initial timestamp
    const timestampBefore = await page.locator("text=Snapshot:").textContent();

    // Wait a moment then fill in data
    await page.waitForTimeout(1100);
    const insuredRow = page.locator('text=Insured:').locator('..').locator('input').first();
    await insuredRow.fill("Updated Company");

    // Click Refresh
    await page.click('button:has-text("Refresh")');

    // Timestamp should have changed
    const timestampAfter = await page.locator("text=Snapshot:").textContent();
    expect(timestampAfter).not.toEqual(timestampBefore);

    // JSON should now contain the updated value
    const preBlock = page.locator("pre").first();
    const jsonText = await preBlock.textContent();
    expect(jsonText).toContain("Updated Company");
  });

  test("Collapsible sections toggle open/closed", async ({ page }) => {
    await page.click('button:has-text("Debug")');

    // Input section should be open by default - pre block visible
    await expect(page.locator("pre").first()).toBeVisible();

    // Click to collapse the input section
    await page.click("text=Quote Input (Form State)");

    // The pre block inside the input section should now be hidden
    const inputSection = page.locator("div.border.rounded.bg-white").first();
    await expect(inputSection.locator("pre")).not.toBeVisible();

    // Click to re-expand
    await page.click("text=Quote Input (Form State)");
    await expect(inputSection.locator("pre")).toBeVisible();
  });

  test("Copy button exists for input JSON", async ({ page }) => {
    await page.click('button:has-text("Debug")');

    // Should have Copy buttons
    const copyButtons = page.locator('button:has-text("Copy")');
    await expect(copyButtons.first()).toBeVisible();
  });

  test("Calculated Output shows placeholder when no calculation done", async ({ page }) => {
    await page.click('button:has-text("Debug")');

    // Should show the "no output yet" message
    await expect(page.locator("text=No calculated output yet")).toBeVisible();
  });

  test("Debug panel closes when clicking Debug button again", async ({ page }) => {
    // Open
    await page.click('button:has-text("Debug")');
    await expect(page.locator("text=Debug Information")).toBeVisible();

    // Close
    await page.click('button:has-text("Debug")');
    await expect(page.locator("text=Debug Information")).not.toBeVisible();
  });
});

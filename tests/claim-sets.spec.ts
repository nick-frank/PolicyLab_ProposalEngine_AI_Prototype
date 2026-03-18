import { test, expect } from "@playwright/test";

test.describe("Claim Sets with Cost Allocation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/phase2/claims-search");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("page loads with Claim Sets toggle button", async ({ page }) => {
    await expect(page.locator("h1", { hasText: "Claims Search" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Claim Sets/ })).toBeVisible();
  });

  test("side panel opens and shows empty state", async ({ page }) => {
    await page.getByRole("button", { name: /Claim Sets/ }).click();
    await expect(page.getByText("No claim sets yet")).toBeVisible();
  });

  test("search returns results", async ({ page }) => {
    const textarea = page.locator("textarea");
    await textarea.fill("slip and fall");
    await textarea.press("Enter");

    // Wait for results to appear (claim numbers start with CLM-)
    await expect(page.locator("text=CLM-").first()).toBeVisible({ timeout: 8000 });
  });

  test("Claim Sets panel toggles open and closed", async ({ page }) => {
    const toggleBtn = page.getByRole("button", { name: /Claim Sets/ });

    // Initially panel is closed
    await expect(page.getByText("No claim sets yet")).not.toBeVisible();

    // Open
    await toggleBtn.click();
    await expect(page.getByText("No claim sets yet")).toBeVisible();

    // Close
    await toggleBtn.click();
    await expect(page.getByText("No claim sets yet")).not.toBeVisible();
  });

  test("localStorage persistence of claim sets", async ({ page }) => {
    await page.evaluate(() => {
      const sets = [
        {
          id: "test-set-1",
          name: "Test Set",
          createdAt: new Date().toISOString(),
          claimIds: ["clm-001"],
          allocations: [],
        },
      ];
      localStorage.setItem("claims-search-claim-sets", JSON.stringify(sets));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /Claim Sets/ }).click();
    await expect(page.getByText("Test Set")).toBeVisible();
  });

  test("claim set detail view with cost allocation", async ({ page }) => {
    await page.evaluate(() => {
      const sets = [
        {
          id: "test-set-2",
          name: "Injury Claims Set",
          createdAt: new Date().toISOString(),
          claimIds: ["clm-001", "clm-002"],
          allocations: [
            { formNumber: "CG 00 01", formName: "Commercial General Liability", percentage: 60 },
            { formNumber: "CG 00 02", formName: "Products/Completed Operations", percentage: 40 },
          ],
        },
      ];
      localStorage.setItem("claims-search-claim-sets", JSON.stringify(sets));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open panel
    await page.getByRole("button", { name: /Claim Sets/ }).click();

    // Should show the set in the list
    await expect(page.getByText("Injury Claims Set", { exact: true })).toBeVisible();
    await expect(page.getByText("Fully allocated")).toBeVisible();

    // Click to enter detail view
    await page.getByText("Injury Claims Set", { exact: true }).click();

    // Should show detail with allocations
    await expect(page.getByText("Cost Allocation").first()).toBeVisible();
    await expect(page.getByText("100% — Fully allocated")).toBeVisible();

    // Summary should be visible since allocations sum to 100%
    await expect(page.getByText("Cost Allocation Summary")).toBeVisible();

    // Should show both form badges
    await expect(page.getByText("CG 00 01").first()).toBeVisible();
    await expect(page.getByText("CG 00 02").first()).toBeVisible();

    // Back button should return to list
    await page.getByText("Back to sets").click();
    await expect(page.getByText("Injury Claims Set", { exact: true })).toBeVisible();
  });

  test("distribute evenly splits percentages", async ({ page }) => {
    await page.evaluate(() => {
      const sets = [
        {
          id: "test-set-3",
          name: "Even Split Test",
          createdAt: new Date().toISOString(),
          claimIds: ["clm-001"],
          allocations: [
            { formNumber: "CG 00 01", formName: "Form A", percentage: 0 },
            { formNumber: "CG 00 02", formName: "Form B", percentage: 0 },
            { formNumber: "CG 00 03", formName: "Form C", percentage: 0 },
          ],
        },
      ];
      localStorage.setItem("claims-search-claim-sets", JSON.stringify(sets));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open panel and navigate to detail
    await page.getByRole("button", { name: /Claim Sets/ }).click();
    await page.getByText("Even Split Test").click();

    // Click Distribute Evenly
    await page.getByRole("button", { name: /Distribute Evenly/ }).click();

    // Check that percentages sum to 100
    const inputs = page.locator('input[type="number"]');
    const values = await inputs.evaluateAll((els) =>
      els.map((el) => (el as HTMLInputElement).value)
    );
    const numValues = values.map(Number);
    expect(numValues.reduce((a, b) => a + b, 0)).toBe(100);
  });

  test("selection bar appears when claims are checked", async ({ page }) => {
    // Pre-populate a set so selection mode is active
    await page.evaluate(() => {
      const sets = [
        {
          id: "test-set-x",
          name: "Existing Set",
          createdAt: new Date().toISOString(),
          claimIds: [],
          allocations: [],
        },
      ];
      localStorage.setItem("claims-search-claim-sets", JSON.stringify(sets));
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    // Search for claims
    const textarea = page.locator("textarea");
    await textarea.fill("water damage");
    await textarea.press("Enter");

    // Wait for results to appear
    await expect(page.locator("text=CLM-").first()).toBeVisible({ timeout: 8000 });

    // Checkboxes should be visible (Square icons) since selection mode is active
    const checkbox = page.locator("svg.lucide-square").first();
    await expect(checkbox).toBeVisible({ timeout: 3000 });

    // Click the checkbox
    await checkbox.click();

    // Selection bar should appear
    await expect(page.getByText(/claim.*selected/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Create New Set/ })).toBeVisible();
  });
});

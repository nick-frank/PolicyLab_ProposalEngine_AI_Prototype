/**
 * Playwright UI tests for ProposalEngine admin panel and auth endpoints.
 *
 * Prerequisites:
 *   - Backend running on http://localhost:8000
 *   - npx playwright install chromium  (first time only)
 *
 * Run:
 *   npx playwright test tests/test_admin_ui.spec.ts --headed
 *   npx playwright test tests/test_admin_ui.spec.ts           # headless
 */

import { test, expect, type Page } from "@playwright/test";

const BASE = "http://localhost:8000";
const ADMIN_URL = `${BASE}/admin`;
const SUPERUSER_EMAIL = "admin@proposalengine.com";
const SUPERUSER_PASSWORD = "changeme123!";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Login to the admin panel and return the page. */
async function adminLogin(page: Page, user = "admin", pass_ = "secret") {
  await page.goto(`${ADMIN_URL}/login`);
  await page.fill('input[name="username"]', user);
  await page.fill('input[name="password"]', pass_);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), {
    timeout: 5000,
  });
}

/** Register a user via the API and return the response body. */
async function registerUser(
  page: Page,
  email: string,
  password: string,
  fullName?: string
) {
  const resp = await page.request.post(`${BASE}/auth/register`, {
    data: { email, password, full_name: fullName || null },
  });
  return { status: resp.status(), body: await resp.json() };
}

/** Login via JWT and return the access token. */
async function jwtLogin(page: Page, email: string, password: string) {
  const resp = await page.request.post(`${BASE}/auth/jwt/login`, {
    form: { username: email, password },
  });
  const body = await resp.json();
  return { status: resp.status(), token: body.access_token as string };
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. ADMIN PANEL
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Admin Panel", () => {
  test("login page loads", async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await expect(page).toHaveTitle(/Admin|ProposalEngine/i);
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("login with valid credentials redirects to dashboard", async ({
    page,
  }) => {
    await adminLogin(page);
    // Should be on the admin dashboard now
    await expect(page).toHaveURL(/\/admin\/?$/);
    // Navigation should show model views
    const body = await page.textContent("body");
    expect(body).toContain("User");
    expect(body).toContain("Quote");
  });

  test("login with empty credentials stays on login", async ({ page }) => {
    await page.goto(`${ADMIN_URL}/login`);
    await page.click('button[type="submit"], input[type="submit"]');
    // Should still be on login page
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test("unauthenticated access redirects to login", async ({ page }) => {
    await page.goto(ADMIN_URL);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin dashboard shows all model views after login", async ({
    page,
  }) => {
    await adminLogin(page);
    const nav = await page.textContent("body");
    expect(nav).toContain("User");
    expect(nav).toContain("Quote");
    expect(nav).toContain("Audit Log");
    expect(nav).toContain("Approval");
  });

  test("user list page loads", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/user/list`);
    await expect(page).toHaveURL(/\/user\/list/);
    // Table or "No results" should appear
    await expect(page.locator("table, .container")).toBeVisible();
  });

  test("quote list page loads", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/quote/list`);
    await expect(page).toHaveURL(/\/quote\/list/);
    await expect(page.locator("table, .container")).toBeVisible();
  });

  test("audit log list page loads", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/audit-log/list`);
    await expect(page.locator("table, .container")).toBeVisible();
  });

  test("approval list page loads", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/approval/list`);
    await expect(page.locator("table, .container")).toBeVisible();
  });

  test("logout works", async ({ page }) => {
    await adminLogin(page);
    await page.goto(`${ADMIN_URL}/logout`);
    // After logout, going to admin should redirect to login
    await page.goto(ADMIN_URL);
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. AUTH API — Registration
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Auth API — Registration", () => {
  test("register a new user", async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    const { status, body } = await registerUser(page, email, "StrongP@ss1");
    expect(status).toBe(201);
    expect(body.email).toBe(email);
    expect(body.is_active).toBe(true);
    expect(body.is_verified).toBe(false);
  });

  test("register with custom fields", async ({ page }) => {
    const email = `custom-${Date.now()}@example.com`;
    const resp = await page.request.post(`${BASE}/auth/register`, {
      data: {
        email,
        password: "StrongP@ss1",
        full_name: "Test User",
        role: "underwriter",
      },
    });
    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.full_name).toBe("Test User");
    expect(body.role).toBe("underwriter");
  });

  test("duplicate email rejected", async ({ page }) => {
    const email = `dup-${Date.now()}@example.com`;
    await registerUser(page, email, "StrongP@ss1");
    const { status } = await registerUser(page, email, "StrongP@ss1");
    expect(status).toBe(400);
  });

  test("invalid email rejected", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/auth/register`, {
      data: { email: "not-an-email", password: "StrongP@ss1" },
    });
    expect(resp.status()).toBe(422);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. AUTH API — JWT Login
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Auth API — JWT Login", () => {
  let testEmail: string;

  test.beforeAll(async ({ request }) => {
    testEmail = `jwt-${Date.now()}@example.com`;
    await request.post(`${BASE}/auth/register`, {
      data: { email: testEmail, password: "StrongP@ss1" },
    });
  });

  test("login returns JWT token", async ({ page }) => {
    const { status, token } = await jwtLogin(page, testEmail, "StrongP@ss1");
    expect(status).toBe(200);
    expect(token).toBeTruthy();
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
  });

  test("wrong password rejected", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/auth/jwt/login`, {
      form: { username: testEmail, password: "WrongPass" },
    });
    expect(resp.status()).toBe(400);
  });

  test("nonexistent email rejected", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/auth/jwt/login`, {
      form: { username: "nobody@nowhere.com", password: "anything" },
    });
    expect(resp.status()).toBe(400);
  });

  test("JWT token grants access to /users/me", async ({ page }) => {
    const { token } = await jwtLogin(page, testEmail, "StrongP@ss1");
    const resp = await page.request.get(`${BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.email).toBe(testEmail);
  });

  test("malformed token rejected", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/users/me`, {
      headers: { Authorization: "Bearer garbage123" },
    });
    expect(resp.status()).toBe(401);
  });

  test("no auth header returns 401", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/users/me`);
    expect(resp.status()).toBe(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. AUTH API — Superuser Login
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Auth API — Superuser", () => {
  test("seeded superuser can login", async ({ page }) => {
    const { status, token } = await jwtLogin(
      page,
      SUPERUSER_EMAIL,
      SUPERUSER_PASSWORD
    );
    expect(status).toBe(200);
    expect(token).toBeTruthy();
  });

  test("superuser has is_superuser=true", async ({ page }) => {
    const { token } = await jwtLogin(
      page,
      SUPERUSER_EMAIL,
      SUPERUSER_PASSWORD
    );
    const resp = await page.request.get(`${BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await resp.json();
    expect(body.is_superuser).toBe(true);
    expect(body.role).toBe("admin");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Existing endpoints still work (no auth required)
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Existing Endpoints — No Auth Required", () => {
  test("GET / returns healthy", async ({ page }) => {
    const resp = await page.request.get(BASE);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.status).toBe("healthy");
  });

  test("GET /api/health returns healthy", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/health`);
    expect(resp.status()).toBe(200);
  });

  test("GET /api/workflow/status works without auth", async ({ page }) => {
    const resp = await page.request.get(`${BASE}/api/workflow/status`);
    expect(resp.status()).toBe(200);
  });

  test("Swagger docs accessible", async ({ page }) => {
    await page.goto(`${BASE}/docs`);
    await expect(page).toHaveTitle(/Swagger|ProposalEngine/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Password Reset Flow
// ═══════════════════════════════════════════════════════════════════════════

test.describe("Auth API — Password Reset", () => {
  test("forgot password returns 202", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/auth/forgot-password`, {
      data: { email: SUPERUSER_EMAIL },
    });
    expect(resp.status()).toBe(202);
  });

  test("forgot password for unknown email still returns 202", async ({
    page,
  }) => {
    const resp = await page.request.post(`${BASE}/auth/forgot-password`, {
      data: { email: "nobody@nowhere.com" },
    });
    expect(resp.status()).toBe(202);
  });

  test("reset password with invalid token returns 400", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/auth/reset-password`, {
      data: { token: "invalid", password: "NewP@ss999" },
    });
    expect(resp.status()).toBe(400);
  });
});

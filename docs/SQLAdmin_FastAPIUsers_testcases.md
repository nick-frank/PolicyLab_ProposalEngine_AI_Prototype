# Test Cases: SQLAdmin & FastAPI-Users Integration

Test suite for verifying the implementation described in `SQLAdmin_FastAPIUsers.md`.
All tests use `pytest-asyncio`, `httpx.AsyncClient`, and an in-memory SQLite database.

---

## Test Infrastructure

### Fixtures Required

| Fixture | Purpose |
|---------|---------|
| `app` | FastAPI test app with all routers, middleware, and admin mounted |
| `async_client` | `httpx.AsyncClient` bound to the test app |
| `db_session` | Async SQLAlchemy session using `sqlite+aiosqlite://` (in-memory) |
| `registered_user` | Pre-created active user (email/password known) |
| `verified_user` | Pre-created user with `is_verified=True` |
| `superuser` | Pre-created user with `is_superuser=True`, `is_verified=True` |
| `jwt_token` | Valid JWT bearer token for `registered_user` |
| `superuser_token` | Valid JWT bearer token for `superuser` |
| `admin_cookie_client` | `httpx.AsyncClient` with an authenticated session cookie for `/admin` |

---

## 1. User Model & Database

### TC-1.1: User table created on startup
- **Action**: Call `init_db()` against an empty in-memory DB
- **Assert**: `user` table exists with columns: `id`, `email`, `hashed_password`, `is_active`, `is_superuser`, `is_verified`, `full_name`, `role`
- **Assert**: Existing tables (`quotes`, `audit_logs`, `approvals`) still created alongside

### TC-1.2: User model default values
- **Action**: Create a `User` via the ORM with only `email` and `hashed_password`
- **Assert**: `is_active=True`, `is_superuser=False`, `is_verified=False`, `role="viewer"`, `full_name=None`

### TC-1.3: User email uniqueness constraint
- **Action**: Insert two users with the same email
- **Assert**: `IntegrityError` raised on the second insert

### TC-1.4: User UUID primary key
- **Action**: Create a user, read back
- **Assert**: `user.id` is a valid UUID (not an integer, not a string slug)

### TC-1.5: User custom fields persisted
- **Action**: Create user with `full_name="Jane Doe"`, `role="underwriter"`
- **Assert**: Values round-trip correctly through DB read

---

## 2. User Registration (`POST /auth/register`)

### TC-2.1: Successful registration
- **Action**: POST valid `{email, password}` to `/auth/register`
- **Assert**: 201 response, body contains `id`, `email`, `is_active=True`, `is_verified=False`
- **Assert**: User exists in DB with hashed (not plaintext) password

### TC-2.2: Registration with custom fields
- **Action**: POST `{email, password, full_name, role}` to `/auth/register`
- **Assert**: `full_name` and `role` returned in response and persisted

### TC-2.3: Duplicate email rejected
- **Action**: Register user A, then register user B with same email
- **Assert**: 400 response with `REGISTER_USER_ALREADY_EXISTS`

### TC-2.4: Weak password rejected
- **Action**: POST with `password="123"`
- **Assert**: 400 response (FastAPI-Users enforces minimum password length of 3 by default, but custom validation can be stricter)

### TC-2.5: Invalid email rejected
- **Action**: POST with `email="not-an-email"`
- **Assert**: 422 validation error

### TC-2.6: Missing required fields
- **Action**: POST with empty body / missing email / missing password
- **Assert**: 422 for each case

---

## 3. JWT Authentication (`/auth/jwt/*`)

### TC-3.1: Login returns JWT token
- **Action**: POST `{username: email, password}` to `/auth/jwt/login` (form-encoded)
- **Assert**: 200 response with `{"access_token": "...", "token_type": "bearer"}`

### TC-3.2: Login with wrong password
- **Action**: POST valid email, wrong password
- **Assert**: 400 response with `LOGIN_BAD_CREDENTIALS`

### TC-3.3: Login with non-existent email
- **Action**: POST non-existent email
- **Assert**: 400 response with `LOGIN_BAD_CREDENTIALS` (same error — no email enumeration)

### TC-3.4: Login with inactive user
- **Action**: Create user with `is_active=False`, attempt login
- **Assert**: 400 response

### TC-3.5: JWT token grants access to protected route
- **Action**: GET `/users/me` with `Authorization: Bearer <token>`
- **Assert**: 200 response with user data

### TC-3.6: Expired JWT rejected
- **Action**: Create a JWTStrategy with `lifetime_seconds=1`, login, wait 2s, call `/users/me`
- **Assert**: 401 response

### TC-3.7: Malformed JWT rejected
- **Action**: Call `/users/me` with `Authorization: Bearer garbage123`
- **Assert**: 401 response

### TC-3.8: Missing Authorization header
- **Action**: Call `/users/me` with no auth header
- **Assert**: 401 response

### TC-3.9: JWT logout
- **Action**: POST to `/auth/jwt/logout` with valid token
- **Assert**: 200 response (note: stateless JWT — token itself isn't invalidated server-side)

---

## 4. Cookie Authentication (`/auth/cookie/*`)

### TC-4.1: Cookie login sets cookie
- **Action**: POST credentials to `/auth/cookie/login`
- **Assert**: 200 response, `Set-Cookie` header present with expected cookie name

### TC-4.2: Cookie grants access to protected route
- **Action**: Login via cookie, then GET `/users/me` (cookies forwarded automatically)
- **Assert**: 200 with user data

### TC-4.3: Cookie logout clears cookie
- **Action**: Login via cookie, POST `/auth/cookie/logout`
- **Assert**: Cookie cleared, subsequent `/users/me` returns 401

### TC-4.4: Cookie wrong password
- **Action**: POST wrong password to `/auth/cookie/login`
- **Assert**: 400 response, no cookie set

---

## 5. Password Reset (`/auth/forgot-password`, `/auth/reset-password`)

### TC-5.1: Forgot password for existing user
- **Action**: POST `{email}` to `/auth/forgot-password`
- **Assert**: 202 response (accepted regardless of whether email exists — no enumeration)
- **Assert**: `UserManager.on_after_forgot_password` called with a token

### TC-5.2: Forgot password for non-existent email
- **Action**: POST non-existent email to `/auth/forgot-password`
- **Assert**: 202 response (same as existing — silent)

### TC-5.3: Reset password with valid token
- **Action**: Obtain token from `on_after_forgot_password`, POST `{token, password}` to `/auth/reset-password`
- **Assert**: 200 response
- **Assert**: User can now login with new password, old password fails

### TC-5.4: Reset password with invalid/expired token
- **Action**: POST `{token: "invalid", password}` to `/auth/reset-password`
- **Assert**: 400 response with `RESET_PASSWORD_BAD_TOKEN`

### TC-5.5: Reset password with weak new password
- **Action**: Valid token, `password="1"`
- **Assert**: 400 or 422 response

---

## 6. Email Verification (`/auth/request-verify-token`, `/auth/verify`)

### TC-6.1: Request verify token
- **Action**: POST `{email}` to `/auth/request-verify-token` (as authenticated user)
- **Assert**: 202 response, `on_after_request_verify` called with token

### TC-6.2: Verify email with valid token
- **Action**: Obtain token from callback, POST `{token}` to `/auth/verify`
- **Assert**: 200 response, user now has `is_verified=True`

### TC-6.3: Verify with invalid token
- **Action**: POST `{token: "bogus"}` to `/auth/verify`
- **Assert**: 400 response with `VERIFY_USER_BAD_TOKEN`

### TC-6.4: Already verified user requests token
- **Action**: Verified user requests another verify token
- **Assert**: 400 response with `VERIFY_USER_ALREADY_VERIFIED`

---

## 7. User Profile (`/users/me`, `/users/{id}`)

### TC-7.1: Get current user profile
- **Action**: Authenticated GET `/users/me`
- **Assert**: Returns `id`, `email`, `full_name`, `role`, `is_active`, `is_superuser`, `is_verified`
- **Assert**: Does NOT return `hashed_password`

### TC-7.2: Update own profile
- **Action**: PATCH `/users/me` with `{full_name: "New Name"}`
- **Assert**: 200, name updated
- **Assert**: DB reflects change

### TC-7.3: Update own password
- **Action**: PATCH `/users/me` with `{password: "newpassword123"}`
- **Assert**: 200, can login with new password

### TC-7.4: Non-superuser cannot change own is_superuser
- **Action**: Normal user PATCH `/users/me` with `{is_superuser: true}`
- **Assert**: Field ignored or 403 (depending on FastAPI-Users config)

### TC-7.5: Superuser can get any user by ID
- **Action**: Superuser GET `/users/{other_user_id}`
- **Assert**: 200 with that user's data

### TC-7.6: Non-superuser cannot get other users by ID
- **Action**: Normal user GET `/users/{other_user_id}`
- **Assert**: 403 Forbidden

### TC-7.7: Superuser can update other users
- **Action**: Superuser PATCH `/users/{id}` with `{role: "admin"}`
- **Assert**: 200, role updated

### TC-7.8: Superuser can delete users
- **Action**: Superuser DELETE `/users/{id}`
- **Assert**: 204, user no longer in DB

### TC-7.9: Non-superuser cannot delete users
- **Action**: Normal user DELETE `/users/{other_id}`
- **Assert**: 403

---

## 8. SQLAdmin Panel Access

### TC-8.1: Admin login page loads
- **Action**: GET `/admin/login`
- **Assert**: 200, HTML response containing a login form

### TC-8.2: Admin login with valid credentials
- **Action**: POST login form to `/admin/login` with valid admin credentials
- **Assert**: Redirect to `/admin`, session cookie set

### TC-8.3: Admin login with invalid credentials
- **Action**: POST login form with wrong password
- **Assert**: Redirect back to login (no session)

### TC-8.4: Unauthenticated access redirects to login
- **Action**: GET `/admin` with no session cookie
- **Assert**: Redirect to `/admin/login`

### TC-8.5: Admin logout clears session
- **Action**: Authenticated admin hits logout
- **Assert**: Session cleared, subsequent `/admin` redirects to login

### TC-8.6: Admin panel lists all model views
- **Action**: Authenticated GET `/admin`
- **Assert**: HTML contains navigation links for Users, Quotes, Audit Logs, Approvals

---

## 9. SQLAdmin Model Views — User

### TC-9.1: User list view
- **Action**: GET `/admin/user/list`
- **Assert**: 200, HTML table with columns: id, email, full_name, role, is_active, is_superuser, is_verified

### TC-9.2: User detail view excludes hashed_password
- **Action**: GET `/admin/user/details/{id}`
- **Assert**: `hashed_password` NOT in response body

### TC-9.3: User create form excludes hashed_password
- **Action**: GET `/admin/user/create`
- **Assert**: Form does NOT have a `hashed_password` field

### TC-9.4: User search by email
- **Action**: GET `/admin/user/list?search=someuser@example.com`
- **Assert**: Filtered results matching the email

### TC-9.5: User edit via admin
- **Action**: POST update to `/admin/user/edit/{id}` changing role
- **Assert**: Role updated in DB

---

## 10. SQLAdmin Model Views — Quote

### TC-10.1: Quote list view
- **Action**: GET `/admin/quote/list`
- **Assert**: 200, table with id, insured_name, deal_number, status, technical_premium, bound_premium, created_at, created_by

### TC-10.2: Quote detail excludes large JSON
- **Action**: GET `/admin/quote/details/{id}`
- **Assert**: `input_data` and `output_data` NOT in detail view

### TC-10.3: Quote create disabled
- **Action**: GET `/admin/quote/create`
- **Assert**: 404 or not found (create disabled for quotes)

### TC-10.4: Quote delete via admin
- **Action**: Authenticated admin deletes a quote from admin panel
- **Assert**: Quote removed from DB, cascade deletes audit logs and approvals

### TC-10.5: Quote search by insured_name
- **Action**: Search for a known insured name in admin list
- **Assert**: Filtered results returned

### TC-10.6: Quote sort by created_at
- **Action**: GET quote list with sort parameter
- **Assert**: Results ordered correctly

---

## 11. SQLAdmin Model Views — AuditLog

### TC-11.1: Audit log list view
- **Action**: GET `/admin/auditlog/list`
- **Assert**: 200, table with expected columns

### TC-11.2: Audit log is read-only (no create)
- **Action**: Attempt to access create form
- **Assert**: Not available / 404

### TC-11.3: Audit log is read-only (no edit)
- **Action**: Attempt to access edit form for an existing log
- **Assert**: Not available / 404

### TC-11.4: Audit log is read-only (no delete)
- **Action**: Attempt to delete an audit log via admin
- **Assert**: Not allowed

---

## 12. SQLAdmin Model Views — Approval

### TC-12.1: Approval list view
- **Action**: GET `/admin/approval/list`
- **Assert**: 200, table with id, quote_id, stage, status, approver, created_at

### TC-12.2: Approval search by quote_id
- **Action**: Search for a known quote_id
- **Assert**: Filtered results

### TC-12.3: Approval edit via admin
- **Action**: Update approval status via admin panel
- **Assert**: Status changed in DB

---

## 13. Route Protection (Phase 1 — Optional Auth)

### TC-13.1: Existing quote endpoints work without auth
- **Action**: POST `/api/quotes/new` with no auth header, valid body
- **Assert**: Still returns 200/201 (auth is optional in Phase 1)
- **Assert**: `created_by` set to `"anonymous"` or `None`

### TC-13.2: Authenticated request populates created_by
- **Action**: POST `/api/quotes/new` with JWT bearer token
- **Assert**: Quote's `created_by` contains the authenticated user's email

### TC-13.3: GET endpoints work without auth
- **Action**: GET `/api/quotes/list` with no auth
- **Assert**: 200 response with quote list

### TC-13.4: Validation endpoints work without auth
- **Action**: POST `/api/validation/validate` with no auth
- **Assert**: 200 response

### TC-13.5: Health endpoint never requires auth
- **Action**: GET `/api/health` with no auth
- **Assert**: 200 response always

---

## 14. Superuser Seeding

### TC-14.1: Superuser created on first startup
- **Action**: Start app with empty DB
- **Assert**: User `admin@gl-rater.com` exists in DB
- **Assert**: `is_superuser=True`, `is_verified=True`, `role="admin"`

### TC-14.2: Superuser not duplicated on subsequent startups
- **Action**: Start app twice (superuser already exists)
- **Assert**: Still exactly one user with email `admin@gl-rater.com`

### TC-14.3: Superuser can login immediately
- **Action**: POST `/auth/jwt/login` with seeded admin credentials
- **Assert**: 200 with valid token

---

## 15. Middleware & Configuration

### TC-15.1: SessionMiddleware active
- **Action**: Make any request to the app
- **Assert**: Starlette `SessionMiddleware` is in the middleware stack (cookie-based sessions work)

### TC-15.2: CORS allows Authorization header
- **Action**: Preflight OPTIONS request with `Access-Control-Request-Headers: Authorization`
- **Assert**: `Access-Control-Allow-Headers` includes `Authorization`

### TC-15.3: CORS origins unchanged
- **Action**: Request from `http://localhost:3000`
- **Assert**: `Access-Control-Allow-Origin: http://localhost:3000`

### TC-15.4: SECRET_KEY used for JWT
- **Action**: Decode a JWT token — verify it was signed with `settings.SECRET_KEY`
- **Assert**: Signature valid with the configured key

---

## 16. Integration — Auth + Existing Endpoints

### TC-16.1: Create quote as authenticated user, retrieve it
- **Action**: Register user → login → create quote → GET quote
- **Assert**: Full flow works, quote has `created_by` set

### TC-16.2: Authenticated user sees own quote in list
- **Action**: Create quotes as user A and user B → user A lists quotes
- **Assert**: Both quotes visible (no tenant isolation in Phase 1)

### TC-16.3: Recalculate with auth
- **Action**: Create quote → login → POST `/api/quotes/{id}/recalculate`
- **Assert**: 200, recalculation succeeds, audit log includes user

### TC-16.4: Download Excel with auth
- **Action**: Login → GET `/api/quotes/{id}/excel`
- **Assert**: File downloaded successfully

### TC-16.5: Submit for approval with auth
- **Action**: Login → POST `/api/workflow/submit`
- **Assert**: Workflow created with authenticated user context

---

## 17. Error & Edge Cases

### TC-17.1: Concurrent registrations with same email
- **Action**: Fire two simultaneous POST `/auth/register` with same email
- **Assert**: Exactly one succeeds (201), the other gets 400

### TC-17.2: SQL injection attempt in email field
- **Action**: POST register with `email="'; DROP TABLE user;--@evil.com"`
- **Assert**: 422 validation error, no DB damage

### TC-17.3: XSS in full_name via admin panel
- **Action**: Create user with `full_name="<script>alert(1)</script>"`
- **Assert**: Admin panel escapes the value in HTML (no script execution)

### TC-17.4: Admin panel accessible only at /admin
- **Action**: GET `/admin/../secret` or path traversal attempts
- **Assert**: 404 or redirect to `/admin/login`

### TC-17.5: JWT token from one backend doesn't work on the other's logout
- **Action**: Login via JWT, try POST `/auth/cookie/logout`
- **Assert**: Graceful handling (no server error)

### TC-17.6: Very long password
- **Action**: Register with a 10,000 character password
- **Assert**: Either accepted or rejected gracefully (no OOM/timeout)

### TC-17.7: Unicode in user fields
- **Action**: Register with `full_name="田中太郎"`, `email="user@example.jp"`
- **Assert**: Stored and displayed correctly

---

## 18. Database Integrity

### TC-18.1: User table coexists with existing tables
- **Action**: Run `init_db()`, inspect all table names
- **Assert**: `user`, `quotes`, `audit_logs`, `approvals` all present

### TC-18.2: Deleting user does not cascade to quotes
- **Action**: User creates a quote (via `created_by` string), then user is deleted
- **Assert**: Quote still exists (loose FK — string field, not real FK in Phase 1)

### TC-18.3: DB handles concurrent sessions
- **Action**: Two async clients both login and create quotes simultaneously
- **Assert**: No deadlocks, both quotes created

---

## Running Tests

```bash
# From backend/
pytest tests/ -v --asyncio-mode=auto

# Run specific section
pytest tests/test_auth.py -v -k "jwt"
pytest tests/test_admin.py -v
pytest tests/test_route_protection.py -v
```

### Suggested Test File Layout

```
backend/tests/
├── conftest.py                  # Fixtures: app, db, clients, users, tokens
├── test_user_model.py           # TC-1.*
├── test_registration.py         # TC-2.*
├── test_jwt_auth.py             # TC-3.*
├── test_cookie_auth.py          # TC-4.*
├── test_password_reset.py       # TC-5.*
├── test_email_verification.py   # TC-6.*
├── test_user_profile.py         # TC-7.*
├── test_admin_access.py         # TC-8.*
├── test_admin_user_view.py      # TC-9.*
├── test_admin_quote_view.py     # TC-10.*
├── test_admin_auditlog_view.py  # TC-11.*
├── test_admin_approval_view.py  # TC-12.*
├── test_route_protection.py     # TC-13.*
├── test_superuser_seed.py       # TC-14.*
├── test_middleware.py           # TC-15.*
├── test_integration.py          # TC-16.*
├── test_edge_cases.py           # TC-17.*
└── test_db_integrity.py         # TC-18.*
```
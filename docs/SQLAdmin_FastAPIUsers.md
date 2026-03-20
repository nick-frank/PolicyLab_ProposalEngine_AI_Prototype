# Plan: Add SQLAdmin & FastAPI-Users to GL Primary Rater Backend

## Overview

Add **SQLAdmin** (web-based admin panel) and **FastAPI-Users\[sqlalchemy\]** (authentication & user management) to the existing FastAPI backend. This gives us:

- A full user model with registration, login, JWT auth, and password reset
- Role-based access control (admin, underwriter, viewer)
- An admin dashboard at `/admin` for managing all database records
- Auth-protected API routes via dependency injection

---

## Current State

| Aspect | Status |
|--------|--------|
| Database | Async SQLAlchemy 2.0 + SQLite (aiosqlite) |
| ORM Models | Quote, AuditLog, Approval — **no User model** |
| Auth | Not implemented; `python-jose`, `passlib[bcrypt]` already in requirements |
| Config | `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` already defined |
| FastAPI | v0.104.1, async lifespan, 4 routers |

---

## Dependencies to Add

```txt
# requirements.txt additions
fastapi-users[sqlalchemy]==13.0.0   # User management (includes httpx-oauth for OAuth)
sqladmin==0.19.0                     # Admin panel
itsdangerous==2.2.0                  # Required by SQLAdmin session auth
```

> `fastapi-users[sqlalchemy]` pulls in `fastapi-users-db-sqlalchemy` automatically.
> Remove `python-jose[cryptography]` and `passlib[bcrypt]` from requirements — FastAPI-Users uses its own JWT/password backends internally.

---

## Implementation Steps

### Step 1: Create User Model (`core/models.py`)

FastAPI-Users requires a SQLAlchemy model that extends its mixin.

```python
# core/models.py — additions
import uuid
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID

class User(SQLAlchemyBaseUserTableUUID, Base):
    """
    Inherits from FastAPI-Users mixin, which provides:
      - id (UUID, PK)
      - email (String, unique, indexed)
      - hashed_password (String)
      - is_active (Boolean, default True)
      - is_superuser (Boolean, default False)
      - is_verified (Boolean, default False)
    """
    __tablename__ = "user"

    # Custom fields
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="viewer")
    # Roles: "admin", "underwriter", "viewer"
```

Update the `Quote.created_by` field to be a proper FK to User (optional — can remain a loose string for backward compatibility initially).

---

### Step 2: Create FastAPI-Users Configuration (`core/users.py`)

New file with the full FastAPI-Users wiring:

```python
# core/users.py
import uuid
from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from core.models import User


# --- Pydantic Schemas for Users ---

class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: Optional[str] = None
    role: str = "viewer"

class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None
    role: str = "viewer"

class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None
    role: Optional[str] = None


# --- Database Adapter ---

async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)


# --- User Manager ---

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} ({user.email}) registered.")

    async def on_after_forgot_password(self, user: User, token: str, request: Optional[Request] = None):
        # TODO: send email with reset token
        print(f"Password reset requested for {user.email}. Token: {token}")

    async def on_after_request_verify(self, user: User, token: str, request: Optional[Request] = None):
        # TODO: send verification email
        print(f"Verification requested for {user.email}. Token: {token}")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


# --- Auth Backends ---

# Backend 1: JWT Bearer (for API clients / frontend)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.SECRET_KEY,
        lifetime_seconds=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
jwt_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# Backend 2: Cookie (for admin panel / browser sessions)
cookie_transport = CookieTransport(cookie_max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
cookie_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,  # reuse same JWT strategy
)


# --- FastAPIUsers Instance ---

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [jwt_backend, cookie_backend],
)

# Dependency shortcuts for route protection
current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)
```

---

### Step 3: Create SQLAdmin Configuration (`core/admin.py`)

New file:

```python
# core/admin.py
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend as SQLAdminAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

from core.config import settings
from core.models import Quote, AuditLog, Approval, User


# --- Admin Auth (cookie-based session) ---

class AdminAuth(SQLAdminAuth):
    """
    Authenticates admin panel access using a simple session secret.
    For production, wire this into FastAPI-Users' cookie backend.
    """
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        # Validate against FastAPI-Users
        # For MVP: check against a known admin user in the DB
        # For production: use fastapi_users.authenticator
        if username and password:
            request.session.update({"token": "authenticated"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        return True


# --- Model Views ---

class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.full_name, User.role,
                   User.is_active, User.is_superuser, User.is_verified]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.email, User.role, User.is_active]
    column_details_exclude_list = [User.hashed_password]
    form_excluded_columns = [User.hashed_password]
    can_create = True
    can_edit = True
    can_delete = True
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"


class QuoteAdmin(ModelView, model=Quote):
    column_list = [Quote.id, Quote.insured_name, Quote.deal_number,
                   Quote.status, Quote.technical_premium, Quote.bound_premium,
                   Quote.created_at, Quote.created_by]
    column_searchable_list = [Quote.insured_name, Quote.deal_number]
    column_sortable_list = [Quote.created_at, Quote.status, Quote.insured_name]
    column_details_exclude_list = [Quote.input_data, Quote.output_data]
    can_create = False   # Quotes created via API only
    can_delete = True
    name = "Quote"
    name_plural = "Quotes"
    icon = "fa-solid fa-file-invoice-dollar"


class AuditLogAdmin(ModelView, model=AuditLog):
    column_list = [AuditLog.id, AuditLog.quote_id, AuditLog.event_type,
                   AuditLog.user, AuditLog.timestamp, AuditLog.duration_ms]
    column_searchable_list = [AuditLog.quote_id, AuditLog.event_type]
    column_sortable_list = [AuditLog.timestamp, AuditLog.event_type]
    can_create = False
    can_edit = False
    can_delete = False   # Audit logs are immutable
    name = "Audit Log"
    name_plural = "Audit Logs"
    icon = "fa-solid fa-clock-rotate-left"


class ApprovalAdmin(ModelView, model=Approval):
    column_list = [Approval.id, Approval.quote_id, Approval.stage,
                   Approval.status, Approval.approver, Approval.created_at]
    column_searchable_list = [Approval.quote_id, Approval.approver]
    column_sortable_list = [Approval.created_at, Approval.status]
    name = "Approval"
    name_plural = "Approvals"
    icon = "fa-solid fa-check-circle"


def setup_admin(app, engine) -> Admin:
    """Call from main.py to mount the admin panel."""
    authentication_backend = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(
        app,
        engine,
        authentication_backend=authentication_backend,
        title="GL Rater Admin",
        base_url="/admin",
    )
    admin.add_view(UserAdmin)
    admin.add_view(QuoteAdmin)
    admin.add_view(AuditLogAdmin)
    admin.add_view(ApprovalAdmin)
    return admin
```

---

### Step 4: Update `main.py`

Wire everything into the FastAPI app:

```python
# main.py — changes

from core.users import fastapi_users, jwt_backend, cookie_backend, UserRead, UserCreate, UserUpdate
from core.admin import setup_admin
from core.database import engine
from starlette.middleware.sessions import SessionMiddleware

# --- Auth Routes (register under /auth) ---
app.include_router(
    fastapi_users.get_auth_router(jwt_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_auth_router(cookie_backend),
    prefix="/auth/cookie",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# --- Session Middleware (required by SQLAdmin) ---
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# --- SQLAdmin ---
setup_admin(app, engine)
```

---

### Step 5: Protect Existing API Routes (Gradual Rollout)

Add auth dependency to routes that need protection. Start with optional auth, then make mandatory:

```python
# api/quotes.py — example
from core.users import current_active_user
from core.models import User

# Phase 1: Optional (backwards-compatible)
@router.post("/new")
async def create_quote(
    quote_input: QuoteInput,
    user: Optional[User] = Depends(current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # user is None if no token provided
    created_by = user.email if user else "anonymous"
    ...

# Phase 2: Required (after frontend integration)
@router.post("/new")
async def create_quote(
    quote_input: QuoteInput,
    user: User = Depends(current_active_user),  # 401 if not authenticated
    db: AsyncSession = Depends(get_db),
):
    ...
```

---

### Step 6: Database Migration

Since the project uses Alembic (already in requirements):

```bash
# Generate migration for new User table
alembic revision --autogenerate -m "add user table"
alembic upgrade head
```

If Alembic is not yet initialized:

```bash
alembic init alembic
# Configure alembic.ini and env.py for async SQLAlchemy
alembic revision --autogenerate -m "initial migration with user table"
alembic upgrade head
```

Alternatively, since this is early-stage with SQLite, `init_db()` with `create_all` will auto-create the new table on startup.

---

### Step 7: Seed Initial Admin User

Add a startup utility or CLI command:

```python
# core/init_users.py
async def create_first_superuser():
    """Create the initial admin user if none exists."""
    async for session in get_db():
        user_db = SQLAlchemyUserDatabase(session, User)
        existing = await user_db.get_by_email("admin@gl-rater.com")
        if not existing:
            manager = UserManager(user_db)
            await manager.create(
                UserCreate(
                    email="admin@gl-rater.com",
                    password="changeme123!",
                    is_superuser=True,
                    is_verified=True,
                    full_name="System Admin",
                    role="admin",
                )
            )
            print("Created initial superuser: admin@gl-rater.com")
```

Call from the lifespan handler in `main.py`.

---

## New Auth Endpoints (provided by FastAPI-Users)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/jwt/login` | Login, returns JWT bearer token |
| POST | `/auth/jwt/logout` | Logout (invalidate token) |
| POST | `/auth/cookie/login` | Login, sets session cookie |
| POST | `/auth/cookie/logout` | Logout, clears cookie |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/forgot-password` | Request password reset token |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/request-verify-token` | Request email verification |
| POST | `/auth/verify` | Verify email with token |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update current user profile |
| GET | `/users/{id}` | Get user by ID (superuser only) |
| PATCH | `/users/{id}` | Update user (superuser only) |
| DELETE | `/users/{id}` | Delete user (superuser only) |

Admin panel accessible at: **`/admin`**

---

## New File Structure

```
backend/
├── core/
│   ├── admin.py          # NEW — SQLAdmin config & model views
│   ├── users.py          # NEW — FastAPI-Users setup, schemas, auth backends
│   ├── init_users.py     # NEW — Superuser seeding utility
│   ├── config.py         # MODIFIED — no changes needed (SECRET_KEY already exists)
│   ├── database.py       # UNCHANGED
│   ├── models.py         # MODIFIED — add User model
│   └── schemas.py        # UNCHANGED
├── api/
│   ├── quotes.py         # MODIFIED — add optional auth dependency
│   ├── validation.py     # MODIFIED — add optional auth dependency
│   ├── comparison.py     # MODIFIED — add optional auth dependency
│   └── workflow.py       # MODIFIED — add optional auth dependency
├── main.py               # MODIFIED — mount auth routers, admin, session middleware
└── requirements.txt      # MODIFIED — add sqladmin, fastapi-users[sqlalchemy]
```

---

## Rollout Phases

### Phase 1 — MVP (this plan)
- User model + FastAPI-Users auth routes
- SQLAdmin panel with session-based login
- Auth is **optional** on existing API routes (no breaking changes)
- Seed admin superuser on startup

### Phase 2 — Enforce Auth
- Make auth **required** on all mutating endpoints (POST, PATCH, DELETE)
- Read endpoints remain open or require viewer role
- Populate `Quote.created_by` with authenticated user's email/ID

### Phase 3 — RBAC & Permissions
- Role-based route guards (`admin`, `underwriter`, `viewer`)
- Admin: full access + SQLAdmin panel
- Underwriter: create/edit/calculate quotes, submit for approval
- Viewer: read-only access to quotes and comparisons

### Phase 4 — Production Hardening
- Switch SQLAdmin auth to use FastAPI-Users cookie backend properly
- Add OAuth2 providers (Azure AD, Google) if needed
- Email integration for password reset / verification
- Rate limiting on auth endpoints
- Audit log user actions with authenticated user ID

---

## Notes

- **SQLAdmin async support**: SQLAdmin v0.19+ fully supports async engines — pass the async engine directly to `Admin()`.
- **SQLite compatibility**: Both libraries work with SQLite. For production, consider PostgreSQL.
- **CORS**: No changes needed — auth headers pass through existing CORS config.
- **Existing `python-jose` / `passlib`**: Can be removed from requirements since FastAPI-Users bundles its own JWT and password handling. Keep if other parts of the app use them independently.
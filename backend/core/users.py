"""
FastAPI-Users configuration: schemas, user manager, auth backends.
"""

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


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class UserRead(schemas.BaseUser[uuid.UUID]):
    full_name: Optional[str] = None
    role: str = "viewer"


class UserCreate(schemas.BaseUserCreate):
    full_name: Optional[str] = None
    role: str = "viewer"


class UserUpdate(schemas.BaseUserUpdate):
    full_name: Optional[str] = None
    role: Optional[str] = None


# ---------------------------------------------------------------------------
# Database adapter
# ---------------------------------------------------------------------------

async def get_user_db(session: AsyncSession = Depends(get_db)):
    yield SQLAlchemyUserDatabase(session, User)


# ---------------------------------------------------------------------------
# User manager
# ---------------------------------------------------------------------------

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET_KEY
    verification_token_secret = settings.SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} ({user.email}) registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Password reset requested for {user.email}. Token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for {user.email}. Token: {token}")


async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)


# ---------------------------------------------------------------------------
# Auth backends
# ---------------------------------------------------------------------------

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
cookie_transport = CookieTransport(
    cookie_max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
)

cookie_backend = AuthenticationBackend(
    name="cookie",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)


# ---------------------------------------------------------------------------
# FastAPIUsers instance & dependency shortcuts
# ---------------------------------------------------------------------------

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [jwt_backend, cookie_backend],
)

current_active_user = fastapi_users.current_user(active=True)
current_superuser = fastapi_users.current_user(active=True, superuser=True)

# Optional variant — returns None when no credentials are supplied instead of 401
current_user_optional = fastapi_users.current_user(active=True, optional=True)

"""
Shared fixtures for the auth / admin test suite.

Uses an in-memory SQLite database so tests are fast and isolated.
"""

import asyncio
import uuid
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import StaticPool

from core.database import Base, get_db
from core.models import User, Quote, QuoteStatus

# ---------------------------------------------------------------------------
# Event loop
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ---------------------------------------------------------------------------
# In-memory database (StaticPool so all connections share the same DB)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(
    test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    """Create all tables before each test, drop after."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# FastAPI test app (override DB dependency + SQLAdmin engine)
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def app():
    """Return a FastAPI app wired to the test database."""
    from main import app as _app

    # Override the FastAPI dependency so API routes use test DB
    async def _override_get_db():
        async with TestSessionLocal() as session:
            yield session

    _app.dependency_overrides[get_db] = _override_get_db

    # Override SQLAdmin's session_maker to use the test engine
    from main import admin_instance
    original_session_maker = admin_instance.session_maker
    admin_instance.session_maker = TestSessionLocal

    yield _app

    _app.dependency_overrides.clear()
    admin_instance.session_maker = original_session_maker


@pytest_asyncio.fixture
async def async_client(app) -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(
        transport=transport,
        base_url="http://testserver",
        follow_redirects=False,
    ) as ac:
        yield ac


# ---------------------------------------------------------------------------
# User helpers
# ---------------------------------------------------------------------------

TEST_USER_EMAIL = "testuser@example.com"
TEST_USER_PASSWORD = "StrongP@ss123"
SUPERUSER_EMAIL = "admin@test.com"
SUPERUSER_PASSWORD = "SuperP@ss456"


@pytest_asyncio.fixture
async def registered_user(async_client: AsyncClient) -> dict:
    """Register a normal user and return the response body."""
    resp = await async_client.post(
        "/auth/register",
        json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
            "full_name": "Test User",
            "role": "viewer",
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


@pytest_asyncio.fixture
async def superuser(db_session: AsyncSession) -> User:
    """Directly insert a superuser into the test DB."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(
            email=SUPERUSER_EMAIL,
            password=SUPERUSER_PASSWORD,
            is_superuser=True,
            is_verified=True,
            full_name="Admin User",
            role="admin",
        )
    )
    await db_session.commit()
    return user


@pytest_asyncio.fixture
async def verified_user(db_session: AsyncSession) -> User:
    """Directly insert a verified (non-super) user."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(
            email="verified@example.com",
            password=TEST_USER_PASSWORD,
            is_verified=True,
            full_name="Verified User",
            role="underwriter",
        )
    )
    await db_session.commit()
    return user


async def get_jwt_token(client: AsyncClient, email: str, password: str) -> str:
    """Helper: login and return the JWT bearer token."""
    resp = await client.post(
        "/auth/jwt/login",
        data={"username": email, "password": password},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def jwt_token(async_client: AsyncClient, registered_user) -> str:
    return await get_jwt_token(async_client, TEST_USER_EMAIL, TEST_USER_PASSWORD)


@pytest_asyncio.fixture
async def superuser_token(async_client: AsyncClient, superuser) -> str:
    return await get_jwt_token(async_client, SUPERUSER_EMAIL, SUPERUSER_PASSWORD)


def auth_header(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Sample data helpers
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def sample_quote(db_session: AsyncSession) -> Quote:
    """Insert a minimal quote for admin-view tests."""
    q = Quote(
        id=str(uuid.uuid4()),
        insured_name="Acme Corp",
        deal_number="D-001",
        pl2_selection="general_liability",
        status=QuoteStatus.CALCULATED,
        technical_premium=50000.0,
        bound_premium=48000.0,
        input_data={"test": True},
        output_data={"calculated_values": {}},
    )
    db_session.add(q)
    await db_session.commit()
    await db_session.refresh(q)
    return q

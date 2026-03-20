"""TC-14.*  Superuser Seeding"""

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import User
from core.init_users import create_first_superuser, SUPERUSER_EMAIL, SUPERUSER_PASSWORD
from tests.conftest import TestSessionLocal


# TC-14.1
@pytest.mark.asyncio
async def test_superuser_created(db_session: AsyncSession):
    """Superuser created on first call."""
    await create_first_superuser(session_maker=TestSessionLocal)
    result = await db_session.execute(
        select(User).where(User.email == SUPERUSER_EMAIL)
    )
    user = result.scalar_one_or_none()
    assert user is not None
    assert user.is_superuser is True
    assert user.is_verified is True
    assert user.role == "admin"


# TC-14.2
@pytest.mark.asyncio
async def test_superuser_idempotent(db_session: AsyncSession):
    """Calling twice does not duplicate."""
    await create_first_superuser(session_maker=TestSessionLocal)
    await create_first_superuser(session_maker=TestSessionLocal)
    result = await db_session.execute(
        select(User).where(User.email == SUPERUSER_EMAIL)
    )
    users = result.scalars().all()
    assert len(users) == 1


# TC-14.3
@pytest.mark.asyncio
async def test_superuser_can_login(async_client):
    """Seeded superuser can login via JWT."""
    await create_first_superuser(session_maker=TestSessionLocal)

    resp = await async_client.post(
        "/auth/jwt/login",
        data={"username": SUPERUSER_EMAIL, "password": SUPERUSER_PASSWORD},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()

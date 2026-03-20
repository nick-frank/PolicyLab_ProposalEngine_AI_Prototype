"""TC-1.*  User Model & Database"""

import uuid

import pytest
import pytest_asyncio
from sqlalchemy import inspect, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Base
from core.models import User
from tests.conftest import test_engine, TestSessionLocal


# TC-1.1
@pytest.mark.asyncio
async def test_user_table_created(setup_database):
    """User table (and others) exist after init_db-equivalent."""
    async with test_engine.connect() as conn:
        table_names = await conn.run_sync(
            lambda sync_conn: inspect(sync_conn).get_table_names()
        )
    assert "user" in table_names
    assert "quotes" in table_names
    assert "audit_logs" in table_names
    assert "approvals" in table_names


# TC-1.2
@pytest.mark.asyncio
async def test_user_defaults(db_session: AsyncSession):
    """Default values applied when only email + hashed_password given."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(email="defaults@example.com", password="Passw0rd!")
    )
    await db_session.commit()

    assert user.is_active is True
    assert user.is_superuser is False
    assert user.is_verified is False
    assert user.role == "viewer"
    assert user.full_name is None


# TC-1.3
@pytest.mark.asyncio
async def test_email_uniqueness(db_session: AsyncSession):
    """Duplicate email raises IntegrityError."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    await manager.create(
        UserCreate(email="dup@example.com", password="Passw0rd!")
    )
    await db_session.commit()

    with pytest.raises(Exception):  # IntegrityError or UserAlreadyExists
        await manager.create(
            UserCreate(email="dup@example.com", password="Passw0rd!")
        )


# TC-1.4
@pytest.mark.asyncio
async def test_user_uuid_primary_key(db_session: AsyncSession):
    """User.id is a valid UUID."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(email="uuid@example.com", password="Passw0rd!")
    )
    await db_session.commit()

    # Should be a valid UUID
    parsed = uuid.UUID(str(user.id))
    assert parsed.version == 4


# TC-1.5
@pytest.mark.asyncio
async def test_custom_fields_persisted(db_session: AsyncSession):
    """full_name and role round-trip through DB."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(
            email="custom@example.com",
            password="Passw0rd!",
            full_name="Jane Doe",
            role="underwriter",
        )
    )
    await db_session.commit()

    result = await db_session.execute(select(User).where(User.id == user.id))
    loaded = result.scalar_one()
    assert loaded.full_name == "Jane Doe"
    assert loaded.role == "underwriter"

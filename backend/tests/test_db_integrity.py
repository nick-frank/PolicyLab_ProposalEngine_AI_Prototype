"""TC-18.*  Database Integrity"""

import uuid

import pytest
from sqlalchemy import inspect, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import User, Quote, QuoteStatus
from tests.conftest import test_engine, TestSessionLocal


# TC-18.1
@pytest.mark.asyncio
async def test_all_tables_coexist(setup_database):
    async with test_engine.connect() as conn:
        tables = await conn.run_sync(
            lambda c: inspect(c).get_table_names()
        )
    for name in ("user", "quotes", "audit_logs", "approvals"):
        assert name in tables, f"Missing table: {name}"


# TC-18.2
@pytest.mark.asyncio
async def test_deleting_user_does_not_cascade_to_quotes(db_session: AsyncSession):
    """Quote.created_by is a loose string, not a FK — deleting user keeps quote."""
    from core.users import UserManager, UserCreate
    from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase

    # Create user
    user_db = SQLAlchemyUserDatabase(db_session, User)
    manager = UserManager(user_db)
    user = await manager.create(
        UserCreate(email="willdelete@test.com", password="Passw0rd!")
    )
    await db_session.commit()

    # Create quote referencing user email in created_by
    q = Quote(
        id=str(uuid.uuid4()),
        insured_name="Widget Inc",
        pl2_selection="general_liability",
        status=QuoteStatus.DRAFT,
        created_by=user.email,
        input_data={},
    )
    db_session.add(q)
    await db_session.commit()
    quote_id = q.id

    # Delete user
    await manager.delete(user)
    await db_session.commit()

    # Quote still exists
    result = await db_session.execute(select(Quote).where(Quote.id == quote_id))
    assert result.scalar_one_or_none() is not None


# TC-18.3
@pytest.mark.asyncio
async def test_concurrent_sessions(db_session: AsyncSession):
    """Two sessions can insert quotes concurrently without deadlock."""
    async with TestSessionLocal() as s1, TestSessionLocal() as s2:
        q1 = Quote(
            id=str(uuid.uuid4()),
            insured_name="Corp A",
            pl2_selection="general_liability",
            status=QuoteStatus.DRAFT,
            input_data={},
        )
        q2 = Quote(
            id=str(uuid.uuid4()),
            insured_name="Corp B",
            pl2_selection="general_liability",
            status=QuoteStatus.DRAFT,
            input_data={},
        )
        s1.add(q1)
        s2.add(q2)
        await s1.commit()
        await s2.commit()

    # Both exist
    result = await db_session.execute(select(Quote))
    quotes = result.scalars().all()
    names = {q.insured_name for q in quotes}
    assert "Corp A" in names
    assert "Corp B" in names

"""Tests for demo data seeding."""

import pytest
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import (
    Submission, Proposal, ProposalRate, ProposalForm,
    LossRun, Document, SubmissionNote, ProposalNote,
    StructuredField, StatusEvent,
)
from core.init_seed_data import seed_demo_data
from tests.conftest import TestSessionLocal


@pytest.mark.asyncio
async def test_seed_creates_all_submissions(db_session: AsyncSession):
    """Seed creates exactly 9 submissions with correct reference numbers."""
    await seed_demo_data(session_maker=TestSessionLocal)
    result = await db_session.execute(select(Submission))
    submissions = result.scalars().all()
    assert len(submissions) == 9
    refs = sorted(s.reference_number for s in submissions)
    assert refs == [f"SUB-2026-{i:03d}" for i in range(1, 10)]


@pytest.mark.asyncio
async def test_seed_creates_proposals_and_children(db_session: AsyncSession):
    """Seed creates proposals, rates, forms, loss runs, and other child records."""
    await seed_demo_data(session_maker=TestSessionLocal)

    # 4 proposals
    result = await db_session.execute(select(func.count()).select_from(Proposal))
    assert result.scalar() == 4

    # 8 proposal rates
    result = await db_session.execute(select(func.count()).select_from(ProposalRate))
    assert result.scalar() == 8

    # 20 proposal forms
    result = await db_session.execute(select(func.count()).select_from(ProposalForm))
    assert result.scalar() == 20

    # 11 loss runs
    result = await db_session.execute(select(func.count()).select_from(LossRun))
    assert result.scalar() == 11

    # 9 documents
    result = await db_session.execute(select(func.count()).select_from(Document))
    assert result.scalar() == 9

    # 7 submission notes
    result = await db_session.execute(select(func.count()).select_from(SubmissionNote))
    assert result.scalar() == 7

    # 6 proposal notes
    result = await db_session.execute(select(func.count()).select_from(ProposalNote))
    assert result.scalar() == 6

    # 21 structured fields
    result = await db_session.execute(select(func.count()).select_from(StructuredField))
    assert result.scalar() == 21

    # 29 status events
    result = await db_session.execute(select(func.count()).select_from(StatusEvent))
    assert result.scalar() == 29


@pytest.mark.asyncio
async def test_seed_is_idempotent(db_session: AsyncSession):
    """Running seed twice does not duplicate records."""
    await seed_demo_data(session_maker=TestSessionLocal)
    await seed_demo_data(session_maker=TestSessionLocal)
    result = await db_session.execute(select(func.count()).select_from(Submission))
    assert result.scalar() == 9

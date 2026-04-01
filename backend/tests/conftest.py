"""
Shared fixtures for the auth / admin test suite.

Uses an in-memory SQLite database so tests are fast and isolated.
"""

import asyncio
import uuid
from datetime import datetime, date
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
from core.models import (
    User, Quote, QuoteStatus,
    Submission, SubmissionStatus,
    Proposal, ProposalStatus, RatingType,
    ProposalRate, ProposalForm,
    Document, ExtractionStatus,
    StructuredField, LossRun,
    SubmissionNote, NoteType,
    ProposalNote, StatusEvent,
)

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

    # Also override each view's session_maker (set during add_view)
    original_view_session_makers = {}
    for view in admin_instance._views:
        original_view_session_makers[id(view)] = view.session_maker
        view.session_maker = TestSessionLocal

    yield _app

    _app.dependency_overrides.clear()
    admin_instance.session_maker = original_session_maker
    for view in admin_instance._views:
        view.session_maker = original_view_session_makers[id(view)]


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


# ---------------------------------------------------------------------------
# Submission & Proposal sample fixtures
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def sample_submission(db_session: AsyncSession) -> Submission:
    """Insert a minimal submission for admin-view tests."""
    sub = Submission(
        id=str(uuid.uuid4()),
        reference_number="SUB-2026-001",
        status=SubmissionStatus.UNDER_REVIEW,
        insured_name="Pacific Coast Builders",
        dba="PCB Construction",
        fein="12-3456789",
        entity_type="LLC",
        primary_operations="General contracting, residential & commercial",
        naics_code="236220",
        naics_description="Commercial and Institutional Building Construction",
        years_in_business=15,
        number_of_employees=85,
        annual_revenue=12500000.0,
        subcontractor_pct=35.0,
        line_of_business="General Liability",
        territory="CA",
        estimated_premium=125000.0,
        effective_date=date(2026, 7, 1),
        expiration_date=date(2027, 7, 1),
        broker_name="Marsh McLennan",
        broker_contact="Sarah Johnson",
        underwriting_summary="Established contractor with solid loss history.",
        received_at=datetime(2026, 3, 15, 10, 30, 0),
    )
    db_session.add(sub)
    await db_session.commit()
    await db_session.refresh(sub)
    return sub


@pytest_asyncio.fixture
async def sample_proposal(db_session: AsyncSession, sample_submission: Submission) -> Proposal:
    """Insert a minimal proposal linked to sample_submission."""
    prop = Proposal(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        name="Standard GL Program",
        version=1,
        status=ProposalStatus.DRAFT,
        rating_type=RatingType.GL_RATER,
        line_of_business="General Liability",
        total_premium=118500.0,
        indicated_premium=125000.0,
        technical_premium=121000.0,
        policy_details={"deductible": 5000, "occurrence_limit": 1000000},
        output_data={"calculated": True},
        validation_results={"valid": True},
        created_at=datetime(2026, 3, 16, 9, 0, 0),
    )
    db_session.add(prop)
    await db_session.commit()
    await db_session.refresh(prop)
    return prop


@pytest_asyncio.fixture
async def sample_proposal_rate(db_session: AsyncSession, sample_proposal: Proposal) -> ProposalRate:
    """Insert a minimal proposal rate row."""
    rate = ProposalRate(
        id=str(uuid.uuid4()),
        proposal_id=sample_proposal.id,
        row_index=1,
        class_code="236220",
        class_code_description="Commercial Building Construction",
        zip_code="90210",
        location_number=1,
        territory="CA-01",
        subline="prem_ops",
        dominant_class_indicator=True,
        exposures=12500000.0,
        prior_year_exposures=11000000.0,
        exposure_base="revenue",
        premops_liquor_rate=0.0085,
        products_rate=0.0042,
        total_rate=0.0127,
        premops_liquor_prem=106250.0,
        products_premium=52500.0,
        technical_premium=121000.0,
    )
    db_session.add(rate)
    await db_session.commit()
    await db_session.refresh(rate)
    return rate


@pytest_asyncio.fixture
async def sample_proposal_form(db_session: AsyncSession, sample_proposal: Proposal) -> ProposalForm:
    """Insert a minimal proposal form."""
    form = ProposalForm(
        id=str(uuid.uuid4()),
        proposal_id=sample_proposal.id,
        form_number="CG 00 01",
        edition="04/13",
        form_name="Commercial General Liability Coverage Form",
        form_type="coverage",
        premium_adjustment=0.0,
        is_included=True,
        sort_order=1,
    )
    db_session.add(form)
    await db_session.commit()
    await db_session.refresh(form)
    return form


@pytest_asyncio.fixture
async def sample_document(db_session: AsyncSession, sample_submission: Submission) -> Document:
    """Insert a minimal document."""
    doc = Document(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        file_name="application.pdf",
        file_type="application/pdf",
        file_path="/uploads/submissions/application.pdf",
        file_size=2048576,
        uploaded_at=datetime(2026, 3, 15, 10, 35, 0),
        extraction_status=ExtractionStatus.COMPLETED,
        extraction_completed_at=datetime(2026, 3, 15, 10, 37, 0),
        extraction_confidence=0.92,
    )
    db_session.add(doc)
    await db_session.commit()
    await db_session.refresh(doc)
    return doc


@pytest_asyncio.fixture
async def sample_structured_field(
    db_session: AsyncSession,
    sample_submission: Submission,
    sample_document: Document,
) -> StructuredField:
    """Insert a minimal structured field."""
    field = StructuredField(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        document_id=sample_document.id,
        field_group="insured_info",
        field_name="Named Insured",
        extracted_value="Pacific Coast Builders LLC",
        confidence=0.95,
    )
    db_session.add(field)
    await db_session.commit()
    await db_session.refresh(field)
    return field


@pytest_asyncio.fixture
async def sample_loss_run(db_session: AsyncSession, sample_submission: Submission) -> LossRun:
    """Insert a minimal loss run."""
    lr = LossRun(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        policy_year="2024",
        carrier="Hartford",
        premium=110000.0,
        claim_count=3,
        incurred=45000.0,
        paid=30000.0,
        reserves=15000.0,
        loss_ratio=0.41,
        sort_order=1,
    )
    db_session.add(lr)
    await db_session.commit()
    await db_session.refresh(lr)
    return lr


@pytest_asyncio.fixture
async def sample_submission_note(db_session: AsyncSession, sample_submission: Submission) -> SubmissionNote:
    """Insert a minimal submission note."""
    note = SubmissionNote(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        note_type=NoteType.EMAIL_INBOUND,
        subject="Application Documents",
        body="Please find attached the completed application for Pacific Coast Builders.",
        from_address="sarah.johnson@marsh.com",
        to_address="underwriting@proposalengine.com",
        created_at=datetime(2026, 3, 15, 10, 30, 0),
    )
    db_session.add(note)
    await db_session.commit()
    await db_session.refresh(note)
    return note


@pytest_asyncio.fixture
async def sample_proposal_note(db_session: AsyncSession, sample_proposal: Proposal) -> ProposalNote:
    """Insert a minimal proposal note."""
    note = ProposalNote(
        id=str(uuid.uuid4()),
        proposal_id=sample_proposal.id,
        body="Initial rating completed. Reviewing class code assignments.",
        created_at=datetime(2026, 3, 16, 14, 0, 0),
    )
    db_session.add(note)
    await db_session.commit()
    await db_session.refresh(note)
    return note


@pytest_asyncio.fixture
async def sample_status_event(db_session: AsyncSession, sample_submission: Submission) -> StatusEvent:
    """Insert a minimal status event."""
    event = StatusEvent(
        id=str(uuid.uuid4()),
        submission_id=sample_submission.id,
        from_status="preparing_to_uw",
        to_status="ai_underwriting",
        description="AI underwriting started",
        actor_name="System",
        occurred_at=datetime(2026, 3, 15, 10, 30, 0),
    )
    db_session.add(event)
    await db_session.commit()
    await db_session.refresh(event)
    return event


# ---------------------------------------------------------------------------
# Full seed dataset (for integration / Playwright tests)
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture
async def seed_submissions(db_session: AsyncSession) -> dict:
    """Create 9 submissions + 4 proposals with representative child records."""
    submissions = []
    proposals = []

    submission_data = [
        ("SUB-2026-001", "Pacific Coast Builders", SubmissionStatus.UNDER_REVIEW, 125000.0),
        ("SUB-2026-002", "Metro Electrical Services", SubmissionStatus.PROPOSAL_PRODUCED, 85000.0),
        ("SUB-2026-003", "Summit Landscaping Inc", SubmissionStatus.PREPARING_TO_UW, 45000.0),
        ("SUB-2026-004", "Harbor Marine Services", SubmissionStatus.BOUND, 210000.0),
        ("SUB-2026-005", "Valley Plumbing Co", SubmissionStatus.AI_UNDERWRITING, 62000.0),
        ("SUB-2026-006", "Cascade HVAC Systems", SubmissionStatus.DECLINED, 95000.0),
        ("SUB-2026-007", "Pinnacle Roofing LLC", SubmissionStatus.READY_FOR_UW_REVIEW, 155000.0),
        ("SUB-2026-008", "Greenfield Paving", SubmissionStatus.BOUND, 78000.0),
        ("SUB-2026-009", "Ironworks Fabrication", SubmissionStatus.PREPARING_TO_UW, 112000.0),
    ]

    for ref, name, status, premium in submission_data:
        sub = Submission(
            id=str(uuid.uuid4()),
            reference_number=ref,
            status=status,
            insured_name=name,
            line_of_business="General Liability",
            territory="CA",
            estimated_premium=premium,
            broker_name="Marsh McLennan",
            received_at=datetime(2026, 3, 10, 9, 0, 0),
        )
        db_session.add(sub)
        submissions.append(sub)

    await db_session.flush()

    # 4 proposals across first 2 submissions
    proposal_data = [
        (submissions[0].id, "Standard GL Program", 1, ProposalStatus.DRAFT, 118500.0),
        (submissions[0].id, "Enhanced GL Program", 2, ProposalStatus.PENDING_APPROVAL, 135000.0),
        (submissions[1].id, "Electrical Contractor GL", 1, ProposalStatus.APPROVED, 82000.0),
        (submissions[1].id, "Electrical Contractor GL v2", 2, ProposalStatus.DRAFT, 79500.0),
    ]

    for sub_id, name, version, status, premium in proposal_data:
        prop = Proposal(
            id=str(uuid.uuid4()),
            submission_id=sub_id,
            name=name,
            version=version,
            status=status,
            rating_type=RatingType.GL_RATER,
            total_premium=premium,
            created_at=datetime(2026, 3, 12, 9, 0, 0),
        )
        db_session.add(prop)
        proposals.append(prop)

    await db_session.flush()

    # Add a document to the first submission
    doc = Document(
        id=str(uuid.uuid4()),
        submission_id=submissions[0].id,
        file_name="application.pdf",
        file_type="application/pdf",
        file_path="/uploads/seed/application.pdf",
        file_size=1024000,
        extraction_status=ExtractionStatus.COMPLETED,
        extraction_confidence=0.93,
    )
    db_session.add(doc)

    # Add a loss run to the first submission
    lr = LossRun(
        id=str(uuid.uuid4()),
        submission_id=submissions[0].id,
        policy_year="2024",
        carrier="Hartford",
        premium=110000.0,
        claim_count=3,
        incurred=45000.0,
        loss_ratio=0.41,
        sort_order=1,
    )
    db_session.add(lr)

    # Add a status event to the first submission
    evt = StatusEvent(
        id=str(uuid.uuid4()),
        submission_id=submissions[0].id,
        from_status="preparing_to_uw",
        to_status="ai_underwriting",
        description="AI underwriting started",
        actor_name="System",
    )
    db_session.add(evt)

    # Add a note to the first submission
    note = SubmissionNote(
        id=str(uuid.uuid4()),
        submission_id=submissions[0].id,
        note_type=NoteType.EMAIL_INBOUND,
        subject="Application received",
        body="New submission from Pacific Coast Builders.",
    )
    db_session.add(note)

    # Add a rate row to the first proposal
    rate = ProposalRate(
        id=str(uuid.uuid4()),
        proposal_id=proposals[0].id,
        row_index=1,
        class_code="236220",
        class_code_description="Commercial Building Construction",
        technical_premium=121000.0,
    )
    db_session.add(rate)

    # Add a form to the first proposal
    form = ProposalForm(
        id=str(uuid.uuid4()),
        proposal_id=proposals[0].id,
        form_number="CG 00 01",
        form_name="Commercial General Liability Coverage Form",
        is_included=True,
        sort_order=1,
    )
    db_session.add(form)

    await db_session.commit()

    return {
        "submissions": submissions,
        "proposals": proposals,
    }

"""
Seed the database with demo data matching the frontend mock data.

Data source: lib/mock-data/portal-submissions.ts
"""

from typing import Optional
from datetime import datetime, date

from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker

from core.database import AsyncSessionLocal
from core.models import (
    User, Submission, SubmissionStatus,
    Proposal, ProposalStatus,
    ProposalRate, ProposalForm,
    Document, ExtractionStatus,
    StructuredField, LossRun,
    SubmissionNote, NoteType,
    ProposalNote, StatusEvent,
)
from core.users import UserCreate, UserManager

DEMO_USERS = [
    ("sarah.chen@proposalengine.com", "Sarah Chen", "underwriter"),
    ("michael.torres@proposalengine.com", "Michael Torres", "underwriter"),
    ("jennifer.park@proposalengine.com", "Jennifer Park", "approver"),
    ("david.kim@proposalengine.com", "David Kim", "admin"),
]

DEMO_PASSWORD = "DemoPass123!"


async def seed_demo_data(
    session_maker: Optional[async_sessionmaker] = None,
) -> None:
    """Populate the database with demo data matching frontend mocks.

    Idempotent — checks for SUB-2026-001 before seeding.

    Args:
        session_maker: Override session factory (used by tests).
                       Defaults to AsyncSessionLocal from core.database.
    """
    factory = session_maker or AsyncSessionLocal
    async with factory() as session:
        # Idempotency check
        result = await session.execute(
            select(Submission).where(
                Submission.reference_number == "SUB-2026-001"
            )
        )
        if result.scalar_one_or_none() is not None:
            print("Demo data already seeded, skipping")
            return

        # --- Users -----------------------------------------------------------
        user_db = SQLAlchemyUserDatabase(session, User)
        manager = UserManager(user_db)
        users = {}
        for email, full_name, role in DEMO_USERS:
            existing = await user_db.get_by_email(email)
            if existing is not None:
                users[full_name] = existing
                continue
            user = await manager.create(
                UserCreate(
                    email=email,
                    password=DEMO_PASSWORD,
                    is_verified=True,
                    full_name=full_name,
                    role=role,
                )
            )
            users[full_name] = user

        sarah = users["Sarah Chen"]
        michael = users["Michael Torres"]
        jennifer = users["Jennifer Park"]

        sarah_id = str(sarah.id)
        michael_id = str(michael.id)
        jennifer_id = str(jennifer.id)

        # --- Submissions -----------------------------------------------------
        submission_defs = [
            {
                "id": "ps-001",
                "reference_number": "SUB-2026-001",
                "insured_name": "Pacific Coast Builders LLC",
                "status": SubmissionStatus.UNDER_REVIEW,
                "line_of_business": "General Liability",
                "estimated_premium": 45000.0,
                "underwriter_id": sarah_id,
                "approver_id": jennifer_id,
                "effective_date": date(2026, 4, 1),
                "expiration_date": date(2027, 4, 1),
                "broker_name": "Marsh McLennan",
                "territory": "CA",
                "naics_code": "236220",
                "naics_description": "Commercial Building Construction",
                "received_at": datetime(2026, 2, 15, 9, 30, 0),
                "updated_at": datetime(2026, 3, 10, 0, 0, 0),
            },
            {
                "id": "ps-002",
                "reference_number": "SUB-2026-002",
                "insured_name": "Meridian Tech Solutions Inc.",
                "status": SubmissionStatus.PROPOSAL_PRODUCED,
                "line_of_business": "Professional Liability",
                "estimated_premium": 28500.0,
                "underwriter_id": michael_id,
                "approver_id": jennifer_id,
                "effective_date": date(2026, 5, 1),
                "expiration_date": date(2027, 5, 1),
                "broker_name": "Aon Risk Solutions",
                "territory": "NY",
                "naics_code": "541512",
                "naics_description": "Computer Systems Design Services",
                "received_at": datetime(2026, 1, 20, 11, 0, 0),
                "updated_at": datetime(2026, 3, 8, 0, 0, 0),
            },
            {
                "id": "ps-003",
                "reference_number": "SUB-2026-003",
                "insured_name": "Summit Healthcare Group",
                "status": SubmissionStatus.BOUND,
                "line_of_business": "General Liability",
                "estimated_premium": 72000.0,
                "underwriter_id": sarah_id,
                "approver_id": jennifer_id,
                "effective_date": date(2026, 3, 1),
                "expiration_date": date(2027, 3, 1),
                "broker_name": "Willis Towers Watson",
                "territory": "TX",
                "naics_code": "621111",
                "naics_description": "Offices of Physicians",
                "received_at": datetime(2025, 12, 10, 14, 0, 0),
                "updated_at": datetime(2026, 2, 28, 0, 0, 0),
            },
            {
                "id": "ps-004",
                "reference_number": "SUB-2026-004",
                "insured_name": "Greenfield Manufacturing Co.",
                "status": SubmissionStatus.RECEIVED,
                "line_of_business": "Products Liability",
                "estimated_premium": 95000.0,
                "underwriter_id": michael_id,
                "effective_date": date(2026, 6, 1),
                "expiration_date": date(2027, 6, 1),
                "broker_name": "Lockton Companies",
                "territory": "OH",
                "naics_code": "332710",
                "naics_description": "Machine Shops",
                "received_at": datetime(2026, 3, 12, 8, 0, 0),
                "updated_at": datetime(2026, 3, 12, 0, 0, 0),
            },
            {
                "id": "ps-005",
                "reference_number": "SUB-2026-005",
                "insured_name": "Coastal Dining Group",
                "status": SubmissionStatus.DECLINED,
                "line_of_business": "General Liability",
                "estimated_premium": 18000.0,
                "underwriter_id": sarah_id,
                "effective_date": date(2026, 4, 15),
                "expiration_date": date(2027, 4, 15),
                "broker_name": "Brown & Brown",
                "territory": "FL",
                "naics_code": "722511",
                "naics_description": "Full-Service Restaurants",
                "received_at": datetime(2026, 2, 1, 10, 0, 0),
                "updated_at": datetime(2026, 2, 20, 0, 0, 0),
            },
            {
                "id": "ps-006",
                "reference_number": "SUB-2026-006",
                "insured_name": "Apex Security Services",
                "status": SubmissionStatus.OPEN,
                "line_of_business": "General Liability",
                "estimated_premium": 35000.0,
                "underwriter_id": michael_id,
                "effective_date": date(2026, 5, 15),
                "expiration_date": date(2027, 5, 15),
                "broker_name": "Gallagher",
                "territory": "IL",
                "naics_code": "561612",
                "naics_description": "Security Guards and Patrol Services",
                "received_at": datetime(2026, 3, 5, 13, 30, 0),
                "updated_at": datetime(2026, 3, 6, 0, 0, 0),
            },
            {
                "id": "ps-007",
                "reference_number": "SUB-2026-007",
                "insured_name": "Riverside Property Management",
                "status": SubmissionStatus.CLOSED,
                "line_of_business": "Property",
                "estimated_premium": 52000.0,
                "underwriter_id": sarah_id,
                "effective_date": date(2026, 1, 1),
                "expiration_date": date(2027, 1, 1),
                "broker_name": "Hub International",
                "territory": "AZ",
                "naics_code": "531311",
                "naics_description": "Residential Property Managers",
                "received_at": datetime(2025, 11, 15, 10, 0, 0),
                "updated_at": datetime(2026, 1, 30, 0, 0, 0),
            },
            {
                "id": "ps-008",
                "reference_number": "SUB-2026-008",
                "insured_name": "Northstar Logistics Inc.",
                "status": SubmissionStatus.UNDER_REVIEW,
                "line_of_business": "Umbrella/Excess",
                "estimated_premium": 125000.0,
                "underwriter_id": michael_id,
                "approver_id": jennifer_id,
                "effective_date": date(2026, 7, 1),
                "expiration_date": date(2027, 7, 1),
                "broker_name": "Marsh McLennan",
                "territory": "GA",
                "naics_code": "484121",
                "naics_description": "General Freight Trucking, Long-Distance",
                "received_at": datetime(2026, 2, 28, 9, 0, 0),
                "updated_at": datetime(2026, 3, 14, 0, 0, 0),
            },
            {
                "id": "ps-009",
                "reference_number": "SUB-2026-009",
                "insured_name": "BlueWave Cyber Consulting",
                "status": SubmissionStatus.RECEIVED,
                "line_of_business": "Cyber Liability",
                "estimated_premium": 41000.0,
                "underwriter_id": sarah_id,
                "effective_date": date(2026, 6, 1),
                "expiration_date": date(2027, 6, 1),
                "broker_name": "Aon Risk Solutions",
                "territory": "WA",
                "naics_code": "541519",
                "naics_description": "Other Computer Related Services",
                "received_at": datetime(2026, 3, 16, 15, 0, 0),
                "updated_at": datetime(2026, 3, 16, 0, 0, 0),
            },
        ]

        for sub_def in submission_defs:
            session.add(Submission(**sub_def))

        # --- Proposals -------------------------------------------------------
        proposal_defs = [
            {
                "id": "prop-001",
                "submission_id": "ps-001",
                "name": "Standard GL Program",
                "version": 1,
                "status": ProposalStatus.DRAFT,
                "total_premium": 45000.0,
                "indicated_premium": 38000.0,
                "created_at": datetime(2026, 3, 10, 0, 0, 0),
                "created_by": sarah_id,
            },
            {
                "id": "prop-002",
                "submission_id": "ps-002",
                "name": "Good \u2014 Essential Coverage",
                "version": 1,
                "status": ProposalStatus.APPROVED,
                "total_premium": 22000.0,
                "indicated_premium": 20000.0,
                "created_at": datetime(2026, 3, 1, 0, 0, 0),
                "created_by": michael_id,
            },
            {
                "id": "prop-003",
                "submission_id": "ps-002",
                "name": "Better \u2014 Enhanced Coverage",
                "version": 2,
                "status": ProposalStatus.PENDING_APPROVAL,
                "total_premium": 28500.0,
                "indicated_premium": 24000.0,
                "created_at": datetime(2026, 3, 8, 0, 0, 0),
                "created_by": michael_id,
            },
            {
                "id": "prop-004",
                "submission_id": "ps-003",
                "name": "Healthcare GL Program",
                "version": 1,
                "status": ProposalStatus.APPROVED,
                "total_premium": 72000.0,
                "indicated_premium": 62000.0,
                "created_at": datetime(2026, 1, 15, 0, 0, 0),
                "created_by": sarah_id,
            },
        ]

        for prop_def in proposal_defs:
            session.add(Proposal(**prop_def))

        # --- Proposal Rates --------------------------------------------------
        rate_defs = [
            # prop-001
            {"id": "pr-001", "proposal_id": "prop-001", "row_index": 1, "class_code": "91580", "class_code_description": "Contractors \u2014 General (Subcontracted Work)", "territory": "CA-01", "base_rate": 12.50, "exposures": 1500000, "exposure_base": "Payroll", "manual_premium": 18750, "lcm": 1.20, "adjusted_premium": 22500},
            {"id": "pr-002", "proposal_id": "prop-001", "row_index": 2, "class_code": "91340", "class_code_description": "Contractors \u2014 Carpentry", "territory": "CA-01", "base_rate": 8.75, "exposures": 800000, "exposure_base": "Payroll", "manual_premium": 7000, "lcm": 1.10, "adjusted_premium": 7700},
            {"id": "pr-003", "proposal_id": "prop-001", "row_index": 3, "class_code": "91150", "class_code_description": "Contractors \u2014 Concrete Work", "territory": "CA-01", "base_rate": 15.20, "exposures": 600000, "exposure_base": "Payroll", "manual_premium": 9120, "lcm": 1.15, "adjusted_premium": 10488},
            # prop-002
            {"id": "pr-004", "proposal_id": "prop-002", "row_index": 1, "class_code": "41677", "class_code_description": "Computer Consulting Services", "territory": "NY-01", "base_rate": 5.25, "exposures": 3200000, "exposure_base": "Revenue", "manual_premium": 16800, "lcm": 1.00, "adjusted_premium": 16800},
            # prop-003
            {"id": "pr-005", "proposal_id": "prop-003", "row_index": 1, "class_code": "41677", "class_code_description": "Computer Consulting Services", "territory": "NY-01", "base_rate": 5.25, "exposures": 3200000, "exposure_base": "Revenue", "manual_premium": 16800, "lcm": 1.00, "adjusted_premium": 16800},
            {"id": "pr-006", "proposal_id": "prop-003", "row_index": 2, "class_code": "41675", "class_code_description": "Software Development", "territory": "NY-01", "base_rate": 4.80, "exposures": 1800000, "exposure_base": "Revenue", "manual_premium": 8640, "lcm": 0.95, "adjusted_premium": 8208},
            # prop-004
            {"id": "pr-007", "proposal_id": "prop-004", "row_index": 1, "class_code": "64074", "class_code_description": "Physicians \u2014 General Practice", "territory": "TX-01", "base_rate": 18.00, "exposures": 2500000, "exposure_base": "Revenue", "manual_premium": 45000, "lcm": 1.25, "adjusted_premium": 56250},
            {"id": "pr-008", "proposal_id": "prop-004", "row_index": 2, "class_code": "64073", "class_code_description": "Physicians \u2014 Clinics", "territory": "TX-01", "base_rate": 10.50, "exposures": 1200000, "exposure_base": "Revenue", "manual_premium": 12600, "lcm": 1.10, "adjusted_premium": 13860},
        ]

        for rate_def in rate_defs:
            session.add(ProposalRate(**rate_def))

        # --- Proposal Forms --------------------------------------------------
        form_defs = [
            # prop-001 (8 forms)
            {"id": "pf-001-01", "proposal_id": "prop-001", "form_number": "MJIL 1000", "edition": "08 10", "form_name": "Policy Jacket (Evanston)", "form_type": "policy", "sort_order": 1},
            {"id": "pf-001-02", "proposal_id": "prop-001", "form_number": "MDIL 1000", "edition": "08 11", "form_name": "Common Policy Declaration", "form_type": "policy", "sort_order": 2},
            {"id": "pf-001-03", "proposal_id": "prop-001", "form_number": "IL 00 17", "edition": "11 98", "form_name": "Common Policy Conditions", "form_type": "policy", "sort_order": 3},
            {"id": "pf-001-04", "proposal_id": "prop-001", "form_number": "IL 00 21", "edition": "09 08", "form_name": "Nuclear Energy Liability Exclusion Endorsement", "form_type": "exclusion", "sort_order": 4},
            {"id": "pf-001-05", "proposal_id": "prop-001", "form_number": "CG 00 01", "edition": "04 13", "form_name": "Commercial General Liability Coverage Form", "form_type": "coverage", "sort_order": 5},
            {"id": "pf-001-06", "proposal_id": "prop-001", "form_number": "MDGL 1008", "edition": "08 11", "form_name": "Commercial General Liability Coverage Part Declarations", "form_type": "coverage", "sort_order": 6},
            {"id": "pf-001-07", "proposal_id": "prop-001", "form_number": "CG 21 06", "edition": "05 14", "form_name": "Exclusion \u2014 Access or Disclosure of Confidential Information", "form_type": "exclusion", "premium_adjustment": -1900.0, "sort_order": 7},
            {"id": "pf-001-08", "proposal_id": "prop-001", "form_number": "CG 24 04", "edition": "05 09", "form_name": "Waiver of Transfer of Rights of Recovery Against Others", "form_type": "endorsement", "premium_adjustment": 1140.0, "sort_order": 8},
            # prop-002 (3 forms)
            {"id": "pf-002-01", "proposal_id": "prop-002", "form_number": "MJIL 1000", "edition": "08 10", "form_name": "Policy Jacket (Evanston)", "form_type": "policy", "sort_order": 1},
            {"id": "pf-002-02", "proposal_id": "prop-002", "form_number": "PL 00 01", "edition": "01 15", "form_name": "Professional Liability Coverage Form", "form_type": "coverage", "sort_order": 2},
            {"id": "pf-002-03", "proposal_id": "prop-002", "form_number": "PL 21 01", "edition": "01 15", "form_name": "Technology E&O Extension", "form_type": "endorsement", "premium_adjustment": 2000.0, "sort_order": 3},
            # prop-003 (4 forms)
            {"id": "pf-003-01", "proposal_id": "prop-003", "form_number": "MJIL 1000", "edition": "08 10", "form_name": "Policy Jacket (Evanston)", "form_type": "policy", "sort_order": 1},
            {"id": "pf-003-02", "proposal_id": "prop-003", "form_number": "PL 00 01", "edition": "01 15", "form_name": "Professional Liability Coverage Form", "form_type": "coverage", "sort_order": 2},
            {"id": "pf-003-03", "proposal_id": "prop-003", "form_number": "PL 21 01", "edition": "01 15", "form_name": "Technology E&O Extension", "form_type": "endorsement", "premium_adjustment": 2400.0, "sort_order": 3},
            {"id": "pf-003-04", "proposal_id": "prop-003", "form_number": "PL 22 03", "edition": "03 20", "form_name": "Cyber Incident Response Coverage", "form_type": "endorsement", "premium_adjustment": 1100.0, "sort_order": 4},
            # prop-004 (5 forms)
            {"id": "pf-004-01", "proposal_id": "prop-004", "form_number": "MJIL 1000", "edition": "08 10", "form_name": "Policy Jacket (Evanston)", "form_type": "policy", "sort_order": 1},
            {"id": "pf-004-02", "proposal_id": "prop-004", "form_number": "CG 00 01", "edition": "04 13", "form_name": "Commercial General Liability Coverage Form", "form_type": "coverage", "sort_order": 2},
            {"id": "pf-004-03", "proposal_id": "prop-004", "form_number": "CG 22 79", "edition": "04 13", "form_name": "Abuse or Molestation Exclusion", "form_type": "exclusion", "premium_adjustment": -4960.0, "sort_order": 3},
            {"id": "pf-004-04", "proposal_id": "prop-004", "form_number": "CG 04 35", "edition": "04 13", "form_name": "Employee Benefits Liability Coverage", "form_type": "endorsement", "premium_adjustment": 9300.0, "sort_order": 4},
            {"id": "pf-004-05", "proposal_id": "prop-004", "form_number": "IL 00 21", "edition": "09 08", "form_name": "Nuclear Energy Liability Exclusion", "form_type": "exclusion", "sort_order": 5},
        ]

        for form_def in form_defs:
            session.add(ProposalForm(**form_def))

        # --- Loss Runs -------------------------------------------------------
        loss_run_defs = [
            # ps-001 (5 loss runs)
            {"id": "lr-001", "submission_id": "ps-001", "policy_year": "2023-2024", "carrier": "Hartford", "premium": 38000.0, "claim_count": 2, "incurred": 12500.0, "paid": 10000.0, "reserves": 2500.0, "loss_ratio": 0.329, "sort_order": 1},
            {"id": "lr-002", "submission_id": "ps-001", "policy_year": "2022-2023", "carrier": "Hartford", "premium": 35000.0, "claim_count": 1, "incurred": 5200.0, "paid": 5200.0, "reserves": 0.0, "loss_ratio": 0.149, "sort_order": 2},
            {"id": "lr-003", "submission_id": "ps-001", "policy_year": "2021-2022", "carrier": "CNA", "premium": 32000.0, "claim_count": 3, "incurred": 28000.0, "paid": 25000.0, "reserves": 3000.0, "loss_ratio": 0.875, "sort_order": 3},
            {"id": "lr-004", "submission_id": "ps-001", "policy_year": "2020-2021", "carrier": "CNA", "premium": 30000.0, "claim_count": 0, "incurred": 0.0, "paid": 0.0, "reserves": 0.0, "loss_ratio": 0.0, "sort_order": 4},
            {"id": "lr-005", "submission_id": "ps-001", "policy_year": "2019-2020", "carrier": "CNA", "premium": 28000.0, "claim_count": 1, "incurred": 8500.0, "paid": 8500.0, "reserves": 0.0, "loss_ratio": 0.304, "sort_order": 5},
            # ps-002 (3 loss runs)
            {"id": "lr-006", "submission_id": "ps-002", "policy_year": "2023-2024", "carrier": "Travelers", "premium": 25000.0, "claim_count": 0, "incurred": 0.0, "paid": 0.0, "reserves": 0.0, "loss_ratio": 0.0, "sort_order": 1},
            {"id": "lr-007", "submission_id": "ps-002", "policy_year": "2022-2023", "carrier": "Travelers", "premium": 22000.0, "claim_count": 1, "incurred": 15000.0, "paid": 15000.0, "reserves": 0.0, "loss_ratio": 0.682, "sort_order": 2},
            {"id": "lr-008", "submission_id": "ps-002", "policy_year": "2021-2022", "carrier": "Zurich", "premium": 20000.0, "claim_count": 0, "incurred": 0.0, "paid": 0.0, "reserves": 0.0, "loss_ratio": 0.0, "sort_order": 3},
            # ps-003 (3 loss runs)
            {"id": "lr-009", "submission_id": "ps-003", "policy_year": "2023-2024", "carrier": "Berkley", "premium": 65000.0, "claim_count": 4, "incurred": 42000.0, "paid": 35000.0, "reserves": 7000.0, "loss_ratio": 0.646, "sort_order": 1},
            {"id": "lr-010", "submission_id": "ps-003", "policy_year": "2022-2023", "carrier": "Berkley", "premium": 60000.0, "claim_count": 2, "incurred": 18000.0, "paid": 18000.0, "reserves": 0.0, "loss_ratio": 0.300, "sort_order": 2},
            {"id": "lr-011", "submission_id": "ps-003", "policy_year": "2021-2022", "carrier": "Markel", "premium": 55000.0, "claim_count": 3, "incurred": 31000.0, "paid": 28000.0, "reserves": 3000.0, "loss_ratio": 0.564, "sort_order": 3},
        ]

        for lr_def in loss_run_defs:
            session.add(LossRun(**lr_def))

        # --- Documents -------------------------------------------------------
        doc_defs = [
            # ps-001 (4 documents)
            {"id": "d-001", "submission_id": "ps-001", "file_name": "ACORD_125_Application.pdf", "file_type": "application/pdf", "file_size": 2516582, "uploaded_at": datetime(2026, 2, 15, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.95},
            {"id": "d-002", "submission_id": "ps-001", "file_name": "Loss_Runs_2019-2024.pdf", "file_type": "application/pdf", "file_size": 1887436, "uploaded_at": datetime(2026, 2, 15, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.92},
            {"id": "d-003", "submission_id": "ps-001", "file_name": "Equipment_Schedule.xlsx", "file_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "file_size": 460800, "uploaded_at": datetime(2026, 2, 18, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.90},
            {"id": "d-004", "submission_id": "ps-001", "file_name": "Broker_Supplemental_Notes.pdf", "file_type": "application/pdf", "file_size": 327680, "uploaded_at": datetime(2026, 3, 1, 0, 0, 0), "extraction_status": ExtractionStatus.PROCESSING},
            # ps-002 (3 documents)
            {"id": "d-005", "submission_id": "ps-002", "file_name": "ACORD_125_Application.pdf", "file_type": "application/pdf", "file_size": 1992294, "uploaded_at": datetime(2026, 1, 20, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.94},
            {"id": "d-006", "submission_id": "ps-002", "file_name": "Loss_Runs_2021-2024.pdf", "file_type": "application/pdf", "file_size": 1003520, "uploaded_at": datetime(2026, 1, 20, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.91},
            {"id": "d-007", "submission_id": "ps-002", "file_name": "SOC2_Compliance_Report.pdf", "file_type": "application/pdf", "file_size": 3250585, "uploaded_at": datetime(2026, 1, 25, 0, 0, 0), "extraction_status": ExtractionStatus.COMPLETED, "extraction_confidence": 0.88},
            # ps-004 (2 documents)
            {"id": "d-008", "submission_id": "ps-004", "file_name": "ACORD_125_Application.pdf", "file_type": "application/pdf", "file_size": 2202009, "uploaded_at": datetime(2026, 3, 12, 0, 0, 0), "extraction_status": ExtractionStatus.PENDING},
            {"id": "d-009", "submission_id": "ps-004", "file_name": "Product_Catalog.pdf", "file_type": "application/pdf", "file_size": 5872025, "uploaded_at": datetime(2026, 3, 12, 0, 0, 0), "extraction_status": ExtractionStatus.FAILED},
        ]

        for doc_def in doc_defs:
            session.add(Document(**doc_def))

        # --- Submission Notes ------------------------------------------------
        sub_note_defs = [
            # ps-001
            {"id": "n-001", "submission_id": "ps-001", "note_type": NoteType.INTERNAL, "body": "Reviewed loss runs \u2014 the 2021-2022 year is concerning with 87.5% loss ratio driven by scaffolding incident. Need to verify safety protocols have been updated.", "author_id": sarah_id, "created_at": datetime(2026, 3, 10, 14, 30, 0)},
            {"id": "n-002", "submission_id": "ps-001", "note_type": NoteType.EMAIL_OUTBOUND, "subject": "RE: Pacific Coast Builders \u2014 Additional Information Needed", "body": "Hi Tom, could you provide updated safety program documentation and any OSHA inspection reports from the past 2 years? Also need confirmation on the subcontractor management program. Thanks, Sarah", "from_address": "sarah.chen@markel.com", "to_address": "tom.broker@marsh.com", "author_id": sarah_id, "created_at": datetime(2026, 3, 5, 10, 0, 0)},
            {"id": "n-003", "submission_id": "ps-001", "note_type": NoteType.EMAIL_INBOUND, "subject": "RE: Pacific Coast Builders \u2014 Additional Information Needed", "body": "Sarah, attached are the safety program docs and OSHA reports. Clean record since the 2021 incident. They implemented a comprehensive fall protection program in Q1 2022. Subcontractor qualification docs to follow. \u2014 Tom", "from_address": "tom.broker@marsh.com", "to_address": "sarah.chen@markel.com", "created_at": datetime(2026, 3, 7, 16, 15, 0)},
            {"id": "n-004", "submission_id": "ps-001", "note_type": NoteType.INTERNAL, "body": "Initial review complete. Application looks complete, 3 California locations. Contractor class \u2014 need to verify subcontractor percentage.", "author_id": sarah_id, "created_at": datetime(2026, 3, 1, 9, 0, 0)},
            # ps-002
            {"id": "n-005", "submission_id": "ps-002", "note_type": NoteType.INTERNAL, "body": "Created Good/Better/Best proposals. The \u2018Better\u2019 option includes cyber incident response which aligns well with their SOC2 compliance. Recommending this tier.", "author_id": michael_id, "created_at": datetime(2026, 3, 8, 16, 0, 0)},
            {"id": "n-006", "submission_id": "ps-002", "note_type": NoteType.INTERNAL, "body": "Tech company with strong risk management. SOC2 certified. Clean loss history except one E&O claim in 2022-2023 that was resolved favorably.", "author_id": michael_id, "created_at": datetime(2026, 2, 5, 9, 30, 0)},
            # ps-005
            {"id": "n-007", "submission_id": "ps-005", "note_type": NoteType.INTERNAL, "body": "Declining \u2014 3 liquor liability claims in 2 years, total incurred exceeds $85K. Loss ratio over 150%. Outside our restaurant program appetite guidelines.", "author_id": sarah_id, "created_at": datetime(2026, 2, 20, 14, 0, 0)},
        ]

        for note_def in sub_note_defs:
            session.add(SubmissionNote(**note_def))

        # --- Proposal Notes --------------------------------------------------
        prop_note_defs = [
            # prop-001
            {"id": "pn-001", "proposal_id": "prop-001", "body": "Standard GL program drafted for Pacific Coast Builders. Using occurrence form CG 00 01 with blanket additional insured and waiver of subrogation.", "author_id": sarah_id, "created_at": datetime(2026, 3, 10, 15, 0, 0)},
            {"id": "pn-002", "proposal_id": "prop-001", "body": "Applied cyber exclusion credit (-5%) and waiver of subrogation charge (+3%). Net adjustment is reasonable for this class.", "author_id": sarah_id, "created_at": datetime(2026, 3, 10, 14, 45, 0)},
            # prop-002
            {"id": "pn-003", "proposal_id": "prop-002", "body": "Essential coverage tier \u2014 base professional liability with Tech E&O extension. Good entry-level option for the broker to present.", "author_id": michael_id, "created_at": datetime(2026, 3, 1, 11, 0, 0)},
            # prop-003
            {"id": "pn-004", "proposal_id": "prop-003", "body": "Enhanced coverage tier adds cyber incident response. This is the recommended option given their SOC2 compliance posture.", "author_id": michael_id, "created_at": datetime(2026, 3, 8, 16, 30, 0)},
            {"id": "pn-005", "proposal_id": "prop-003", "body": "Reviewed the Better tier. Premium looks competitive. Pending approval \u2014 waiting for final loss run confirmation.", "author_id": jennifer_id, "created_at": datetime(2026, 3, 9, 10, 0, 0)},
            # prop-004
            {"id": "pn-006", "proposal_id": "prop-004", "body": "Healthcare GL program with EBL coverage and abuse/molestation exclusion. Standard healthcare package for physician group.", "author_id": sarah_id, "created_at": datetime(2026, 1, 15, 11, 30, 0)},
        ]

        for note_def in prop_note_defs:
            session.add(ProposalNote(**note_def))

        # --- Structured Fields -----------------------------------------------
        sf_defs = [
            # ps-001 (14 fields, linked to document d-001)
            {"id": "sf-001", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Insured Information", "field_name": "Named Insured", "extracted_value": "Pacific Coast Builders LLC", "confidence": 0.98},
            {"id": "sf-002", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Insured Information", "field_name": "DBA", "extracted_value": "PCB Construction", "confidence": 0.92},
            {"id": "sf-003", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Insured Information", "field_name": "FEIN", "extracted_value": "94-3456789", "confidence": 0.95},
            {"id": "sf-004", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Insured Information", "field_name": "Entity Type", "extracted_value": "LLC", "confidence": 0.99},
            {"id": "sf-005", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Operations", "field_name": "Primary Operations", "extracted_value": "Commercial building construction, tenant improvements", "confidence": 0.88},
            {"id": "sf-006", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Operations", "field_name": "Years in Business", "extracted_value": "12", "confidence": 0.94},
            {"id": "sf-007", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Operations", "field_name": "Number of Employees", "extracted_value": "45", "confidence": 0.91},
            {"id": "sf-008", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Operations", "field_name": "Annual Revenue", "extracted_value": "$4,200,000", "confidence": 0.96},
            {"id": "sf-009", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Operations", "field_name": "Subcontractor %", "extracted_value": "35%", "confidence": 0.78},
            {"id": "sf-010", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Locations", "field_name": "Number of Locations", "extracted_value": "3", "confidence": 0.97},
            {"id": "sf-011", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Locations", "field_name": "Primary Address", "extracted_value": "1500 Industrial Pkwy, San Jose, CA 95131", "confidence": 0.93},
            {"id": "sf-012", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Coverage", "field_name": "GL Occurrence Limit", "extracted_value": "$1,000,000", "confidence": 0.99},
            {"id": "sf-013", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Coverage", "field_name": "GL Aggregate Limit", "extracted_value": "$2,000,000", "confidence": 0.99},
            {"id": "sf-014", "submission_id": "ps-001", "document_id": "d-001", "field_group": "Coverage", "field_name": "Products/Completed Ops Aggregate", "extracted_value": "$2,000,000", "confidence": 0.97},
            # ps-002 (7 fields, linked to document d-005)
            {"id": "sf-015", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Insured Information", "field_name": "Named Insured", "extracted_value": "Meridian Tech Solutions Inc.", "confidence": 0.99},
            {"id": "sf-016", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Insured Information", "field_name": "FEIN", "extracted_value": "13-7890123", "confidence": 0.96},
            {"id": "sf-017", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Operations", "field_name": "Primary Operations", "extracted_value": "IT consulting and custom software development", "confidence": 0.90},
            {"id": "sf-018", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Operations", "field_name": "Number of Employees", "extracted_value": "85", "confidence": 0.93},
            {"id": "sf-019", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Operations", "field_name": "Annual Revenue", "extracted_value": "$8,500,000", "confidence": 0.95},
            {"id": "sf-020", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Coverage", "field_name": "PL Per Claim Limit", "extracted_value": "$1,000,000", "confidence": 0.98},
            {"id": "sf-021", "submission_id": "ps-002", "document_id": "d-005", "field_group": "Coverage", "field_name": "PL Aggregate Limit", "extracted_value": "$2,000,000", "confidence": 0.98},
        ]

        for sf_def in sf_defs:
            session.add(StructuredField(**sf_def))

        # --- Status Events ---------------------------------------------------
        user_id_map = {
            "Sarah Chen": sarah_id,
            "Michael Torres": michael_id,
            "Jennifer Park": jennifer_id,
            "System": None,
        }

        timeline_data = [
            ("ps-001", [
                (None, "received", "2026-02-15T09:30:00", "System", None),
                ("received", "open", "2026-02-16T10:15:00", "Sarah Chen", "Assigned for review"),
                ("open", "under_review", "2026-03-01T14:00:00", "Sarah Chen", "Reviewing loss runs and application"),
            ]),
            ("ps-002", [
                (None, "received", "2026-01-20T11:00:00", "System", None),
                ("received", "open", "2026-01-21T08:30:00", "Michael Torres", None),
                ("open", "under_review", "2026-02-05T09:00:00", "Michael Torres", None),
                ("under_review", "proposal_produced", "2026-03-08T16:45:00", "Michael Torres", "Good/Better/Best options created"),
            ]),
            ("ps-003", [
                (None, "received", "2025-12-10T14:00:00", "System", None),
                ("received", "open", "2025-12-11T09:00:00", "Sarah Chen", None),
                ("open", "under_review", "2025-12-20T10:30:00", "Sarah Chen", None),
                ("under_review", "proposal_produced", "2026-01-15T11:00:00", "Sarah Chen", None),
                ("proposal_produced", "bound", "2026-02-28T15:30:00", "Jennifer Park", "Broker accepted proposal"),
            ]),
            ("ps-004", [
                (None, "received", "2026-03-12T08:00:00", "System", None),
            ]),
            ("ps-005", [
                (None, "received", "2026-02-01T10:00:00", "System", None),
                ("received", "open", "2026-02-02T09:15:00", "Sarah Chen", None),
                ("open", "under_review", "2026-02-10T11:00:00", "Sarah Chen", None),
                ("under_review", "declined", "2026-02-20T14:00:00", "Sarah Chen", "Loss history outside appetite \u2014 3 liquor liability claims in 2 years"),
            ]),
            ("ps-006", [
                (None, "received", "2026-03-05T13:30:00", "System", None),
                ("received", "open", "2026-03-06T08:00:00", "Michael Torres", "Initial document review"),
            ]),
            ("ps-007", [
                (None, "received", "2025-11-15T10:00:00", "System", None),
                ("received", "open", "2025-11-16T09:00:00", "Sarah Chen", None),
                ("open", "under_review", "2025-11-25T10:00:00", "Sarah Chen", None),
                ("under_review", "proposal_produced", "2025-12-10T14:00:00", "Sarah Chen", None),
                ("proposal_produced", "bound", "2025-12-28T11:00:00", "Jennifer Park", None),
                ("bound", "closed", "2026-01-30T16:00:00", "System", "Policy issued \u2014 file closed"),
            ]),
            ("ps-008", [
                (None, "received", "2026-02-28T09:00:00", "System", None),
                ("received", "open", "2026-03-01T10:30:00", "Michael Torres", None),
                ("open", "under_review", "2026-03-14T09:00:00", "Michael Torres", "Reviewing umbrella attachment point"),
            ]),
            ("ps-009", [
                (None, "received", "2026-03-16T15:00:00", "System", None),
            ]),
        ]

        evt_counter = 0
        for sub_id, events in timeline_data:
            for from_status, to_status, ts, actor_name, description in events:
                evt_counter += 1
                occurred = datetime.fromisoformat(ts)
                session.add(StatusEvent(
                    id=f"evt-{evt_counter:03d}",
                    submission_id=sub_id,
                    from_status=from_status,
                    to_status=to_status,
                    description=description,
                    actor_id=user_id_map.get(actor_name),
                    actor_name=actor_name,
                    occurred_at=occurred,
                    created_at=occurred,
                ))

        await session.commit()

        print(
            f"Seeded 9 submissions, 4 proposals, 8 rates, "
            f"20 forms, 11 loss runs, 9 documents, 7 submission notes, "
            f"6 proposal notes, 21 structured fields, {evt_counter} status events"
        )

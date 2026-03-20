can# Backend Data Model Plan — Submissions & Proposals Engine

> Generated via Playwright interrogation of `http://localhost:3000/submissions` and all sub-pages.
> Date: 2026-03-20 | Branch: `feature/init_backend_datamodel`

---

## 1. Pages Crawled & UI Inventory

| URL Pattern | Page | Key UI Elements |
|---|---|---|
| `/submissions` | Submission Portal | KPI cards (Total, Active, Proposals This Month), status filter tabs, search, LOB/Underwriter dropdowns, 9-column table |
| `/submissions/proposals` | Proposals List | KPI cards (Total, Approved, Pending), status filter tabs, search, 8-column table |
| `/submissions/ps-{id}` | Submission Detail | 5 tabs: Overview, Documents, Loss Runs, Submission Notes, Structured Data |
| `/submissions/ps-{id}/proposals/prop-{id}` | Proposal Detail (GL Rater) | Policy Level Details form, 20-row Class & Territory table, 3 tabs: Rates, Proposal Notes, Forms |
| `/submissions/ps-{id}/proposals/prop-{id}` | Proposal Detail (PL Rating) | Simplified Rating Table, 3 tabs: Rates, Proposal Notes, Forms |

---

## 2. Entity Relationship Diagram (ASCII)

```
                                  ┌──────────────┐
                                  │     User     │
                                  │  (existing)  │
                                  └──────┬───────┘
                                         │ assigned_to / created_by
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
┌──────────────────┐         ┌───────────────────┐          ┌─────────────────┐
│   Submission     │ 1────M  │    Proposal       │ 1────M   │  StatusEvent    │
│                  │─────────│                   │          │                 │
└────────┬─────────┘         └───────┬───────────┘          └─────────────────┘
         │                           │
         │ 1──M                      │ 1──M
         ▼                           ▼
┌──────────────────┐         ┌───────────────────┐
│   Document       │         │  ProposalRate     │
│                  │         │  (ClassRow)       │
└────────┬─────────┘         └───────────────────┘
         │ 1──M                      │
         ▼                           │ 1──M
┌──────────────────┐                 ▼
│ StructuredField  │         ┌───────────────────┐
│ (extracted data) │         │  ProposalForm     │
└──────────────────┘         └───────────────────┘

┌──────────────────┐         ┌───────────────────┐
│   LossRun        │ M──1    │  SubmissionNote   │ M──1
│                  │─────┐   │                   │─────┐
└──────────────────┘     │   └───────────────────┘     │
                         │                              │
                         └────► Submission ◄────────────┘

┌──────────────────┐         ┌───────────────────┐
│  ProposalNote    │ M──1    │    Approval       │ M──1
│                  │─────┐   │   (existing)      │─────┐
└──────────────────┘     │   └───────────────────┘     │
                         │                              │
                         └────► Proposal ◄──────────────┘

┌──────────────────┐
│   AuditLog       │  (existing — re-pointed to Submission + Proposal)
│                  │
└──────────────────┘
```

---

## 3. Model Definitions

### 3.1 Submission (NEW)

The central intake entity. Represents an insurance application received from a broker.

**Source UI**: `/submissions` table + `/submissions/ps-{id}` detail page

```
Submission
├── id                    UUID, PK
├── reference_number      String, unique (e.g. "SUB-2026-001")
├── status                Enum: received | open | under_review | proposal_produced | bound | declined | closed
│
├── # Insured Info (from Overview → Key Information card)
├── insured_name          String, required
├── dba                   String, nullable
├── fein                  String, nullable  (Federal EIN)
├── entity_type           String, nullable  (LLC, Corp, etc.)
├── primary_operations    Text, nullable
├── naics_code            String, nullable  (e.g. "236220")
├── naics_description     String, nullable  (e.g. "Commercial Building Construction")
├── years_in_business     Integer, nullable
├── number_of_employees   Integer, nullable
├── annual_revenue        Decimal, nullable
├── subcontractor_pct     Float, nullable   (0-100)
│
├── # Policy & Assignment
├── line_of_business      String, required  (General Liability, Professional Liability, Cyber, etc.)
├── territory             String, nullable  (state abbreviation: CA, NY, TX)
├── estimated_premium     Decimal, nullable (from initial submission)
├── effective_date        Date, nullable
├── expiration_date       Date, nullable
│
├── # Participants
├── underwriter_id        UUID, FK → User, nullable
├── approver_id           UUID, FK → User, nullable
├── broker_name           String, nullable  (e.g. "Marsh McLennan")
├── broker_contact        String, nullable  (e.g. "tom.broker@marsh.com")
│
├── # Underwriting Summary (from Overview → Submission Summary card)
├── underwriting_summary  Text, nullable    (markdown/rich text)
│
├── # Timestamps
├── received_at           DateTime, default=now
├── updated_at            DateTime, auto-update
├── created_by            UUID, FK → User, nullable
│
├── # Relationships
├── proposals             → Proposal[]      (one-to-many)
├── documents             → Document[]      (one-to-many)
├── loss_runs             → LossRun[]       (one-to-many)
├── notes                 → SubmissionNote[] (one-to-many)
├── structured_fields     → StructuredField[] (one-to-many)
├── status_events         → StatusEvent[]   (one-to-many)
└── audit_logs            → AuditLog[]      (one-to-many)
```

**Status workflow** (from filter buttons on `/submissions`):
```
Received → Open → Under Review → Proposal Produced → Bound
                                                    → Declined
                                                    → Closed
```

---

### 3.2 Proposal (NEW — replaces/extends Quote)

An underwriter's pricing response to a submission. One submission can have multiple proposals (Good/Better/Best options), each with multiple versions.

**Source UI**: `/submissions/proposals` table + `/submissions/ps-{id}/proposals/prop-{id}` detail pages

```
Proposal
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
├── name                  String, required (e.g. "Standard GL Program", "Good — Essential Coverage")
├── version               Integer, default=1
├── status                Enum: draft | pending_approval | approved | declined
├── line_of_business      String  (inherited from Submission, but can differ)
├── rating_type           Enum: gl_rater | pl_rating | cyber | umbrella
│                         (determines which rating UI/engine to use)
│
├── # Premium Totals
├── total_premium         Decimal, nullable
├── indicated_premium     Decimal, nullable  (calculated total from rating rows)
├── technical_premium     Decimal, nullable
├── bound_premium         Decimal, nullable
│
├── # GL Rater — Policy Level Details (Table 1)
├── # Stored as JSON or in dedicated columns:
├── policy_details        JSON, nullable
│   ├── insured           String
│   ├── new_renewal       String  ("New" | "Renewal")
│   ├── deal_number       String
│   ├── pl2               String  (e.g. "General Liability")
│   ├── territory         String
│   ├── policy_effective_date    {new: Date, expiring: Date}
│   ├── policy_expiration_date   {new: Date, expiring: Date}
│   ├── each_occurrence_limit    {new: Decimal, expiring: Decimal}
│   ├── general_aggregate_limit  {new: Decimal, expiring: Decimal}
│   ├── sir_deductible_type      {new: "SIR"|"Deductible", expiring: "SIR"|"Deductible"}
│   ├── sir_ded_amount           {new: Decimal, expiring: Decimal}
│   ├── commission               {new: Float, expiring: Float}
│   ├── technical_premium_pre_emod   Decimal
│   ├── experience_modifier          Float
│   ├── technical_premium_post_emod  Decimal
│   ├── calculated_premium           Decimal
│   ├── technical_ratio              Float
│   └── rate_change                  Float
│
├── # Calculation Results
├── output_data           JSON, nullable  (full calculation output)
├── validation_results    JSON, nullable
│
├── # File references
├── excel_file_path       String, nullable
│
├── # Timestamps
├── created_at            DateTime, default=now
├── updated_at            DateTime, auto-update
├── created_by            UUID, FK → User, nullable
│
├── # Relationships
├── rates                 → ProposalRate[]   (one-to-many, the class/territory rows)
├── forms                 → ProposalForm[]   (one-to-many)
├── notes                 → ProposalNote[]   (one-to-many)
├── approvals             → Approval[]       (one-to-many)
└── audit_logs            → AuditLog[]       (one-to-many)
```

**Status workflow**:
```
Draft → Pending Approval → Approved
                         → Declined
```

---

### 3.3 ProposalRate (NEW)

Individual rating line items (class code rows). Maps to Table 2 (GL Rater) or the Rating Table (PL).

**Source UI**: GL Rater 20-row table with 20 columns; PL Rating Table with 9 columns

```
ProposalRate
├── id                    UUID, PK
├── proposal_id           UUID, FK → Proposal, required
├── row_index             Integer, required (1-based ordering)
│
├── # Class & Location
├── class_code            String, nullable  (e.g. "41677", "236220")
├── class_code_description String, nullable (e.g. "Computer Consulting Services")
├── zip_code              String, nullable
├── location_number       String, nullable
├── territory             String, nullable  (e.g. "NY-01")
│
├── # Classification Options
├── subline               Enum: prem_ops | liquor_liability, nullable
├── dominant_class_indicator  Enum: prem_ops_dominant | liquor_dominant, nullable
├── liquor_liability_limit    String, nullable (e.g. "100K/100K", "1M/2M")
│
├── # Exposures
├── exposures             Decimal, nullable
├── prior_year_exposures  Decimal, nullable
├── exposure_base         String, nullable  (Gross Sales/Revenues, Payroll, Square Feet, etc.)
│
├── # Rates & Premiums (GL Rater)
├── premops_liquor_rate   Decimal, nullable
├── products_rate         Decimal, nullable
├── total_rate            Decimal, nullable
├── premops_liquor_prem   Decimal, nullable
├── products_premium      Decimal, nullable
├── technical_premium     Decimal, nullable
├── modified_rate         Decimal, nullable
├── modified_premium      Decimal, nullable
├── audit_rate_selection  String, nullable
│
├── # Rates & Premiums (PL Rating — simpler model)
├── base_rate             Decimal, nullable
├── manual_premium        Decimal, nullable
├── lcm                   Float, nullable   (Loss Cost Multiplier)
├── adjusted_premium      Decimal, nullable
│
└── created_at            DateTime, default=now
```

**Exposure Base enum values** (from select dropdown):
`Gross Sales/Revenues | Payroll | Square Feet | Acres | Units | Admissions | Gallons | Members | Miles | Students | Total Cost | Total Operating Expenditures`

---

### 3.4 ProposalForm (NEW)

Insurance forms/endorsements attached to a proposal.

**Source UI**: Forms tab on Proposal Detail — table with columns: checkbox, Form Number, Edition, Form Name, Type, Adj. (Net), delete

```
ProposalForm
├── id                    UUID, PK
├── proposal_id           UUID, FK → Proposal, required
├── form_number           String, required  (e.g. "CG 00 01")
├── edition               String, nullable  (e.g. "04/13")
├── form_name             String, required  (e.g. "Commercial General Liability Coverage Form")
├── form_type             String, nullable  (e.g. "Coverage", "Endorsement", "Exclusion")
├── premium_adjustment    Decimal, nullable (net premium adjustment)
├── is_included           Boolean, default=True
├── sort_order            Integer, default=0
└── created_at            DateTime, default=now
```

---

### 3.5 Document (NEW)

Files uploaded against a submission with AI extraction tracking.

**Source UI**: Documents tab — table with File Name, Type, Uploaded, Size, Extraction status

```
Document
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
├── file_name             String, required
├── file_type             String, nullable  (MIME type or category: "Application", "Loss Run", "Certificate")
├── file_path             String, required  (storage path)
├── file_size             Integer, nullable (bytes)
├── uploaded_at           DateTime, default=now
├── uploaded_by           UUID, FK → User, nullable
│
├── # AI Extraction
├── extraction_status     Enum: pending | processing | completed | failed
├── extraction_completed_at DateTime, nullable
├── extraction_confidence Float, nullable  (overall doc confidence 0-1)
│
└── structured_fields     → StructuredField[] (one-to-many)
```

---

### 3.6 StructuredField (NEW)

Individual data fields extracted from documents via AI, with confidence scores and manual overrides.

**Source UI**: Structured Data tab — multiple tables with columns: Field, Extracted Value, Confidence, Override (editable input)

```
StructuredField
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
├── document_id           UUID, FK → Document, nullable (source document)
├── field_group           String, nullable  (section grouping, e.g. "Policy Info", "Financials", "Operations")
├── field_name            String, required  (e.g. "Named Insured", "FEIN", "Annual Revenue")
├── extracted_value       String, nullable
├── confidence            Float, nullable   (0.0 - 1.0)
├── override_value        String, nullable  (manually entered by underwriter)
├── overridden_by         UUID, FK → User, nullable
├── overridden_at         DateTime, nullable
└── created_at            DateTime, default=now
```

---

### 3.7 LossRun (NEW)

Loss history records for a submission. Two display modes observed in the UI:

1. **Summary view** (ps-002): Policy Year, Carrier, Premium, Claims, Incurred, Paid, Reserves, Loss Ratio
2. **Detail view** (ps-001, ps-003): Individual loss records with experience modifier fields

**Source UI**: Loss Runs tab

```
LossRun
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
│
├── # Summary fields (Policy-year level)
├── policy_year           String, nullable
├── carrier               String, nullable
├── premium               Decimal, nullable
├── claim_count           Integer, nullable
├── incurred              Decimal, nullable
├── paid                  Decimal, nullable
├── reserves              Decimal, nullable
├── loss_ratio            Float, nullable
│
├── # Detail fields (Individual loss level — for experience modifier)
├── date_of_loss          Date, nullable
├── ground_up_indemnity   Decimal, nullable
├── ground_up_expense     Decimal, nullable
├── ground_up_total_incurred  Decimal, nullable
├── indemnity_less_deductible Decimal, nullable
├── includable_losses     Decimal, nullable
├── policy_period         String, nullable
│
├── sort_order            Integer, default=0
└── created_at            DateTime, default=now
```

---

### 3.8 SubmissionNote (NEW)

Notes, emails, and internal commentary on a submission.

**Source UI**: Submission Notes tab — list of notes/emails with add textarea

```
SubmissionNote
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
├── note_type             Enum: internal | email_inbound | email_outbound
├── subject               String, nullable  (email subject line)
├── body                  Text, required
├── from_address          String, nullable  (e.g. "tom.broker@marsh.com")
├── to_address            String, nullable  (e.g. "sarah.chen@markel.com")
├── author_id             UUID, FK → User, nullable
├── created_at            DateTime, default=now
└── updated_at            DateTime, auto-update
```

---

### 3.9 ProposalNote (NEW)

Notes on a proposal (separate from submission notes).

**Source UI**: Proposal Notes tab on Proposal Detail

```
ProposalNote
├── id                    UUID, PK
├── proposal_id           UUID, FK → Proposal, required
├── body                  Text, required
├── author_id             UUID, FK → User, nullable
├── created_at            DateTime, default=now
└── updated_at            DateTime, auto-update
```

---

### 3.10 StatusEvent (NEW)

Timeline events tracking status changes on a submission.

**Source UI**: Status Timeline card on Submission Detail (e.g. "Received → Feb 15, 2026 → System", "Open → Feb 16 → Sarah Chen")

```
StatusEvent
├── id                    UUID, PK
├── submission_id         UUID, FK → Submission, required
├── proposal_id           UUID, FK → Proposal, nullable (if event is proposal-specific)
├── from_status           String, nullable
├── to_status             String, required
├── description           String, nullable  (e.g. "Assigned for review", "Broker accepted proposal")
├── actor_id              UUID, FK → User, nullable
├── actor_name            String, nullable  (for system/external actors without User records)
├── occurred_at           DateTime, default=now
└── created_at            DateTime, default=now
```

---

### 3.11 Existing Models — Updates Required

#### User (KEEP — minor additions)
```diff
  User (SQLAlchemyBaseUserTableUUID)
    id, email, hashed_password, is_active, is_superuser, is_verified
    full_name, role
+   title             String, nullable  (e.g. "Senior Underwriter")
+   department        String, nullable
```

#### AuditLog (KEEP — add Submission + Proposal FKs)
```diff
  AuditLog
    id, timestamp, event_type, event_details, user, duration_ms
-   quote_id          FK → Quote
+   submission_id     UUID, FK → Submission, nullable
+   proposal_id       UUID, FK → Proposal, nullable
+   entity_type       String  ("submission" | "proposal" | "document" | ...)
+   entity_id         UUID    (generic reference)
```

#### Approval (KEEP — re-point to Proposal)
```diff
  Approval
    id, workflow_id, stage, status, approver, comments, created_at, completed_at
-   quote_id          FK → Quote
+   proposal_id       UUID, FK → Proposal
```

#### Quote (DEPRECATE)
The existing `Quote` model is superseded by `Proposal` + `ProposalRate`. Migration path:
- Existing Quote records → create Proposal with `rating_type=gl_rater`
- Quote.input_data → Proposal.policy_details + ProposalRate rows
- Quote.output_data → Proposal.output_data
- Quote.insured_name → create a Submission parent, copy insured_name

---

## 4. Enum Definitions

```python
class SubmissionStatus(str, Enum):
    RECEIVED = "received"
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    PROPOSAL_PRODUCED = "proposal_produced"
    BOUND = "bound"
    DECLINED = "declined"
    CLOSED = "closed"

class ProposalStatus(str, Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    DECLINED = "declined"

class RatingType(str, Enum):
    GL_RATER = "gl_rater"           # Full GL rater with Excel engine
    PL_RATING = "pl_rating"         # Professional Liability simplified
    CYBER = "cyber"                 # Cyber Liability
    UMBRELLA = "umbrella"           # Umbrella/Excess

class ExtractionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class NoteType(str, Enum):
    INTERNAL = "internal"
    EMAIL_INBOUND = "email_inbound"
    EMAIL_OUTBOUND = "email_outbound"

class ExposureBase(str, Enum):
    GROSS_SALES = "Gross Sales/Revenues"
    PAYROLL = "Payroll"
    SQUARE_FEET = "Square Feet"
    ACRES = "Acres"
    UNITS = "Units"
    ADMISSIONS = "Admissions"
    GALLONS = "Gallons"
    MEMBERS = "Members"
    MILES = "Miles"
    STUDENTS = "Students"
    TOTAL_COST = "Total Cost"
    TOTAL_OPERATING = "Total Operating Expenditures"

class SublineType(str, Enum):
    PREM_OPS = "Prem/Ops"
    LIQUOR_LIABILITY = "Liquor Liability"

class LiquorLiabilityLimit(str, Enum):
    LIMIT_100K = "100K/100K"
    LIMIT_300K = "300K/300K"
    LIMIT_500K = "500K/500K"
    LIMIT_1M = "1M/1M"
    LIMIT_1M_2M = "1M/2M"
```

---

## 5. Database Schema (SQLAlchemy Table Summary)

| Table | PK | Key FKs | Row Estimate | Notes |
|---|---|---|---|---|
| `user` | UUID | — | ~10 | Existing, extended |
| `submissions` | UUID | underwriter_id, approver_id → user | ~100s | NEW - core entity |
| `proposals` | UUID | submission_id → submissions | ~100s | NEW - replaces quotes |
| `proposal_rates` | UUID | proposal_id → proposals | ~1000s | NEW - class rows |
| `proposal_forms` | UUID | proposal_id → proposals | ~100s | NEW - endorsements |
| `documents` | UUID | submission_id → submissions | ~100s | NEW |
| `structured_fields` | UUID | submission_id, document_id | ~1000s | NEW - AI extraction |
| `loss_runs` | UUID | submission_id → submissions | ~100s | NEW |
| `submission_notes` | UUID | submission_id → submissions | ~100s | NEW |
| `proposal_notes` | UUID | proposal_id → proposals | ~100s | NEW |
| `status_events` | UUID | submission_id, proposal_id | ~1000s | NEW - timeline |
| `audit_logs` | Integer | submission_id, proposal_id | ~10000s | Existing, extended |
| `approvals` | Integer | proposal_id → proposals | ~100s | Existing, re-pointed |

---

## 6. Key API Endpoints (Planned)

### Submissions
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions` | List submissions (filterable by status, LOB, underwriter) |
| POST | `/api/submissions` | Create new submission |
| GET | `/api/submissions/{id}` | Get submission detail with overview data |
| PATCH | `/api/submissions/{id}` | Update submission fields |
| PATCH | `/api/submissions/{id}/status` | Transition submission status |
| GET | `/api/submissions/{id}/timeline` | Get status event timeline |
| GET | `/api/submissions/stats` | Dashboard KPIs (total, active, proposals this month) |

### Proposals
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/proposals` | List all proposals across submissions |
| POST | `/api/submissions/{id}/proposals` | Create proposal for a submission |
| GET | `/api/proposals/{id}` | Get proposal detail |
| PATCH | `/api/proposals/{id}` | Update proposal |
| POST | `/api/proposals/{id}/calculate` | Run rating calculation |
| POST | `/api/proposals/{id}/version` | Create new version of proposal |
| POST | `/api/proposals/{id}/approve` | Approve proposal |
| POST | `/api/proposals/{id}/decline` | Decline proposal |
| GET | `/api/proposals/{id}/export/pdf` | Export proposal as PDF |
| GET | `/api/proposals/{id}/export/excel` | Download Excel workbook |
| GET | `/api/proposals/stats` | Proposal KPIs |

### Proposal Rates (Class Rows)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/proposals/{id}/rates` | Get all rate rows |
| PUT | `/api/proposals/{id}/rates` | Bulk update rate rows |
| POST | `/api/proposals/{id}/rates` | Add a rate row |
| DELETE | `/api/proposals/{id}/rates/{rate_id}` | Remove a rate row |

### Proposal Forms
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/proposals/{id}/forms` | Get attached forms |
| PUT | `/api/proposals/{id}/forms` | Update form list |

### Documents
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions/{id}/documents` | List documents |
| POST | `/api/submissions/{id}/documents` | Upload document |
| DELETE | `/api/submissions/{id}/documents/{doc_id}` | Remove document |
| POST | `/api/submissions/{id}/documents/{doc_id}/extract` | Trigger AI extraction |

### Structured Data
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions/{id}/structured-data` | Get extracted fields |
| PATCH | `/api/submissions/{id}/structured-data/{field_id}` | Override a field value |

### Loss Runs
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions/{id}/loss-runs` | Get loss run data |
| PUT | `/api/submissions/{id}/loss-runs` | Bulk update loss runs |
| POST | `/api/submissions/{id}/loss-runs/reset` | Reset to extracted values |

### Notes
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions/{id}/notes` | Get submission notes |
| POST | `/api/submissions/{id}/notes` | Add submission note |
| GET | `/api/proposals/{id}/notes` | Get proposal notes |
| POST | `/api/proposals/{id}/notes` | Add proposal note |

---

## 7. Migration Strategy

### Phase 1: Create New Tables
1. Create all new tables via Alembic migration
2. Keep existing `quotes` table untouched

### Phase 2: Seed Reference Data
1. Populate sample submissions matching the 9 entries shown in the UI
2. Create proposals linked to those submissions
3. Seed documents, loss runs, notes, forms, structured fields

### Phase 3: Migrate Quote Data
1. For each existing Quote → create a Submission + Proposal pair
2. Map Quote.input_data → Proposal.policy_details + ProposalRate rows
3. Map Quote.output_data → Proposal.output_data
4. Re-point AuditLog and Approval FKs

### Phase 4: Deprecate Quote
1. Remove Quote model from active codebase
2. Drop `quotes` table in a later migration

---

## 8. Sample Seed Data (from UI)

### Submissions
| Reference | Insured | Status | LOB | Premium | Underwriter |
|---|---|---|---|---|---|
| SUB-2026-001 | Pacific Coast Builders LLC | Under Review | General Liability | $45,000 | Sarah Chen |
| SUB-2026-002 | Meridian Tech Solutions Inc. | Proposal Produced | Professional Liability | $28,500 | Michael Torres |
| SUB-2026-003 | Summit Healthcare Group | Bound | General Liability | $72,000 | Sarah Chen |
| SUB-2026-004 | Greenfield Manufacturing Co. | Received | Products Liability | $95,000 | Michael Torres |
| SUB-2026-005 | Coastal Dining Group | Declined | General Liability | $18,000 | Sarah Chen |
| SUB-2026-006 | Apex Security Services | Open | General Liability | $35,000 | Michael Torres |
| SUB-2026-007 | Riverside Property Management | Closed | Property | $52,000 | Sarah Chen |
| SUB-2026-008 | Northstar Logistics Inc. | Under Review | Umbrella/Excess | $125,000 | Michael Torres |
| SUB-2026-009 | BlueWave Cyber Consulting | Received | Cyber Liability | $41,000 | Sarah Chen |

### Proposals
| Name | Submission | Status | Version | Premium | Rating Type |
|---|---|---|---|---|---|
| Standard GL Program | SUB-2026-001 | Draft | v1 | $45,000 | gl_rater |
| Good — Essential Coverage | SUB-2026-002 | Approved | v1 | $22,000 | pl_rating |
| Better — Enhanced Coverage | SUB-2026-002 | Pending Approval | v2 | $28,500 | pl_rating |
| Healthcare GL Program | SUB-2026-003 | Approved | v1 | $72,000 | gl_rater |

---

## 9. Index Recommendations

```sql
-- Submission lookups
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_underwriter ON submissions(underwriter_id);
CREATE INDEX idx_submissions_reference ON submissions(reference_number);
CREATE INDEX idx_submissions_received ON submissions(received_at DESC);

-- Proposal lookups
CREATE INDEX idx_proposals_submission ON proposals(submission_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created ON proposals(created_at DESC);

-- Rate rows
CREATE INDEX idx_proposal_rates_proposal ON proposal_rates(proposal_id);

-- Documents
CREATE INDEX idx_documents_submission ON documents(submission_id);
CREATE INDEX idx_documents_extraction ON documents(extraction_status);

-- Structured fields
CREATE INDEX idx_structured_fields_submission ON structured_fields(submission_id);
CREATE INDEX idx_structured_fields_document ON structured_fields(document_id);

-- Notes
CREATE INDEX idx_submission_notes_submission ON submission_notes(submission_id);
CREATE INDEX idx_proposal_notes_proposal ON proposal_notes(proposal_id);

-- Loss runs
CREATE INDEX idx_loss_runs_submission ON loss_runs(submission_id);

-- Status events (timeline)
CREATE INDEX idx_status_events_submission ON status_events(submission_id);
CREATE INDEX idx_status_events_occurred ON status_events(occurred_at DESC);

-- Audit logs
CREATE INDEX idx_audit_logs_submission ON audit_logs(submission_id);
CREATE INDEX idx_audit_logs_proposal ON audit_logs(proposal_id);
```

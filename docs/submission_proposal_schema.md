# Submission & Proposal Database Schema

> **Purpose:** Relational schema to support the Submissions list, Submission detail, and Proposal detail screens.
> **Status:** Draft v1 — iterate here, generate DDL when stable.

---

## Entity-Relationship Overview

```
User
 ├──< UserGroup             (user_id)
 ├──< Submission           (underwriter_id, approver_id, created_by)
 │     ├──< Proposal        (submission_id)
 │     │     ├──< ProposalRate        (proposal_id)
 │     │     ├──< ProposalDeductible  (proposal_id)
 │     │     ├──< ProposalCoverage    (proposal_id)
 │     │     │     └──< ProposalCoverageLimit   (proposal_coverage_id)
 │     │     ├──< ProposalForm        (proposal_id)
 │     │     │     └──< ProposalFormAdjustment  (proposal_form_id)
 │     │     │     └──< ProposalFormFillIn      (proposal_form_id)
 │     │     ├──< ProposalNote        (proposal_id)
 │     │     └──< Approval            (proposal_id)
 │     ├──< SubmissionSubjectivity (submission_id)  — fill_ins stored as JSON column
 │     ├──< InsuredLocation   (submission_id)
 │     ├──< Document          (submission_id)
 │     │     └──< StructuredField     (document_id, submission_id)
 │     ├──< LossRun           (submission_id)
 │     ├──< LossDetail        (submission_id)
 │     ├──< LargeLoss         (submission_id)
 │     ├──< SubmissionNote    (submission_id)
 │     ├──< StatusEvent       (submission_id)
 │     └──< AuditLog          (submission_id)
```

**Legend:** `──<` = one-to-many

---

## Enums

| Enum Name | Values |
|---|---|
| **SubmissionStatus** | `preparing_to_uw`, `ai_underwriting`, `ready_for_uw_review`, `under_review`, `proposal_produced`, `bound`, `declined` |
| **ProposalStatus** | `draft`, `pending_approval`, `approved`, `declined` |
| **LineOfBusiness** | `General Liability`, `Professional Liability`, `Cyber Liability`, `Products Liability`, `Umbrella/Excess`, `Property`, `Employment Practices` |
| **FormType** | `policy`, `coverage`, `endorsement`, `exclusion`, `notice` |
| **AdjustmentType** | `debit`, `credit` |
| **DocumentType** | `application`, `loss_runs`, `schedule`, `endorsement`, `supplemental`, `correspondence` |
| **ExtractionStatus** | `pending`, `processing`, `completed`, `failed` |
| **NoteType** | `internal`, `email_inbound`, `email_outbound` |
| **UserRole** | `underwriter`, `approver`, `admin`, `viewer` |
| **LossStatus** | `open`, `closed` |
| **ApprovalStatus** | `pending`, `approved`, `rejected` |
| **EntityType** | `llc`, `corporation`, `s_corporation`, `partnership`, `limited_partnership`, `llp`, `sole_proprietorship`, `non_profit`, `joint_venture`, `trust`, `government` |
| **DeductibleType** | `per_occurrence`, `aggregate`, `per_claim`, `per_project`, `per_location` |
| **DeductibleAppliesTo** | `all_coverages`, `bodily_injury`, `property_damage`, `personal_advertising_injury`, `products_completed_ops`, `medical_payments` |
| **RatingType** | `gl_rater`, `pl_rating`, `cyber`, `umbrella` |

---

## Tables

### 1. `user`

Core user identity. Auth0 owns authentication via Active Directory SSO; this table stores the local profile and links to the Auth0 identity. Role is synced from AD groups at login but can be overridden locally by admins.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `auth0_id` | VARCHAR(128) | UNIQUE, NOT NULL | `sub` claim from Auth0 JWT (e.g. `"ad\|5f3c..."`) — primary link to Auth0 |
| `identity_provider` | VARCHAR(100) | | Auth0 connection name (e.g. `"active-directory"`, `"auth0"`) |
| `external_id` | VARCHAR(255) | | AD objectGUID / SID — reconciliation key if Auth0 ID changes |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identity |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT FALSE | From Auth0 `email_verified` claim |
| `hashed_password` | VARCHAR(255) | | Nullable — only used if local-auth fallback is enabled; Auth0 handles auth |
| `full_name` | VARCHAR(255) | | Display name |
| `picture_url` | VARCHAR(500) | | Avatar URL from Auth0/AD profile |
| `role` | ENUM(UserRole) | NOT NULL, DEFAULT `viewer` | Synced from AD groups at login; admin-overridable |
| `title` | VARCHAR(255) | | Job title |
| `department` | VARCHAR(255) | | |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | |
| `is_superuser` | BOOLEAN | NOT NULL, DEFAULT FALSE | |
| `last_login_at` | TIMESTAMP | | Updated on each SSO login |

**Indexes:** `auth0_id` (unique), `email` (unique), `external_id`

---

### 1a. `user_group`

AD group memberships synced from Auth0 SSO tokens on each login. Enables querying "all users in group X" and mapping groups to application roles.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTO_INCREMENT | |
| `user_id` | UUID | FK → `user.id`, NOT NULL | CASCADE DELETE |
| `group_name` | VARCHAR(255) | NOT NULL | AD group name (e.g. `"UW_Approvers"`, `"UW_Managers"`) |
| `synced_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | When this membership was last confirmed by SSO |

**Unique constraint:** (`user_id`, `group_name`)
**Indexes:** `group_name` (for "all users in group X" queries), `user_id`

> **Sync strategy:** On each Auth0 login callback, delete all `user_group` rows for the user and re-insert from the token's `groups` claim. This ensures stale AD memberships are cleaned up automatically.

---

### 2. `submission`

Core entity — one row per underwriting case received from a broker.

| Column                    | Type | Constraints | Notes                                                                                                                             |
|---------------------------|---|---|-----------------------------------------------------------------------------------------------------------------------------------|
| `id`                      | VARCHAR(36) | PK | UUID string                                                                                                                       |
| `reference_number`        | VARCHAR(50) | UNIQUE, NOT NULL | e.g. "SUB-2026-001"                                                                                                               |
| `status`                  | ENUM(SubmissionStatus) | NOT NULL, DEFAULT `preparing_to_uw` |                                                                                                                                   |
| `line_of_business`        | ENUM(LineOfBusiness) | |                                                                                                                                   |
| **Insured Info**          | | |                                                                                                                                   |
| `insured_name`            | VARCHAR(255) | NOT NULL |                                                                                                                                   |
| `DUNS_Number`             | VARCHAR(50) | UNIQUE, NOT NULL | A D-U-N-S Number (Data Universal Numbering System) is a unique nine-digit identifier for businesses, assigned by Dun & Bradstreet | 
| `dba`                     | VARCHAR(255) | | Doing Business As                                                                                                                 |
| `fein`                    | VARCHAR(20) | | Federal EIN                                                                                                                       |
| `entity_type`             | ENUM(EntityType) | | LLC, Corporation, etc.                                                                                                            |
| `primary_operations`      | TEXT | |                                                                                                                                   |
| `naics_code`              | VARCHAR(10) | |                                                                                                                                   |
| `naics_description`       | VARCHAR(255) | |                                                                                                                                   |
| `years_in_business`       | INTEGER | |                                                                                                                                   |
| `number_of_employees`     | INTEGER | |                                                                                                                                   |
| `annual_revenue`          | DECIMAL(15,2) | |                                                                                                                                   |
| `subcontractor_pct`       | DECIMAL(5,2) | | % of work subcontracted                                                                                                           |
| `primary_address`         | VARCHAR(500) | | Main insured address                                                                                                              |
| `company_url`             | VARCHAR(500) | | Website                                                                                                                           |
| `state`                   | VARCHAR(2) | | Primary state                                                                                                                     |
| **Policy Info**           | | |                                                                                                                                   |
| `estimated_premium`       | DECIMAL(15,2) | | Premium indication                                                                                                                |
| `effective_date`          | DATE | |                                                                                                                                   |
| `expiration_date`         | DATE | |                                                                                                                                   |
| **Broker**                | | |                                                                                                                                   |
| `broker_name`             | VARCHAR(255) | |                                                                                                                                   |
| `broker_contact`          | VARCHAR(255) | | Contact person name                                                                                                               |
| `broker_email`            | VARCHAR(255) | |                                                                                                                                   |
| `broker_phone`            | VARCHAR(50) | |                                                                                                                                   |
| **Underwriting**          | | |                                                                                                                                   |
| `submission_risk_summary` | TEXT | | AI-generated risk summary                                                                                                         |
| **People (FKs)**          | | |                                                                                                                                   |
| `underwriter_id`          | UUID | FK → `user.id` | Assigned underwriter                                                                                                              |
| `approver_id`             | UUID | FK → `user.id` | Assigned approver                                                                                                                 |
| `created_by`              | UUID | FK → `user.id` |                                                                                                                                   |
| **Timestamps**            | | |                                                                                                                                   |
| `received_at`             | TIMESTAMP | NOT NULL, DEFAULT NOW |                                                                                                                                   |
| `updated_at`              | TIMESTAMP | NOT NULL, DEFAULT NOW | Auto-update on change                                                                                                             |

**Indexes:** `status`, `underwriter_id`, `received_at`, `line_of_business`

---

### 3. `insured_location`

Physical locations associated with the insured. One submission can have many locations.

| Column            | Type | Constraints                    | Notes                                           |
|-------------------|---|--------------------------------|-------------------------------------------------|
| `id`              | VARCHAR(36) | PK                             |                                                 |
| `submission_id`   | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE                                  |
| `address`         | VARCHAR(500) | NOT NULL                       | Full street address                             |
| `type`            | VARCHAR(100) |                                | e.g. "Office", "Warehouse"                      |
| `description`     | TEXT |                                |                                                 |
| `validated`       | BOOLEAN | NOT NULL, DEFAULT FALSE        | Address has been validated by 3rd party service |
| `reportable`      | BOOLEAN | NOT NULL, DEFAULT TRUE         | Included in schedule                            |
| `effective_start` | DATE |                                | Location coverage start                         |
| `effective_end`   | DATE |                                | Location coverage end                           |
| `sort_order`      | INTEGER | DEFAULT 0                      |                                                 |

---

### 4. `proposal`

A pricing/coverage option for a submission. Multiple proposals per submission (e.g. Good/Better/Best).

| Column                         | Type | Constraints | Notes                            |
|--------------------------------|---|---|----------------------------------|
| `id`                           | VARCHAR(36) | PK |                                  |
| `submission_id`                | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE                   |
| `name`                         | VARCHAR(255) | NOT NULL | e.g. "Good — Essential Coverage" |
| `description`                  | TEXT | |                                  |
| `version`                      | INTEGER | NOT NULL, DEFAULT 1 |                                  |
| `status`                       | ENUM(ProposalStatus) | NOT NULL, DEFAULT `draft` |                                  |
| `ai_generated`                 | BOOLEAN | DEFAULT FALSE | Was this AI-created?             |
| `AI_risk_analysis_description` | TEXT | | Was this AI-created              |
| `rating_type`                  | ENUM(RatingType) | | Which rating engine              |
| `line_of_business`             | VARCHAR(100) | |                                  |
| **Premiums**                   | | |                                  |
| `total_premium`                | DECIMAL(15,2) | | Final premium                    |
| `base_premium`                 | DECIMAL(15,2) | | Before adjustments               |
| `indicated_premium`            | DECIMAL(15,2) | |                                  |
| `technical_premium`            | DECIMAL(15,2) | |                                  |
| `bound_premium`                | DECIMAL(15,2) | | If bound                         |
| `commission`                   | DECIMAL(15,2) | | Broker commission                |
| **Data (JSON blobs)**          | | |                                  |
| `output_data`                  | JSON | | Calculated rates and premiums    |
| `validation_results`           | JSON | |                                  |

> **Note:** Limits, deductibles, and coverages formerly in `policy_details` JSON are now normalized into `proposal_deductible`, `proposal_coverage`, and `proposal_coverage_limit` tables.
| **File** | | | |
| `excel_file_path` | VARCHAR(500) | | Path to rating workbook |
| **Timestamps** | | | |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| `created_by` | UUID | FK → `user.id` | |

**Indexes:** `submission_id`, `status`

---

### 5. `proposal_rate`

One row per class code / location / subline in a proposal's rate table.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id`, NOT NULL | CASCADE DELETE |
| `row_index` | INTEGER | | Display order |
| **Classification** | | | |
| `class_code` | VARCHAR(20) | | e.g. "91580" |
| `class_description` | VARCHAR(255) | | |
| `territory` | VARCHAR(20) | | e.g. "CA-01" |
| `location_address` | VARCHAR(500) | | Which location this rate applies to |
| `location_number` | INTEGER | | |
| `subline` | VARCHAR(50) | | e.g. "PREM_OPS", "LIQUOR_LIABILITY" |
| `zip_code` | VARCHAR(10) | | |
| **Exposure** | | | |
| `exposure` | DECIMAL(15,2) | | Current year |
| `prior_year_exposure` | DECIMAL(15,2) | | |
| `exposure_base` | VARCHAR(50) | | "Payroll", "Revenue", "Area", etc. |
| **Rates** | | | |
| `base_rate` | DECIMAL(10,6) | | Manual rate |
| `premops_liquor_rate` | DECIMAL(10,6) | | |
| `products_rate` | DECIMAL(10,6) | | |
| `total_rate` | DECIMAL(10,6) | | |
| `modified_rate` | DECIMAL(10,6) | | After modifiers |
| **Premiums** | | | |
| `manual_premium` | DECIMAL(15,2) | | rate x exposure |
| `lcm` | DECIMAL(10,4) | | Loss Cost Multiplier |
| `adjusted_premium` | DECIMAL(15,2) | | After LCM |
| `premops_liquor_premium` | DECIMAL(15,2) | | |
| `products_premium` | DECIMAL(15,2) | | |
| `technical_premium` | DECIMAL(15,2) | | |
| `modified_premium` | DECIMAL(15,2) | | |
| **Flags** | | | |
| `dominant_class_indicator` | BOOLEAN | DEFAULT FALSE | |

---

### 6. `proposal_form`

Insurance forms/endorsements included in a proposal.

| Column                   | Type | Constraints | Notes                                              |
|--------------------------|---|---|----------------------------------------------------|
| `id`                     | VARCHAR(36) | PK |                                                    |
| `proposal_id`            | VARCHAR(36) | FK → `proposal.id`, NOT NULL | CASCADE DELETE                                     |
| `form_number`            | VARCHAR(50) | | e.g. "CG 00 01"                                    |
| `edition`                | VARCHAR(20) | | e.g. "04 13"                                       |
| `form_name`              | VARCHAR(255) | |                                                    |
| `form_type`              | ENUM(FormType) | | policy, coverage, etc.                             |
| `free_form_field_inputs` | JSON | | Free fdorm inputs that may need to be put in forms |
| `category`               | VARCHAR(100) | | Grouping label                                     |
| `description`            | TEXT | |                                                    |
| `premium_adjustment`     | DECIMAL(15,2) | | Net adjustment (+ or -)                            |
| `is_included`            | BOOLEAN | DEFAULT TRUE |                                                    |
| `sort_order`             | INTEGER | DEFAULT 0 |                                                    |

---

### 7. `proposal_form_adjustment`

Individual debit/credit line items on a proposal form.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_form_id` | VARCHAR(36) | FK → `proposal_form.id`, NOT NULL | CASCADE DELETE |
| `description` | VARCHAR(255) | NOT NULL | |
| `type` | ENUM(AdjustmentType) | NOT NULL | `debit` or `credit` |
| `amount` | DECIMAL(15,2) | NOT NULL | Always positive; sign from `type` |

---

### 8. `proposal_form_fill_in`

Configurable fill-in fields on a proposal form (e.g. "Aggregate Limit: $2,000,000").

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_form_id` | VARCHAR(36) | FK → `proposal_form.id`, NOT NULL | CASCADE DELETE |
| `label` | VARCHAR(255) | NOT NULL | Field label |
| `value` | TEXT | NOT NULL | Field value |

---

### 8a. `proposal_deductible`

Deductible options on a proposal. Replaces the deductibles portion of the former `policy_details` JSON.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id`, NOT NULL | CASCADE DELETE |
| `type` | ENUM(DeductibleType) | NOT NULL | Per Occurrence, Aggregate, Per Claim, etc. |
| `applies_to` | ENUM(DeductibleAppliesTo) | | What the deductible applies to (Bodily Injury, Property Damage, All Coverages, etc.) |
| `amount` | DECIMAL(15,2) | NOT NULL | Deductible dollar amount |
| `enabled` | BOOLEAN | NOT NULL, DEFAULT TRUE | Toggled on/off in pricing worksheet |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

### 8b. `proposal_coverage`

Coverage lines included in a proposal. Replaces the coverages portion of the former `policy_details` JSON.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id`, NOT NULL | CASCADE DELETE |
| `name` | VARCHAR(255) | NOT NULL | e.g. "Bodily Injury", "Property Damage", "Personal & Advertising Injury" |
| `enabled` | BOOLEAN | NOT NULL, DEFAULT TRUE | Toggled on/off in pricing worksheet |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

### 8c. `proposal_coverage_limit`

Individual limit values within a coverage (e.g. Per Occurrence, General Aggregate).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_coverage_id` | VARCHAR(36) | FK → `proposal_coverage.id`, NOT NULL | CASCADE DELETE |
| `label` | VARCHAR(255) | NOT NULL | e.g. "Per Occurrence", "General Aggregate", "Products/Completed Ops Aggregate" |
| `amount` | DECIMAL(15,2) | NOT NULL | Limit dollar amount |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

### 9. `document`

Uploaded files (applications, loss runs, schedules, etc.).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `file_name` | VARCHAR(255) | NOT NULL | |
| `document_type` | ENUM(DocumentType) | | application, loss_runs, etc. |
| `file_type` | VARCHAR(100) | | MIME type |
| `file_path` | VARCHAR(500) | | Storage path |
| `file_size` | VARCHAR(50) | | Human-readable, e.g. "2.4 MB" |
| `extraction_status` | ENUM(ExtractionStatus) | DEFAULT `pending` | AI extraction state |
| `extraction_confidence` | DECIMAL(3,2) | | 0.00–1.00 |
| `extraction_completed_at` | TIMESTAMP | | |
| `satora_output` | TEXT | | Raw extraction output |
| `uploaded_at` | TIMESTAMP | DEFAULT NOW | |
| `uploaded_by` | UUID | FK → `user.id` | |

---

### 10. `structured_field`

AI-extracted data fields from documents, with human override capability.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `document_id` | VARCHAR(36) | FK → `document.id` | Source document |
| `field_group` | VARCHAR(100) | | e.g. "Insured Information", "Operations" |
| `field_name` | VARCHAR(255) | NOT NULL | |
| `extracted_value` | TEXT | | What AI extracted |
| `confidence` | DECIMAL(3,2) | | 0.00–1.00 |
| `override_value` | TEXT | | Human correction |
| `overridden_by` | UUID | FK → `user.id` | |
| `overridden_at` | TIMESTAMP | | |

---

### 11. `loss_run`

Historical loss summary by policy year.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `policy_year` | VARCHAR(20) | | e.g. "2023-2024" |
| `carrier` | VARCHAR(255) | | Prior carrier name |
| `premium` | DECIMAL(15,2) | | |
| `claim_count` | INTEGER | | |
| `incurred` | DECIMAL(15,2) | | |
| `paid` | DECIMAL(15,2) | | |
| `reserves` | DECIMAL(15,2) | | |
| `loss_ratio` | DECIMAL(5,4) | | incurred / premium |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

### 12. `loss_detail`

Individual loss occurrence records (granular detail beneath loss runs).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `date_of_loss` | DATE | | |
| `policy_period` | VARCHAR(20) | | e.g. "2023-2024" |
| `ground_up_indemnity` | DECIMAL(15,2) | | |
| `ground_up_expense` | DECIMAL(15,2) | | |
| `ground_up_total_incurred` | DECIMAL(15,2) | | |
| `indemnity_less_deductible` | DECIMAL(15,2) | | |
| `includable_losses` | DECIMAL(15,2) | | |

---

### 13. `large_loss`

Individually significant claims flagged for underwriting attention.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `policy_year` | VARCHAR(20) | | |
| `description` | TEXT | NOT NULL | |
| `claim_amount` | DECIMAL(15,2) | NOT NULL | |
| `status` | ENUM(LossStatus) | NOT NULL | `open` or `closed` |

---

### 14. `submission_note`

Notes and emails on a submission.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `note_type` | ENUM(NoteType) | NOT NULL | internal, email_inbound, email_outbound |
| `author` | VARCHAR(255) | | Display name |
| `author_id` | UUID | FK → `user.id` | |
| `subject` | VARCHAR(255) | | Email subject line |
| `content` | TEXT | | Body text |
| `from_address` | VARCHAR(255) | | Email from |
| `to_address` | VARCHAR(255) | | Email to |
| `created_at` | TIMESTAMP | DEFAULT NOW | |
| `updated_at` | TIMESTAMP | DEFAULT NOW | |

---

### 15. `proposal_note`

Notes on a specific proposal.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id`, NOT NULL | CASCADE DELETE |
| `author` | VARCHAR(255) | | |
| `author_id` | UUID | FK → `user.id` | |
| `content` | TEXT | | |
| `created_at` | TIMESTAMP | DEFAULT NOW | |
| `updated_at` | TIMESTAMP | DEFAULT NOW | |

---

### 16. `submission_subjectivity`

Conditions/requirements that must be met before or after binding. Tracked at the submission level so they apply across all proposals.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `text` | TEXT | NOT NULL | Subjectivity description |
| `checked` | BOOLEAN | DEFAULT FALSE | Has it been satisfied? |
| `custom` | BOOLEAN | DEFAULT FALSE | User-added vs. standard |
| `fill_ins` | JSON | | Free-form array of `{label, value}` pairs, e.g. `[{"label":"Limit","value":"$1,000,000"}]` |
| `sort_order` | INTEGER | DEFAULT 0 | |

---

### 17. `status_event`

Audit trail of submission status transitions (powers the timeline UI).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK | |
| `submission_id` | VARCHAR(36) | FK → `submission.id`, NOT NULL | CASCADE DELETE |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id` | If proposal-related |
| `from_status` | VARCHAR(50) | | Previous status |
| `to_status` | VARCHAR(50) | | New status |
| `description` | TEXT | | |
| `actor_id` | UUID | FK → `user.id` | |
| `actor_name` | VARCHAR(255) | | Denormalized for display |
| `occurred_at` | TIMESTAMP | NOT NULL, DEFAULT NOW | |

**Index:** `submission_id`, `occurred_at`

---

### 18. `approval`

Workflow approval decisions on proposals.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTO_INCREMENT | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id` | |
| `submission_id` | VARCHAR(36) | FK → `submission.id` | |
| `workflow_id` | VARCHAR(100) | | External workflow reference |
| `stage` | VARCHAR(100) | | e.g. "underwriter_review" |
| `status` | ENUM(ApprovalStatus) | NOT NULL, DEFAULT `pending` | |
| `approver` | VARCHAR(255) | | User email |
| `comments` | TEXT | | |
| `created_at` | TIMESTAMP | DEFAULT NOW | |
| `completed_at` | TIMESTAMP | | |

---

### 19. `audit_log`

General-purpose event log for all data changes.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, AUTO_INCREMENT | |
| `submission_id` | VARCHAR(36) | FK → `submission.id` | |
| `proposal_id` | VARCHAR(36) | FK → `proposal.id` | |
| `entity_type` | VARCHAR(100) | | e.g. "submission", "proposal_rate" |
| `entity_id` | VARCHAR(36) | | PK of affected row |
| `event_type` | VARCHAR(50) | NOT NULL | create, update, delete |
| `event_details` | JSON | | Changed fields / values |
| `user_email` | VARCHAR(255) | | |
| `duration_ms` | DECIMAL(10,2) | | |
| `timestamp` | TIMESTAMP | DEFAULT NOW | |

---

## Relationship Summary

| Parent | Child | FK Column | Cardinality | On Delete |
|---|---|---|---|---|
| `submission` | `proposal` | `submission_id` | 1:N | CASCADE |
| `submission` | `insured_location` | `submission_id` | 1:N | CASCADE |
| `submission` | `document` | `submission_id` | 1:N | CASCADE |
| `submission` | `structured_field` | `submission_id` | 1:N | CASCADE |
| `submission` | `loss_run` | `submission_id` | 1:N | CASCADE |
| `submission` | `loss_detail` | `submission_id` | 1:N | CASCADE |
| `submission` | `large_loss` | `submission_id` | 1:N | CASCADE |
| `submission` | `submission_note` | `submission_id` | 1:N | CASCADE |
| `submission` | `status_event` | `submission_id` | 1:N | CASCADE |
| `proposal` | `proposal_rate` | `proposal_id` | 1:N | CASCADE |
| `proposal` | `proposal_deductible` | `proposal_id` | 1:N | CASCADE |
| `proposal` | `proposal_coverage` | `proposal_id` | 1:N | CASCADE |
| `proposal_coverage` | `proposal_coverage_limit` | `proposal_coverage_id` | 1:N | CASCADE |
| `proposal` | `proposal_form` | `proposal_id` | 1:N | CASCADE |
| `proposal` | `proposal_note` | `proposal_id` | 1:N | CASCADE |
| `submission` | `submission_subjectivity` | `submission_id` | 1:N | CASCADE |
| `proposal` | `approval` | `proposal_id` | 1:N | SET NULL |
| `proposal_form` | `proposal_form_adjustment` | `proposal_form_id` | 1:N | CASCADE |
| `proposal_form` | `proposal_form_fill_in` | `proposal_form_id` | 1:N | CASCADE |
| `document` | `structured_field` | `document_id` | 1:N | SET NULL |
| `user` | `user_group` | `user_id` | 1:N | CASCADE |
| `user` | `submission` | `underwriter_id` | 1:N | SET NULL |
| `user` | `submission` | `approver_id` | 1:N | SET NULL |
| `user` | `proposal` | `created_by` | 1:N | SET NULL |

---

## Gap Analysis: Current Backend vs. This Schema

The existing backend (`backend/core/models.py`) already has many of these tables. Below are the **new tables and columns** needed:

### New Tables (not in current backend)

| Table | Reason |
|---|---|
| `user_group` | AD group memberships from Auth0 SSO tokens; enables group-based queries and role mapping |
| `insured_location` | Frontend `InsuredLocation[]` is currently a JSON array on submission; needs its own table for querying/editing |
| `loss_detail` | Frontend `PortalLossDetail` is separate from `LossRun`; backend currently mixes detail fields into `loss_run` |
| `large_loss` | Frontend `PortalLargeLoss` has no backend equivalent |
| `proposal_form_adjustment` | Frontend `SubmissionFormAdjustment` / `PortalDebitCredit` — backend `ProposalForm` only has a single `premium_adjustment` float |
| `proposal_form_fill_in` | Frontend `SubmissionFormFillIn` — no backend equivalent |
| `proposal_deductible` | Deductible options per proposal — formerly buried in `policy_details` JSON blob |
| `proposal_coverage` | Coverage lines per proposal — formerly buried in `policy_details` JSON blob |
| `proposal_coverage_limit` | Individual limits within a coverage (e.g. Per Occurrence, Aggregate) |
| `submission_subjectivity` | Frontend `Subjectivity` type — at submission level, no backend equivalent |

### New Columns on Existing Tables

| Table | Column | Reason |
|---|---|---|
| `user` | `auth0_id` | Primary link to Auth0 identity (`sub` claim) |
| `user` | `identity_provider` | Auth0 connection name (e.g. `"active-directory"`) |
| `user` | `external_id` | AD objectGUID/SID for reconciliation |
| `user` | `email_verified` | From Auth0 claim; replaces `is_verified` |
| `user` | `picture_url` | Avatar URL from Auth0/AD profile |
| `user` | `last_login_at` | Track SSO login timestamps |
| `submission` | `primary_address` | Frontend displays primary address in header |
| `submission` | `company_url` | Frontend shows company website link |
| `submission` | `state` | Frontend uses for display and filtering |
| `submission` | `broker_email` | Frontend shows in broker info |
| `submission` | `broker_phone` | Frontend shows in broker info |
| `submission` | `submission_summary` | AI-generated summary text |
| `proposal` | `description` | Frontend shows proposal description |
| `proposal` | `ai_generated` | Frontend shows AI badge |
| `proposal` | `base_premium` | Frontend shows base vs. total |
| `proposal` | `commission` | Frontend shows commission amount |
| `document` | `document_type` | Frontend filters by type (application, loss_runs, etc.) |
| `document` | `satora_output` | Raw extraction engine output |
| `submission_note` | `author` | Denormalized display name (frontend uses `author` string) |
| `proposal_note` | `author` | Same |

---

## Screen → Table Mapping

### Submissions List (`/submissions`)

| UI Column | Source |
|---|---|
| Reference # | `submission.reference_number` |
| Insured | `submission.insured_name` |
| Status | `submission.status` |
| Line of Business | `submission.line_of_business` |
| Premium | `submission.estimated_premium` |
| Proposals | `COUNT(proposal)` where `proposal.submission_id` |
| Underwriter | `user.full_name` via `submission.underwriter_id` |
| Received | `submission.received_at` |
| Last Updated | `submission.updated_at` |

### Submission Detail (`/submissions/:id`)

| Tab / Section | Tables Queried |
|---|---|
| Header | `submission`, `user` (underwriter + approver) |
| Key Info | `submission`, `structured_field` |
| Overview → Proposals | `proposal` |
| Overview → Locations | `insured_location` |
| Overview → Documents | `document` |
| Overview → Timeline | `status_event` |
| Overview → Summary | `submission.submission_summary` |
| Overview → Notes | `submission_note` |
| Notes & Emails | `submission_note` |
| Loss Runs | `loss_run`, `large_loss` |
| Structured Data | `structured_field` |
| Rates | `proposal_rate` (grouped by proposal) |

### Proposal Detail (`/submissions/:id/proposals/:proposalId`)

| Tab / Section | Tables Queried |
|---|---|
| Header | `proposal`, `submission` |
| Summary & Notes | `proposal_note` |
| Pricing Worksheet → Rates | `proposal_rate` |
| Pricing Worksheet → Forms | `proposal_form` + `proposal_form_adjustment` |
| Pricing Worksheet → Loss | `loss_run`, `loss_detail` |
| Forms | `proposal_form` + `proposal_form_adjustment` + `proposal_form_fill_in` |
| Location Schedule | `insured_location` (from parent submission) |
| Subjectivities | `submission_subjectivity` (from parent submission) |

# GL Primary Rater Backend

Insurance rating calculation API that processes General Liability (GL) quotes through an Excel-based calculation engine with audit trails and approval workflows.

## Tech Stack

- **Python 3.12** / **FastAPI** / **Uvicorn** (async ASGI)
- **SQLAlchemy** (async) with **SQLite** (aiosqlite)
- **openpyxl** for Excel workbook manipulation
- **Pydantic v2** for validation and schemas

## Project Structure

```
backend/
├── main.py                  # FastAPI app entry point, router registration
├── requirements.txt         # Python dependencies
├── .env                     # Environment config (DB path, storage paths, secrets)
├── start.sh                 # Dev startup script
├── api/                     # Route handlers
│   ├── quotes.py            # Quote CRUD, calculate, export
│   ├── validation.py        # Input validation endpoints
│   ├── comparison.py        # Multi-quote comparison
│   └── workflow.py          # Approval workflow
├── core/                    # Core application layer
│   ├── config.py            # Settings (loaded from .env)
│   ├── database.py          # Async SQLAlchemy setup
│   ├── models.py            # ORM models (Quote, AuditLog, Approval)
│   └── schemas.py           # Pydantic request/response schemas
├── excel/
│   └── processor.py         # Excel template population & calculation extraction
├── storage/
│   ├── quote_manager.py     # Filesystem CRUD for quote files
│   └── audit_logger.py      # Audit trail logging
├── validation/
│   └── validator.py         # Business rule validation with auto-corrections
└── tests/                   # Test directory (stub — no tests yet)
```

## Running

```bash
# Using startup script
./start.sh

# Or manually
source venv/bin/activate
python main.py
# Runs on http://localhost:8000 with --reload
```

Auto-generated docs at `/docs` (Swagger) and `/redoc`.

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/quotes/new` | Create & calculate a new quote |
| GET | `/api/quotes/list` | List quotes (paginated, filterable) |
| GET | `/api/quotes/{id}` | Get quote details |
| GET | `/api/quotes/{id}/excel` | Download Excel workbook |
| POST | `/api/quotes/{id}/recalculate` | Recalculate with updated inputs |
| POST | `/api/quotes/calculate` | Preview calculation (no save) |
| POST | `/api/validation/validate` | Validate a complete quote |
| POST | `/api/validation/field` | Validate a single field |
| POST | `/api/comparison/compare` | Compare multiple quotes |
| POST | `/api/workflow/submit` | Submit quote for approval |
| GET | `/api/health` | Health check |

## Data Flow

1. Client submits form data → Pydantic validates → business rules checked
2. Excel template copied → cells populated → formulas recalculated
3. Results extracted to JSON → saved to DB + filesystem
4. Every cell update logged in audit trail

## Quote Lifecycle

`DRAFT → CALCULATING → CALCULATED → APPROVED → BOUND` (or `ERROR`)

## Storage

Dual storage strategy:
- **SQLite DB**: metadata, quick lookups, audit trails
- **Filesystem** (`quotes/{id}/`): input.json, output.json, metadata.json, audit_log.json, Excel workbooks, version history

## Key Models

- **Quote**: insured_name, deal_number, pl2_selection, status, technical_premium, bound_premium, experience_modifier, input/output JSON
- **AuditLog**: event_type, event_details, user, duration_ms (linked to Quote)
- **Approval**: workflow_id, stage, status, approver, comments (linked to Quote)

## Environment Config (.env)

Key settings: `DATABASE_URL`, `EXCEL_TEMPLATE_PATH`, `QUOTES_STORAGE_PATH`, `CORS_ORIGINS`, `SECRET_KEY`, `CALCULATION_TIMEOUT` (60s), `MAX_QUOTE_AGE_DAYS` (90)

## Development Notes

- Database auto-initializes on startup
- CORS enabled for localhost:3000, localhost:8000, gl-rater.com
- Excel template path: `../GL_Primary_Rater_unprotected_MklQuote_Txn9163632.xlsm`
- Some directories are stubs (config/, comparison/, workflow/, tests/)
- Filesystem fallback if DB is unavailable

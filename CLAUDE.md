# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProposalEngine is an insurance underwriting intelligence platform. It has a Next.js frontend with mock data for demos and a FastAPI backend for GL rating calculations. The frontend operates independently using mock data when the backend is unavailable.

## Commands

### Development
```bash
npm run dev              # Next.js dev server on http://localhost:3000
npm run dev:all          # Frontend + backend together (needs backend:setup first)
npm run backend:setup    # One-time: create Python venv and install deps
npm run backend          # FastAPI backend on http://localhost:8000
```

### Build & Lint
```bash
npm run build            # Production build (Next.js + TypeScript)
npm run lint             # ESLint
```

### Testing
```bash
npm test                 # Playwright E2E tests (headless, auto-starts dev server)
npm run test:headed      # Playwright with visible browser
npm run test:ui          # Playwright interactive UI mode

# Backend tests
cd backend && source venv/bin/activate && pytest
cd backend && source venv/bin/activate && pytest tests/test_seed_data.py -v  # single test file
```

## Architecture

### Frontend (Next.js 16 / React 19 / TypeScript)
- **App Router** in `app/` — pages auto-route by directory structure
- **UI components**: shadcn/ui in `components/ui/`, feature components in `components/{phase2,phase3,submissions,rating,shared}/`
- **Layout**: `components/layout/` has AppSidebar and AppHeader
- **No global state manager** — all state is local (useState/useCallback)
- **Styling**: Tailwind CSS 4 with CSS variables, Lucide icons
- **Import alias**: `@/` maps to project root (e.g., `@/components`, `@/lib`, `@/hooks`)

### Backend (Python 3.12 / FastAPI)
- Entry point: `backend/main.py` — registers routers, sets up auth/admin, seeds demo data on startup
- Routes in `backend/api/` (quotes, validation, comparison, workflow)
- ORM models in `backend/core/models.py` (User, Quote, Submission, Proposal, Approval, AuditLog, Note)
- Auth via fastapi-users (JWT + cookie backends), admin panel at `/admin` via SQLAdmin
- SQLite + async SQLAlchemy; dual storage with filesystem (`quotes/{id}/`) for workbooks
- API docs auto-generated at `/docs` (Swagger) and `/redoc`

### Data Flow
- Frontend calls backend via `lib/api-client.ts` (base URL from `NEXT_PUBLIC_API_URL` or defaults to `http://localhost:8000`)
- When backend is unavailable, frontend uses comprehensive mock datasets in `lib/mock-data/`
- Mock data files are large (clause-deltas.ts, portal-submissions.ts etc.) and cover all workflows
- Backend: client submits form data -> Pydantic validates -> Excel template populated via openpyxl -> results extracted to JSON -> saved to DB + filesystem

### Key Feature Areas
- **`app/phase2/`**: Policy analysis — clause deltas (P&C Commercial vs Kinsale), clause alignment, document audit, scenario checks, pricing analysis
- **`app/submissions/`**: Portal submission management with tabbed detail views and proposal generation
- **`app/rating/`**: GL rating calculator with quote history, comparison, and approval workflows
- **`app/phase3/`**: Underwriting workflow dashboard

### Core Types (`lib/types.ts`)
Central type definitions for the domain: `ClauseDelta`, `Provenance`, `Scorecard`, `PortalSubmission`, `PortalProposal`, `ClaimVignette`, etc. All extracted data carries `Provenance` metadata (document source, page, confidence).

### Constants (`lib/constants.ts`)
Color maps, badge styles, and workflow stage configs referenced by multiple components (e.g., `TIGHTNESS_COLORS`, `SEVERITY_COLORS`).

## Environment

### Frontend
- `NEXT_PUBLIC_API_URL` — backend URL (defaults to `http://localhost:8000` if unset)

### Backend (`backend/.env`)
- `DATABASE_URL`, `QUOTES_STORAGE_PATH`, `EXCEL_TEMPLATE_PATH`, `SECRET_KEY`, `CORS_ORIGINS`

## Testing Notes
- Playwright config is in `playwright.config.ts` — tests run against Chromium only by default
- Playwright auto-starts the dev server (`npm run dev`) before tests
- Backend tests use pytest-asyncio with fixtures in `backend/tests/conftest.py`

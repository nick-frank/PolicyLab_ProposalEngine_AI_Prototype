import type { DashboardMetrics, RecentActivity } from "@/lib/types";

export const DASHBOARD_METRICS: DashboardMetrics = {
  phase2: {
    totalClauseDeltas: 20,
    kinsaleTighterPercent: 70, // 14 out of 20
    highSeverityCount: 10,
    scenariosPassingRatio: "10/15",
    tightnessDistribution: {
      tighter: 14,
      broader: 4,
      neutral: 2,
    },
  },
  phase3: {
    totalSubmissions: 12,
    autoQuoteRate: 33.3, // 4 out of 12
    avgTriageConfidence: 0.76,
    avgProcessingMs: 42000,
    bucketDistribution: {
      auto_decline: 3,
      needs_review: 5,
      auto_quote: 4,
    },
  },
  system: {
    modelVersion: "v2.4.1",
    dataFreshness: "2025-01-21T07:45:00Z",
    documentsProcessed: 6,
    avgOcrConfidence: 0.95,
  },
};

export const RECENT_ACTIVITIES: RecentActivity[] = [
  {
    type: "submission",
    title: "DeepMine Excavation LLC — Auto-declined (Mining/Quarrying prohibited class)",
    timestamp: "2025-01-21T07:45:00Z",
    link: "/submissions/sub-012",
  },
  {
    type: "submission",
    title: "Velocity Courier Services — Routed to needs_review (incomplete application)",
    timestamp: "2025-01-20T11:15:00Z",
    link: "/submissions/sub-011",
  },
  {
    type: "clause_delta",
    title: "New clause delta cd-020: Care Custody Control — Kinsale provides $50K sublimit carve-back",
    timestamp: "2025-01-19T13:42:00Z",
    link: "/clause-deltas/cd-020",
  },
  {
    type: "submission",
    title: "ToxiChem Processing Inc — Auto-declined (Chemical manufacturing prohibited class)",
    timestamp: "2025-01-19T08:30:00Z",
    link: "/submissions/sub-010",
  },
  {
    type: "scenario",
    title: "Scenario cv-015 FAILED regression: Umbrella drop-down coverage analysis inconsistency",
    timestamp: "2025-01-18T16:30:00Z",
    link: "/scenarios/cv-015",
  },
  {
    type: "submission",
    title: "Wildfire BBQ Franchises — Routed to needs_review (live entertainment exposure)",
    timestamp: "2025-01-18T10:00:00Z",
    link: "/submissions/sub-009",
  },
  {
    type: "document",
    title: "Kinsale Cyber Policy Form KCY-2024-01 processed — 38 pages, 95% OCR confidence",
    timestamp: "2025-01-17T16:00:00Z",
    link: "/documents/doc-kinsale-cy-01",
  },
  {
    type: "submission",
    title: "CleanStar Janitorial Corp — Auto-quoted at $12,500 (clean loss history)",
    timestamp: "2025-01-17T15:20:00Z",
    link: "/submissions/sub-008",
  },
  {
    type: "clause_delta",
    title: "New clause delta cd-016: Kinsale provides broader regulatory proceeding coverage for cyber",
    timestamp: "2025-01-17T13:02:00Z",
    link: "/clause-deltas/cd-016",
  },
  {
    type: "submission",
    title: "DataForge Analytics — Auto-quoted at $38,000 (strong cyber posture)",
    timestamp: "2025-01-16T09:45:00Z",
    link: "/submissions/sub-007",
  },
  {
    type: "document",
    title: "Kinsale PL Policy Form KPL-2024-02 processed — 32 pages, 94% OCR confidence",
    timestamp: "2025-01-16T08:00:00Z",
    link: "/documents/doc-kinsale-pl-01",
  },
  {
    type: "scenario",
    title: "Scenario cv-012 FAILED regression: GDPR regulatory fine coverage outcome mismatch",
    timestamp: "2025-01-15T17:00:00Z",
    link: "/scenarios/cv-012",
  },
  {
    type: "submission",
    title: "Pacific Coast Medical Center — Routed to needs_review (pain management specialty)",
    timestamp: "2025-01-15T13:00:00Z",
    link: "/submissions/sub-006",
  },
  {
    type: "clause_delta",
    title: "New clause delta cd-012: Kinsale sublimits ransomware to $250K and excludes cryptocurrency",
    timestamp: "2025-01-15T12:22:00Z",
    link: "/clause-deltas/cd-012",
  },
  {
    type: "document",
    title: "Markel Cyber Policy Form MCY-2024-09 processed — 35 pages, 97% OCR confidence",
    timestamp: "2025-01-15T11:12:00Z",
    link: "/documents/doc-markel-cy-01",
  },
];

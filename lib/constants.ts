import type { MechanismType, Severity, TightnessDirection, TriageBucket, PortalSubmissionStatus, ExtractionStatus, PortalDocumentType } from "./types";

// ── Tightness badge styling ──────────────────────────────────────────
export const TIGHTNESS_COLORS: Record<
  TightnessDirection,
  { bg: string; text: string; border: string; label: string }
> = {
  tighter: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Kinsale Tighter",
  },
  broader: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    label: "Markel Broader",
  },
  neutral: {
    bg: "bg-zinc-50",
    text: "text-zinc-600",
    border: "border-zinc-200",
    label: "Neutral",
  },
};

// ── Severity styling ─────────────────────────────────────────────────
export const SEVERITY_COLORS: Record<
  Severity,
  { bg: string; text: string; dot: string }
> = {
  high: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  medium: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  low: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
};

// ── Triage bucket configuration ──────────────────────────────────────
export const TRIAGE_BUCKET_CONFIG: Record<
  TriageBucket,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  auto_decline: {
    label: "Auto-Decline",
    color: "destructive",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
  },
  needs_review: {
    label: "Needs Review",
    color: "warning",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  auto_quote: {
    label: "Auto-Quote",
    color: "success",
    bgClass: "bg-green-50",
    textClass: "text-green-700",
  },
};

// ── Mechanism labels and icons ───────────────────────────────────────
export const MECHANISM_CONFIG: Record<
  MechanismType,
  { label: string; icon: string }
> = {
  exclusion: { label: "Exclusion", icon: "Ban" },
  condition: { label: "Condition", icon: "AlertCircle" },
  definition_narrowing: { label: "Definition Narrowing", icon: "Minimize2" },
  sublimit: { label: "Sublimit", icon: "ArrowDown" },
  trigger: { label: "Trigger", icon: "Zap" },
};

// ── Workflow stage configuration ─────────────────────────────────────
export const WORKFLOW_STAGES = [
  {
    key: "classify" as const,
    label: "Classify",
    icon: "Tags",
    description: "NAICS, coverage, risk flags, quality score",
  },
  {
    key: "retrieve" as const,
    label: "Retrieve",
    icon: "Search",
    description: "Similar insureds, losses, clause fingerprints",
  },
  {
    key: "analyze" as const,
    label: "Analyze",
    icon: "GitCompare",
    description: "Relevant clause deltas, tightening options",
  },
  {
    key: "evaluate" as const,
    label: "Evaluate",
    icon: "BarChart3",
    description: "Loss features + clause impact → appetite score",
  },
  {
    key: "explain" as const,
    label: "Explain",
    icon: "MessageSquare",
    description: "Reasoning trace, citations, recommendations",
  },
];

// ── Sidebar navigation structure ─────────────────────────────────────
export const PHASE2_NAV = [
  { href: "/phase2/clause-deltas", label: "Clause Deltas", icon: "GitCompare" },
  { href: "/phase2/scorecards", label: "Tightness Scorecards", icon: "BarChart3" },
  { href: "/phase2/scenario-checks", label: "Scenario Checks", icon: "FlaskConical" },
  { href: "/phase2/pricing-analysis", label: "Pricing Analysis", icon: "DollarSign" },
  { href: "/phase2/clause-alignment", label: "Clause Alignment", icon: "Link" },
  { href: "/phase2/document-audit", label: "Document Audit", icon: "FileSearch" },
  { href: "/phase2/claims-search", label: "Claims Search", icon: "Search" },
] as const;

export const PHASE3_NAV = [
  { href: "/phase3/submissions", label: "Submission Queue", icon: "Inbox" },
] as const;

export const RATING_NAV = [
  { href: "/rating/primary-gl-rater", label: "Primary GL Rater", icon: "Calculator" },
] as const;

// ── Submission Portal navigation ──────────────────────────────────────
export const SUBMISSIONS_NAV = [
  { href: "/submissions", label: "Submission Portal", icon: "ClipboardList" },
] as const;

// ── Portal status configuration ──────────────────────────────────────
export const PORTAL_STATUS_CONFIG: Record<
  PortalSubmissionStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  received: { label: "Received", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  open: { label: "Open", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  under_review: { label: "Under Review", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  proposal_produced: { label: "Proposal Produced", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  bound: { label: "Bound", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  declined: { label: "Declined", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  closed: { label: "Closed", bg: "bg-zinc-50", text: "text-zinc-600", border: "border-zinc-200" },
};

// ── Extraction status configuration ──────────────────────────────────
export const EXTRACTION_STATUS_CONFIG: Record<
  ExtractionStatus,
  { label: string; bg: string; text: string }
> = {
  complete: { label: "Complete", bg: "bg-green-50", text: "text-green-700" },
  in_progress: { label: "In Progress", bg: "bg-amber-50", text: "text-amber-700" },
  failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700" },
  pending: { label: "Pending", bg: "bg-zinc-50", text: "text-zinc-600" },
};

// ── Document type configuration ──────────────────────────────────────
export const DOCUMENT_TYPE_CONFIG: Record<
  PortalDocumentType,
  { label: string; bg: string; text: string }
> = {
  application: { label: "Application", bg: "bg-blue-50", text: "text-blue-700" },
  loss_runs: { label: "Loss Runs", bg: "bg-amber-50", text: "text-amber-700" },
  schedule: { label: "Schedule", bg: "bg-purple-50", text: "text-purple-700" },
  endorsement: { label: "Endorsement", bg: "bg-sky-50", text: "text-sky-700" },
  supplemental: { label: "Supplemental", bg: "bg-teal-50", text: "text-teal-700" },
  correspondence: { label: "Correspondence", bg: "bg-zinc-50", text: "text-zinc-600" },
};

// ── Coverage type options (for filters) ──────────────────────────────
export const COVERAGE_TYPES = [
  "General Liability",
  "Professional Liability",
  "Cyber Liability",
  "Employment Practices",
  "Umbrella/Excess",
  "Property",
  "Products Liability",
] as const;

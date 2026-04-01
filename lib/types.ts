// ── Core enums & unions ──────────────────────────────────────────────

export type TightnessDirection = "tighter" | "broader" | "neutral";
export type Severity = "high" | "medium" | "low";
export type MechanismType =
  | "exclusion"
  | "condition"
  | "definition_narrowing"
  | "sublimit"
  | "trigger";
export type TriageBucket = "auto_decline" | "needs_review" | "auto_quote";
export type MatchType = "one_to_one" | "one_to_many" | "unmatched";
export type RegressionStatus = "pass" | "fail" | "warning";
export type CoverageOutcome = "covered" | "not_covered" | "partial";
export type WorkflowStageStatus = "complete" | "running" | "pending";

// ── Provenance (attached to every extracted element) ─────────────────

export interface Provenance {
  documentId: string;
  documentName: string;
  pageNumber: number;
  boundingBox?: string;
  clauseId?: string;
  extractionConfidence: number;
  modelVersion: string;
  extractionTimestamp: string;
}

// ── Evidence ─────────────────────────────────────────────────────────

export interface EvidenceSpan {
  fullText: string;
  highlightStart: number;
  highlightEnd: number;
  provenance: Provenance;
}

// ── PolicyLab: Clause Deltas ─────────────────────────────────────────

export interface ClauseDelta {
  id: string;
  title: string;
  coverageType: string;
  naicsCode: string;
  naicsDescription: string;
  direction: TightnessDirection;
  mechanism: MechanismType;
  severity: Severity;
  confidence: number;
  abstained: boolean;
  pcCommercialSpan: EvidenceSpan;
  kinsaleSpan: EvidenceSpan;
  plainLanguageExplanation: string;
  reasoningSteps: string[];
  pcCommercialProvenance: Provenance;
  kinsaleProvenance: Provenance;
}

// ── PolicyLab: Scorecards ────────────────────────────────────────────

export interface ScorecardSegment {
  id: string;
  naicsCode: string;
  naicsDescription: string;
  coverageType: string;
  totalClauses: number;
  tighterCount: number;
  broaderCount: number;
  neutralCount: number;
  highSeverityCount: number;
  topMechanisms: MechanismType[];
  clauseDeltaIds: string[];
}

// ── PolicyLab: Scenarios ─────────────────────────────────────────────

export interface ScenarioOutcome {
  outcome: CoverageOutcome;
  reasoning: string;
  triggerClause?: EvidenceSpan;
  exclusionClause?: EvidenceSpan;
}

export interface ClaimVignette {
  id: string;
  title: string;
  coverageType: string;
  narrative: string;
  pcCommercialOutcome: ScenarioOutcome;
  kinsaleOutcome: ScenarioOutcome;
  regressionStatus: RegressionStatus;
  relatedClauseDeltaIds: string[];
  confidence: number;
  provenance: Provenance;
}

// ── PolicyLab: Pricing ───────────────────────────────────────────────

export interface TermGapOpportunity {
  clauseDeltaId: string;
  clauseTitle: string;
  estimatedPremiumImpact: number;
}

export interface PricingComparison {
  id: string;
  insuredName: string;
  naicsCode: string;
  naicsDescription: string;
  coverageType: string;
  pcCommercialPremium: number;
  kinsalePremium: number;
  premiumDeltaPercent: number;
  tightnessScore: number;
  outcome: "pc_commercial_wins" | "kinsale_wins" | "competitive";
  termGapOpportunities: TermGapOpportunity[];
}

// ── PolicyLab: Clause Alignment ──────────────────────────────────────

export interface ClauseAlignment {
  id: string;
  matchType: MatchType;
  pcCommercialClauses: { id: string; title: string; formNumber: string }[];
  kinsaleClauses: { id: string; title: string; formNumber: string }[];
  retrievalScore: number;
  rerankScore: number;
  anchorTerms: string[];
  confidence: number;
  provenance: Provenance;
}

// ── PolicyLab: Document Audit ────────────────────────────────────────

export interface ChunkBoundary {
  chunkId: string;
  startPage: number;
  endPage: number;
  sectionTitle: string;
}

export interface FieldExtraction {
  fieldName: string;
  extractedValue: string;
  confidence: number;
  sourcePage: number;
}

export interface DocumentIssue {
  type: "low_confidence" | "missing_field" | "scan_artifact" | "layout_error";
  description: string;
  page?: number;
  severity: Severity;
}

export interface DocumentAudit {
  id: string;
  documentName: string;
  insurer: "P&C Commercial" | "Kinsale";
  pageCount: number;
  ocrConfidence: number;
  chunkCount: number;
  chunkBoundaries: ChunkBoundary[];
  pageConfidences: { page: number; confidence: number }[];
  fieldExtractions: FieldExtraction[];
  issues: DocumentIssue[];
}

// ── ProposalEngine: Submissions ──────────────────────────────────────

export interface RiskFlag {
  name: string;
  severity: Severity;
  evidence: string;
}

export interface Submission {
  id: string;
  insuredName: string;
  naicsCode: string;
  naicsDescription: string;
  coverageType: string;
  state: string;
  broker: string;
  submittedDate: string;
  premiumEstimate: number;
  qualityScore: number;
  triageBucket: TriageBucket;
  triageConfidence: number;
  riskFlags: RiskFlag[];
  routingReason: string;
  hasWorkflow: boolean;
}

// ── ProposalEngine: Workflow Deep Dive ───────────────────────────────

export interface WorkflowClassify {
  naicsCode: string;
  naicsDescription: string;
  coverageTypes: string[];
  qualityScore: number;
  riskFlags: RiskFlag[];
  confidence: number;
  reasoningSteps: { step: number; description: string; evidence: string; confidence: number }[];
  provenance: Provenance;
}

export interface SimilarInsured {
  name: string;
  naicsCode: string;
  similarityScore: number;
  priorOutcome: string;
  lossRatio: number;
}

export interface RelevantLoss {
  description: string;
  amount: number;
  year: number;
  relevanceScore: number;
}

export interface ClauseFingerprint {
  clauseId: string;
  title: string;
  matchScore: number;
}

export interface WorkflowRetrieve {
  similarInsureds: SimilarInsured[];
  relevantLosses: RelevantLoss[];
  clauseFingerprints: ClauseFingerprint[];
  provenance: Provenance;
}

export interface TighteningOption {
  description: string;
  impactEstimate: string;
  evidenceSpan: EvidenceSpan;
}

export interface WorkflowAnalyze {
  relevantClauseDeltas: {
    clauseDeltaId: string;
    title: string;
    direction: TightnessDirection;
    severity: Severity;
    recommendation: string;
  }[];
  tighteningOptions: TighteningOption[];
  provenance: Provenance;
}

export interface LossFeature {
  name: string;
  value: string;
  weight: number;
}

export interface ClauseImpact {
  clauseTitle: string;
  impactValue: number;
}

export interface WorkflowEvaluate {
  appetiteScore: number;
  lossFeatures: LossFeature[];
  clauseImpacts: ClauseImpact[];
  combinedScore: number;
  confidence: number;
  calibrationBucket: string;
  provenance: Provenance;
}

export interface Recommendation {
  action: string;
  rationale: string;
  citations: Provenance[];
}

export interface WorkflowExplain {
  overallRecommendation: "accept" | "decline" | "review";
  summary: string;
  recommendations: Recommendation[];
  reasoningSteps: { step: number; description: string; evidence: string; confidence: number }[];
  provenance: Provenance;
}

export interface WorkflowDeepDive {
  submissionId: string;
  startedAt: string;
  completedAt: string;
  modelVersion: string;
  stages: {
    classify: { status: WorkflowStageStatus; data: WorkflowClassify };
    retrieve: { status: WorkflowStageStatus; data: WorkflowRetrieve };
    analyze: { status: WorkflowStageStatus; data: WorkflowAnalyze };
    evaluate: { status: WorkflowStageStatus; data: WorkflowEvaluate };
    explain: { status: WorkflowStageStatus; data: WorkflowExplain };
  };
}

// ── Dashboard ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  phase2: {
    totalClauseDeltas: number;
    kinsaleTighterPercent: number;
    highSeverityCount: number;
    scenariosPassingRatio: string;
    tightnessDistribution: { tighter: number; broader: number; neutral: number };
  };
  phase3: {
    totalSubmissions: number;
    autoQuoteRate: number;
    avgTriageConfidence: number;
    avgProcessingMs: number;
    bucketDistribution: { auto_decline: number; needs_review: number; auto_quote: number };
  };
  system: {
    modelVersion: string;
    dataFreshness: string;
    documentsProcessed: number;
    avgOcrConfidence: number;
  };
}

export interface RecentActivity {
  type: "clause_delta" | "submission" | "document" | "scenario";
  title: string;
  timestamp: string;
  link: string;
}

// ── Filter ───────────────────────────────────────────────────────────

export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

// ── Submission Portal ───────────────────────────────────────────────

export type PortalSubmissionStatus =
  | "preparing_to_uw"
  | "ai_underwriting"
  | "ready_for_uw_review"
  | "under_review"
  | "proposal_produced"
  | "bound"
  | "declined";

export type LineOfBusiness =
  | "General Liability"
  | "Professional Liability"
  | "Cyber Liability"
  | "Products Liability"
  | "Umbrella/Excess"
  | "Property"
  | "Employment Practices";

export interface PortalUser {
  id: string;
  name: string;
  role: "underwriter" | "approver" | "admin";
}

export interface StatusTimelineEntry {
  status: PortalSubmissionStatus;
  timestamp: string;
  user: string;
  note?: string;
}

export interface InsuredLocation {
  address: string;
  type?: string;
  description?: string;
  reportable: boolean;
  effectiveStart?: string;
  effectiveEnd?: string;
}

export interface PortalSubmission {
  id: string;
  referenceNumber: string;
  insuredName: string;
  status: PortalSubmissionStatus;
  lineOfBusiness: LineOfBusiness;
  premiumIndication: number;
  proposalCount: number;
  assignedUnderwriter?: string;
  approver?: string;
  receivedDate: string;
  lastUpdated: string;
  effectiveDate: string;
  expirationDate: string;
  broker: string;
  brokerContact?: string;
  brokerEmail?: string;
  brokerPhone?: string;
  state: string;
  primaryAddress?: string;
  naicsCode: string;
  naicsDescription: string;
  companyUrl?: string;
  insuredLocations?: InsuredLocation[];
  submissionSummary?: string;
  timeline: StatusTimelineEntry[];
}

export interface PortalProposal {
  id: string;
  submissionId: string;
  label: string;
  description?: string;
  aiGenerated?: boolean;
  version: number;
  status: "draft" | "pending_approval" | "approved" | "declined";
  totalPremium: number;
  basePremium: number;
  commission: number;
  createdDate: string;
  forms: PortalForm[];
}

export interface PortalForm {
  id: string;
  formNumber: string;
  formName: string;
  type: "coverage" | "endorsement" | "exclusion";
  defaultAdjustment: number;
  customAdjustment: number;
  debitsCredits: PortalDebitCredit[];
}

export interface PortalDebitCredit {
  id: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
}

export interface PortalRate {
  id: string;
  submissionId: string;
  locationAddress?: string;
  classCode: string;
  classDescription: string;
  territory: string;
  baseRate: number;
  exposure: number;
  exposureBase: string;
  manualPremium: number;
  lcm: number;
  adjustedPremium: number;
}

export interface PortalLossRun {
  id: string;
  submissionId: string;
  policyYear: string;
  carrier: string;
  premium: number;
  claims: number;
  incurred: number;
  paid: number;
  reserves: number;
  lossRatio: number;
}

export interface PortalLossDetail {
  id: string;
  dateOfLoss: string;
  groundUpIndemnity: number;
  groundUpExpense: number;
  groundUpTotalIncurred: number;
  indemnityLessDeductible: number;
  includableLosses: number;
  policyPeriod: string;
}

export interface PortalLargeLoss {
  id: string;
  submissionId: string;
  policyYear: string;
  description: string;
  claimAmount: number;
  status: "open" | "closed";
}

export type PortalDocumentType = "application" | "loss_runs" | "schedule" | "endorsement" | "supplemental" | "correspondence";
export type ExtractionStatus = "complete" | "in_progress" | "failed" | "pending";

export interface PortalDocument {
  id: string;
  submissionId: string;
  fileName: string;
  documentType: PortalDocumentType;
  uploadedDate: string;
  fileSize: string;
  extractionStatus: ExtractionStatus;
  satoraOutput?: string;
}

export interface PortalNote {
  id: string;
  submissionId: string;
  type: "note" | "email";
  author: string;
  timestamp: string;
  content: string;
  // email-specific fields
  from?: string;
  to?: string;
  subject?: string;
}

export type SubmissionFormType = "policy" | "coverage" | "endorsement" | "exclusion" | "notice";

export interface SubmissionFormAdjustment {
  id: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
}

export interface SubmissionFormFillIn {
  id: string;
  label: string;
  value: string;
}

export interface SubmissionForm {
  id: string;
  formNumber: string;
  edition: string;
  formName: string;
  type: SubmissionFormType;
  category: string;
  description?: string;
  adjustments?: SubmissionFormAdjustment[];
  fillIns?: SubmissionFormFillIn[];
}

export interface PortalStructuredField {
  id: string;
  submissionId: string;
  fieldGroup: string;
  fieldName: string;
  extractedValue: string;
  confidence: number;
  override?: string;
}

// ── Claims Search ─────────────────────────────────────────────────────

export type ClaimStatus = "open" | "closed" | "reserved" | "litigation";
export type ClaimCategory =
  | "bodily_injury"
  | "property_damage"
  | "products_liability"
  | "completed_operations"
  | "personal_injury"
  | "advertising_injury";

export interface ClaimDocument {
  id: string;
  title: string;
  text: string;
}

export interface MockClaim {
  id: string;
  claimNumber: string;
  claimantName: string;
  insuredName: string;
  dateOfLoss: string;
  dateReported: string;
  status: ClaimStatus;
  category: ClaimCategory;
  amount: number;
  reserveAmount: number;
  description: string;
  notes: string[];
  documents: ClaimDocument[];
  associatedFormNumbers: string[];
  state: string;
  naicsCode: string;
}

export interface ClaimSearchResult {
  claim: MockClaim;
  relevanceScore: number;
  matchedSnippet: string;
  matchedField: string;
  highlightStart: number;
  highlightEnd: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  results?: ClaimSearchResult[];
  isLoading?: boolean;
  selectedForm?: { formNumber: string; formName: string };
}

// ── Claim Sets & Cost Allocation ─────────────────────────────────────

export interface CostAllocationEntry {
  formNumber: string;
  formName: string;
  percentage: number; // 0-100, all entries in a set must sum to 100
}

export interface ClaimSet {
  id: string;
  name: string;
  createdAt: string;
  claimIds: string[];
  allocations: CostAllocationEntry[];
}

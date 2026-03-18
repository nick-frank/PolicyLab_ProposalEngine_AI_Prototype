import type {
  PortalSubmission,
  PortalProposal,
  PortalRate,
  PortalLossRun,
  PortalLargeLoss,
  PortalDocument,
  PortalNote,
  PortalStructuredField,
  PortalUser,
  SubmissionForm,
} from "../types";

// ── Users ────────────────────────────────────────────────────────────

export const PORTAL_USERS: PortalUser[] = [
  { id: "u1", name: "Sarah Chen", role: "underwriter" },
  { id: "u2", name: "Michael Torres", role: "underwriter" },
  { id: "u3", name: "Jennifer Park", role: "approver" },
  { id: "u4", name: "David Kim", role: "admin" },
];

// ── Submissions ──────────────────────────────────────────────────────

export const PORTAL_SUBMISSIONS: PortalSubmission[] = [
  {
    id: "ps-001",
    referenceNumber: "SUB-2026-001",
    insuredName: "Pacific Coast Builders LLC",
    status: "under_review",
    lineOfBusiness: "General Liability",
    premiumIndication: 45000,
    proposalCount: 1,
    assignedUnderwriter: "Sarah Chen",
    approver: "Jennifer Park",
    receivedDate: "2026-02-15",
    lastUpdated: "2026-03-10",
    effectiveDate: "2026-04-01",
    expirationDate: "2027-04-01",
    broker: "Marsh McLennan",
    state: "CA",
    naicsCode: "236220",
    naicsDescription: "Commercial Building Construction",
    timeline: [
      { status: "received", timestamp: "2026-02-15T09:30:00Z", user: "System" },
      { status: "open", timestamp: "2026-02-16T10:15:00Z", user: "Sarah Chen", note: "Assigned for review" },
      { status: "under_review", timestamp: "2026-03-01T14:00:00Z", user: "Sarah Chen", note: "Reviewing loss runs and application" },
    ],
  },
  {
    id: "ps-002",
    referenceNumber: "SUB-2026-002",
    insuredName: "Meridian Tech Solutions Inc.",
    status: "proposal_produced",
    lineOfBusiness: "Professional Liability",
    premiumIndication: 28500,
    proposalCount: 2,
    assignedUnderwriter: "Michael Torres",
    approver: "Jennifer Park",
    receivedDate: "2026-01-20",
    lastUpdated: "2026-03-08",
    effectiveDate: "2026-05-01",
    expirationDate: "2027-05-01",
    broker: "Aon Risk Solutions",
    state: "NY",
    naicsCode: "541512",
    naicsDescription: "Computer Systems Design Services",
    timeline: [
      { status: "received", timestamp: "2026-01-20T11:00:00Z", user: "System" },
      { status: "open", timestamp: "2026-01-21T08:30:00Z", user: "Michael Torres" },
      { status: "under_review", timestamp: "2026-02-05T09:00:00Z", user: "Michael Torres" },
      { status: "proposal_produced", timestamp: "2026-03-08T16:45:00Z", user: "Michael Torres", note: "Good/Better/Best options created" },
    ],
  },
  {
    id: "ps-003",
    referenceNumber: "SUB-2026-003",
    insuredName: "Summit Healthcare Group",
    status: "bound",
    lineOfBusiness: "General Liability",
    premiumIndication: 72000,
    proposalCount: 1,
    assignedUnderwriter: "Sarah Chen",
    approver: "Jennifer Park",
    receivedDate: "2025-12-10",
    lastUpdated: "2026-02-28",
    effectiveDate: "2026-03-01",
    expirationDate: "2027-03-01",
    broker: "Willis Towers Watson",
    state: "TX",
    naicsCode: "621111",
    naicsDescription: "Offices of Physicians",
    timeline: [
      { status: "received", timestamp: "2025-12-10T14:00:00Z", user: "System" },
      { status: "open", timestamp: "2025-12-11T09:00:00Z", user: "Sarah Chen" },
      { status: "under_review", timestamp: "2025-12-20T10:30:00Z", user: "Sarah Chen" },
      { status: "proposal_produced", timestamp: "2026-01-15T11:00:00Z", user: "Sarah Chen" },
      { status: "bound", timestamp: "2026-02-28T15:30:00Z", user: "Jennifer Park", note: "Broker accepted proposal" },
    ],
  },
  {
    id: "ps-004",
    referenceNumber: "SUB-2026-004",
    insuredName: "Greenfield Manufacturing Co.",
    status: "received",
    lineOfBusiness: "Products Liability",
    premiumIndication: 95000,
    proposalCount: 0,
    assignedUnderwriter: "Michael Torres",
    receivedDate: "2026-03-12",
    lastUpdated: "2026-03-12",
    effectiveDate: "2026-06-01",
    expirationDate: "2027-06-01",
    broker: "Lockton Companies",
    state: "OH",
    naicsCode: "332710",
    naicsDescription: "Machine Shops",
    timeline: [
      { status: "received", timestamp: "2026-03-12T08:00:00Z", user: "System" },
    ],
  },
  {
    id: "ps-005",
    referenceNumber: "SUB-2026-005",
    insuredName: "Coastal Dining Group",
    status: "declined",
    lineOfBusiness: "General Liability",
    premiumIndication: 18000,
    proposalCount: 0,
    assignedUnderwriter: "Sarah Chen",
    receivedDate: "2026-02-01",
    lastUpdated: "2026-02-20",
    effectiveDate: "2026-04-15",
    expirationDate: "2027-04-15",
    broker: "Brown & Brown",
    state: "FL",
    naicsCode: "722511",
    naicsDescription: "Full-Service Restaurants",
    timeline: [
      { status: "received", timestamp: "2026-02-01T10:00:00Z", user: "System" },
      { status: "open", timestamp: "2026-02-02T09:15:00Z", user: "Sarah Chen" },
      { status: "under_review", timestamp: "2026-02-10T11:00:00Z", user: "Sarah Chen" },
      { status: "declined", timestamp: "2026-02-20T14:00:00Z", user: "Sarah Chen", note: "Loss history outside appetite — 3 liquor liability claims in 2 years" },
    ],
  },
  {
    id: "ps-006",
    referenceNumber: "SUB-2026-006",
    insuredName: "Apex Security Services",
    status: "open",
    lineOfBusiness: "General Liability",
    premiumIndication: 35000,
    proposalCount: 0,
    assignedUnderwriter: "Michael Torres",
    receivedDate: "2026-03-05",
    lastUpdated: "2026-03-06",
    effectiveDate: "2026-05-15",
    expirationDate: "2027-05-15",
    broker: "Gallagher",
    state: "IL",
    naicsCode: "561612",
    naicsDescription: "Security Guards and Patrol Services",
    timeline: [
      { status: "received", timestamp: "2026-03-05T13:30:00Z", user: "System" },
      { status: "open", timestamp: "2026-03-06T08:00:00Z", user: "Michael Torres", note: "Initial document review" },
    ],
  },
  {
    id: "ps-007",
    referenceNumber: "SUB-2026-007",
    insuredName: "Riverside Property Management",
    status: "closed",
    lineOfBusiness: "Property",
    premiumIndication: 52000,
    proposalCount: 1,
    assignedUnderwriter: "Sarah Chen",
    receivedDate: "2025-11-15",
    lastUpdated: "2026-01-30",
    effectiveDate: "2026-01-01",
    expirationDate: "2027-01-01",
    broker: "Hub International",
    state: "AZ",
    naicsCode: "531311",
    naicsDescription: "Residential Property Managers",
    timeline: [
      { status: "received", timestamp: "2025-11-15T10:00:00Z", user: "System" },
      { status: "open", timestamp: "2025-11-16T09:00:00Z", user: "Sarah Chen" },
      { status: "under_review", timestamp: "2025-11-25T10:00:00Z", user: "Sarah Chen" },
      { status: "proposal_produced", timestamp: "2025-12-10T14:00:00Z", user: "Sarah Chen" },
      { status: "bound", timestamp: "2025-12-28T11:00:00Z", user: "Jennifer Park" },
      { status: "closed", timestamp: "2026-01-30T16:00:00Z", user: "System", note: "Policy issued — file closed" },
    ],
  },
  {
    id: "ps-008",
    referenceNumber: "SUB-2026-008",
    insuredName: "Northstar Logistics Inc.",
    status: "under_review",
    lineOfBusiness: "Umbrella/Excess",
    premiumIndication: 125000,
    proposalCount: 0,
    assignedUnderwriter: "Michael Torres",
    approver: "Jennifer Park",
    receivedDate: "2026-02-28",
    lastUpdated: "2026-03-14",
    effectiveDate: "2026-07-01",
    expirationDate: "2027-07-01",
    broker: "Marsh McLennan",
    state: "GA",
    naicsCode: "484121",
    naicsDescription: "General Freight Trucking, Long-Distance",
    timeline: [
      { status: "received", timestamp: "2026-02-28T09:00:00Z", user: "System" },
      { status: "open", timestamp: "2026-03-01T10:30:00Z", user: "Michael Torres" },
      { status: "under_review", timestamp: "2026-03-14T09:00:00Z", user: "Michael Torres", note: "Reviewing umbrella attachment point" },
    ],
  },
  {
    id: "ps-009",
    referenceNumber: "SUB-2026-009",
    insuredName: "BlueWave Cyber Consulting",
    status: "received",
    lineOfBusiness: "Cyber Liability",
    premiumIndication: 41000,
    proposalCount: 0,
    assignedUnderwriter: "Sarah Chen",
    receivedDate: "2026-03-16",
    lastUpdated: "2026-03-16",
    effectiveDate: "2026-06-01",
    expirationDate: "2027-06-01",
    broker: "Aon Risk Solutions",
    state: "WA",
    naicsCode: "541519",
    naicsDescription: "Other Computer Related Services",
    timeline: [
      { status: "received", timestamp: "2026-03-16T15:00:00Z", user: "System" },
    ],
  },
];

export const PORTAL_SUBMISSION_MAP: Record<string, PortalSubmission> = {};
for (const s of PORTAL_SUBMISSIONS) {
  PORTAL_SUBMISSION_MAP[s.id] = s;
}

// ── Proposals ────────────────────────────────────────────────────────

export const PORTAL_PROPOSALS: PortalProposal[] = [
  {
    id: "prop-001",
    submissionId: "ps-001",
    label: "Standard GL Program",
    version: 1,
    status: "draft",
    totalPremium: 45000,
    basePremium: 38000,
    commission: 6750,
    createdDate: "2026-03-10",
    forms: [
      {
        id: "f-001",
        formNumber: "CG 00 01",
        formName: "Commercial General Liability Coverage Form",
        type: "coverage",
        defaultAdjustment: 0,
        customAdjustment: 0,
        debitsCredits: [
          { id: "dc-001", description: "Base premium", type: "debit", amount: 38000 },
        ],
      },
      {
        id: "f-002",
        formNumber: "CG 21 06",
        formName: "Exclusion — Access or Disclosure of Confidential Information",
        type: "exclusion",
        defaultAdjustment: -5,
        customAdjustment: -5,
        debitsCredits: [
          { id: "dc-002", description: "Cyber exclusion credit", type: "credit", amount: 1900 },
        ],
      },
      {
        id: "f-003",
        formNumber: "CG 24 04",
        formName: "Waiver of Transfer of Rights of Recovery Against Others",
        type: "endorsement",
        defaultAdjustment: 3,
        customAdjustment: 3,
        debitsCredits: [
          { id: "dc-003", description: "Waiver of subrogation charge", type: "debit", amount: 1140 },
        ],
      },
    ],
  },
  {
    id: "prop-002",
    submissionId: "ps-002",
    label: "Good — Essential Coverage",
    version: 1,
    status: "approved",
    totalPremium: 22000,
    basePremium: 20000,
    commission: 3300,
    createdDate: "2026-03-01",
    forms: [
      {
        id: "f-004",
        formNumber: "PL 00 01",
        formName: "Professional Liability Coverage Form",
        type: "coverage",
        defaultAdjustment: 0,
        customAdjustment: 0,
        debitsCredits: [
          { id: "dc-004", description: "Base professional liability premium", type: "debit", amount: 20000 },
        ],
      },
      {
        id: "f-005",
        formNumber: "PL 21 01",
        formName: "Technology E&O Extension",
        type: "endorsement",
        defaultAdjustment: 10,
        customAdjustment: 10,
        debitsCredits: [
          { id: "dc-005", description: "Tech E&O surcharge", type: "debit", amount: 2000 },
        ],
      },
    ],
  },
  {
    id: "prop-003",
    submissionId: "ps-002",
    label: "Better — Enhanced Coverage",
    version: 2,
    status: "pending_approval",
    totalPremium: 28500,
    basePremium: 24000,
    commission: 4275,
    createdDate: "2026-03-08",
    forms: [
      {
        id: "f-006",
        formNumber: "PL 00 01",
        formName: "Professional Liability Coverage Form",
        type: "coverage",
        defaultAdjustment: 0,
        customAdjustment: 0,
        debitsCredits: [
          { id: "dc-006", description: "Base professional liability premium", type: "debit", amount: 24000 },
        ],
      },
      {
        id: "f-007",
        formNumber: "PL 21 01",
        formName: "Technology E&O Extension",
        type: "endorsement",
        defaultAdjustment: 10,
        customAdjustment: 10,
        debitsCredits: [
          { id: "dc-007", description: "Tech E&O surcharge", type: "debit", amount: 2400 },
        ],
      },
      {
        id: "f-008",
        formNumber: "PL 22 03",
        formName: "Cyber Incident Response Coverage",
        type: "endorsement",
        defaultAdjustment: 8,
        customAdjustment: 8,
        debitsCredits: [
          { id: "dc-008", description: "Cyber incident response", type: "debit", amount: 1920 },
          { id: "dc-009", description: "Multi-line discount", type: "credit", amount: 820 },
        ],
      },
    ],
  },
  {
    id: "prop-004",
    submissionId: "ps-003",
    label: "Healthcare GL Program",
    version: 1,
    status: "approved",
    totalPremium: 72000,
    basePremium: 62000,
    commission: 10800,
    createdDate: "2026-01-15",
    forms: [
      {
        id: "f-009",
        formNumber: "CG 00 01",
        formName: "Commercial General Liability Coverage Form",
        type: "coverage",
        defaultAdjustment: 0,
        customAdjustment: 0,
        debitsCredits: [
          { id: "dc-010", description: "Base GL premium", type: "debit", amount: 62000 },
        ],
      },
      {
        id: "f-010",
        formNumber: "CG 22 79",
        formName: "Abuse or Molestation Exclusion",
        type: "exclusion",
        defaultAdjustment: -8,
        customAdjustment: -8,
        debitsCredits: [
          { id: "dc-011", description: "Abuse/molestation exclusion credit", type: "credit", amount: 4960 },
        ],
      },
      {
        id: "f-011",
        formNumber: "CG 04 35",
        formName: "Employee Benefits Liability Coverage",
        type: "endorsement",
        defaultAdjustment: 15,
        customAdjustment: 15,
        debitsCredits: [
          { id: "dc-012", description: "EBL coverage premium", type: "debit", amount: 9300 },
        ],
      },
      {
        id: "f-012",
        formNumber: "IL 00 21",
        formName: "Nuclear Energy Liability Exclusion",
        type: "exclusion",
        defaultAdjustment: 0,
        customAdjustment: 0,
        debitsCredits: [],
      },
    ],
  },
];

export const PORTAL_PROPOSAL_MAP: Record<string, PortalProposal> = {};
for (const p of PORTAL_PROPOSALS) {
  PORTAL_PROPOSAL_MAP[p.id] = p;
}

// ── Rates (keyed by submissionId) ────────────────────────────────────

export const PORTAL_RATES: Record<string, PortalRate[]> = {
  "ps-001": [
    { id: "r-001", submissionId: "ps-001", classCode: "91580", classDescription: "Contractors — General (Subcontracted Work)", territory: "CA-01", baseRate: 12.50, exposure: 1500000, exposureBase: "Payroll", manualPremium: 18750, lcm: 1.20, adjustedPremium: 22500 },
    { id: "r-002", submissionId: "ps-001", classCode: "91340", classDescription: "Contractors — Carpentry", territory: "CA-01", baseRate: 8.75, exposure: 800000, exposureBase: "Payroll", manualPremium: 7000, lcm: 1.10, adjustedPremium: 7700 },
    { id: "r-003", submissionId: "ps-001", classCode: "91150", classDescription: "Contractors — Concrete Work", territory: "CA-01", baseRate: 15.20, exposure: 600000, exposureBase: "Payroll", manualPremium: 9120, lcm: 1.15, adjustedPremium: 10488 },
  ],
  "ps-002": [
    { id: "r-004", submissionId: "ps-002", classCode: "41677", classDescription: "Computer Consulting Services", territory: "NY-01", baseRate: 5.25, exposure: 3200000, exposureBase: "Revenue", manualPremium: 16800, lcm: 1.00, adjustedPremium: 16800 },
    { id: "r-005", submissionId: "ps-002", classCode: "41675", classDescription: "Software Development", territory: "NY-01", baseRate: 4.80, exposure: 1800000, exposureBase: "Revenue", manualPremium: 8640, lcm: 0.95, adjustedPremium: 8208 },
  ],
  "ps-003": [
    { id: "r-006", submissionId: "ps-003", classCode: "64074", classDescription: "Physicians — General Practice", territory: "TX-01", baseRate: 18.00, exposure: 2500000, exposureBase: "Revenue", manualPremium: 45000, lcm: 1.25, adjustedPremium: 56250 },
    { id: "r-007", submissionId: "ps-003", classCode: "64073", classDescription: "Physicians — Clinics", territory: "TX-01", baseRate: 10.50, exposure: 1200000, exposureBase: "Revenue", manualPremium: 12600, lcm: 1.10, adjustedPremium: 13860 },
  ],
};

// ── Loss Runs (keyed by submissionId) ────────────────────────────────

export const PORTAL_LOSS_RUNS: Record<string, PortalLossRun[]> = {
  "ps-001": [
    { id: "lr-001", submissionId: "ps-001", policyYear: "2023-2024", carrier: "Hartford", premium: 38000, claims: 2, incurred: 12500, paid: 10000, reserves: 2500, lossRatio: 0.329 },
    { id: "lr-002", submissionId: "ps-001", policyYear: "2022-2023", carrier: "Hartford", premium: 35000, claims: 1, incurred: 5200, paid: 5200, reserves: 0, lossRatio: 0.149 },
    { id: "lr-003", submissionId: "ps-001", policyYear: "2021-2022", carrier: "CNA", premium: 32000, claims: 3, incurred: 28000, paid: 25000, reserves: 3000, lossRatio: 0.875 },
    { id: "lr-004", submissionId: "ps-001", policyYear: "2020-2021", carrier: "CNA", premium: 30000, claims: 0, incurred: 0, paid: 0, reserves: 0, lossRatio: 0 },
    { id: "lr-005", submissionId: "ps-001", policyYear: "2019-2020", carrier: "CNA", premium: 28000, claims: 1, incurred: 8500, paid: 8500, reserves: 0, lossRatio: 0.304 },
  ],
  "ps-002": [
    { id: "lr-006", submissionId: "ps-002", policyYear: "2023-2024", carrier: "Travelers", premium: 25000, claims: 0, incurred: 0, paid: 0, reserves: 0, lossRatio: 0 },
    { id: "lr-007", submissionId: "ps-002", policyYear: "2022-2023", carrier: "Travelers", premium: 22000, claims: 1, incurred: 15000, paid: 15000, reserves: 0, lossRatio: 0.682 },
    { id: "lr-008", submissionId: "ps-002", policyYear: "2021-2022", carrier: "Zurich", premium: 20000, claims: 0, incurred: 0, paid: 0, reserves: 0, lossRatio: 0 },
  ],
  "ps-003": [
    { id: "lr-009", submissionId: "ps-003", policyYear: "2023-2024", carrier: "Berkley", premium: 65000, claims: 4, incurred: 42000, paid: 35000, reserves: 7000, lossRatio: 0.646 },
    { id: "lr-010", submissionId: "ps-003", policyYear: "2022-2023", carrier: "Berkley", premium: 60000, claims: 2, incurred: 18000, paid: 18000, reserves: 0, lossRatio: 0.300 },
    { id: "lr-011", submissionId: "ps-003", policyYear: "2021-2022", carrier: "Markel", premium: 55000, claims: 3, incurred: 31000, paid: 28000, reserves: 3000, lossRatio: 0.564 },
  ],
};

// ── Large Losses ─────────────────────────────────────────────────────

export const PORTAL_LARGE_LOSSES: Record<string, PortalLargeLoss[]> = {
  "ps-001": [
    { id: "ll-001", submissionId: "ps-001", policyYear: "2021-2022", description: "Scaffolding collapse — third-party bodily injury at job site", claimAmount: 22000, status: "closed" },
  ],
  "ps-003": [
    { id: "ll-002", submissionId: "ps-003", policyYear: "2023-2024", description: "Slip and fall in waiting room — patient hip fracture", claimAmount: 28000, status: "open" },
    { id: "ll-003", submissionId: "ps-003", policyYear: "2021-2022", description: "Medication error — adverse reaction claim", claimAmount: 25000, status: "closed" },
  ],
};

// ── Documents ────────────────────────────────────────────────────────

export const PORTAL_DOCUMENTS: Record<string, PortalDocument[]> = {
  "ps-001": [
    { id: "d-001", submissionId: "ps-001", fileName: "ACORD_125_Application.pdf", documentType: "application", uploadedDate: "2026-02-15", fileSize: "2.4 MB", extractionStatus: "complete", satoraOutput: "Extracted 42 fields. Key findings: Named insured confirmed, 3 locations, annual revenue $4.2M." },
    { id: "d-002", submissionId: "ps-001", fileName: "Loss_Runs_2019-2024.pdf", documentType: "loss_runs", uploadedDate: "2026-02-15", fileSize: "1.8 MB", extractionStatus: "complete", satoraOutput: "5 policy years extracted. 7 total claims. 1 large loss identified (>$20K)." },
    { id: "d-003", submissionId: "ps-001", fileName: "Equipment_Schedule.xlsx", documentType: "schedule", uploadedDate: "2026-02-18", fileSize: "450 KB", extractionStatus: "complete" },
    { id: "d-004", submissionId: "ps-001", fileName: "Broker_Supplemental_Notes.pdf", documentType: "supplemental", uploadedDate: "2026-03-01", fileSize: "320 KB", extractionStatus: "in_progress" },
  ],
  "ps-002": [
    { id: "d-005", submissionId: "ps-002", fileName: "ACORD_125_Application.pdf", documentType: "application", uploadedDate: "2026-01-20", fileSize: "1.9 MB", extractionStatus: "complete", satoraOutput: "Extracted 38 fields. Tech company, 85 employees, $8.5M revenue." },
    { id: "d-006", submissionId: "ps-002", fileName: "Loss_Runs_2021-2024.pdf", documentType: "loss_runs", uploadedDate: "2026-01-20", fileSize: "980 KB", extractionStatus: "complete" },
    { id: "d-007", submissionId: "ps-002", fileName: "SOC2_Compliance_Report.pdf", documentType: "supplemental", uploadedDate: "2026-01-25", fileSize: "3.1 MB", extractionStatus: "complete" },
  ],
  "ps-004": [
    { id: "d-008", submissionId: "ps-004", fileName: "ACORD_125_Application.pdf", documentType: "application", uploadedDate: "2026-03-12", fileSize: "2.1 MB", extractionStatus: "pending" },
    { id: "d-009", submissionId: "ps-004", fileName: "Product_Catalog.pdf", documentType: "supplemental", uploadedDate: "2026-03-12", fileSize: "5.6 MB", extractionStatus: "failed", satoraOutput: "Error: Document appears to be image-only PDF with low OCR confidence (< 0.4)." },
  ],
};

// ── Notes & Emails ───────────────────────────────────────────────────

export const PORTAL_NOTES: Record<string, PortalNote[]> = {
  "ps-001": [
    { id: "n-001", submissionId: "ps-001", type: "note", author: "Sarah Chen", timestamp: "2026-03-10T14:30:00Z", content: "Reviewed loss runs — the 2021-2022 year is concerning with 87.5% loss ratio driven by scaffolding incident. Need to verify safety protocols have been updated." },
    { id: "n-002", submissionId: "ps-001", type: "email", author: "Sarah Chen", timestamp: "2026-03-05T10:00:00Z", content: "Hi Tom, could you provide updated safety program documentation and any OSHA inspection reports from the past 2 years? Also need confirmation on the subcontractor management program. Thanks, Sarah", from: "sarah.chen@markel.com", to: "tom.broker@marsh.com", subject: "RE: Pacific Coast Builders — Additional Information Needed" },
    { id: "n-003", submissionId: "ps-001", type: "email", author: "Tom Broker", timestamp: "2026-03-07T16:15:00Z", content: "Sarah, attached are the safety program docs and OSHA reports. Clean record since the 2021 incident. They implemented a comprehensive fall protection program in Q1 2022. Subcontractor qualification docs to follow. — Tom", from: "tom.broker@marsh.com", to: "sarah.chen@markel.com", subject: "RE: Pacific Coast Builders — Additional Information Needed" },
    { id: "n-004", submissionId: "ps-001", type: "note", author: "Sarah Chen", timestamp: "2026-03-01T09:00:00Z", content: "Initial review complete. Application looks complete, 3 California locations. Contractor class — need to verify subcontractor percentage." },
  ],
  "ps-002": [
    { id: "n-005", submissionId: "ps-002", type: "note", author: "Michael Torres", timestamp: "2026-03-08T16:00:00Z", content: "Created Good/Better/Best proposals. The 'Better' option includes cyber incident response which aligns well with their SOC2 compliance. Recommending this tier." },
    { id: "n-006", submissionId: "ps-002", type: "note", author: "Michael Torres", timestamp: "2026-02-05T09:30:00Z", content: "Tech company with strong risk management. SOC2 certified. Clean loss history except one E&O claim in 2022-2023 that was resolved favorably." },
  ],
  "ps-005": [
    { id: "n-007", submissionId: "ps-005", type: "note", author: "Sarah Chen", timestamp: "2026-02-20T14:00:00Z", content: "Declining — 3 liquor liability claims in 2 years, total incurred exceeds $85K. Loss ratio over 150%. Outside our restaurant program appetite guidelines." },
  ],
};

// ── Structured Fields (keyed by submissionId) ────────────────────────

export const PORTAL_STRUCTURED_FIELDS: Record<string, PortalStructuredField[]> = {
  "ps-001": [
    { id: "sf-001", submissionId: "ps-001", fieldGroup: "Insured Information", fieldName: "Named Insured", extractedValue: "Pacific Coast Builders LLC", confidence: 0.98 },
    { id: "sf-002", submissionId: "ps-001", fieldGroup: "Insured Information", fieldName: "DBA", extractedValue: "PCB Construction", confidence: 0.92 },
    { id: "sf-003", submissionId: "ps-001", fieldGroup: "Insured Information", fieldName: "FEIN", extractedValue: "94-3456789", confidence: 0.95 },
    { id: "sf-004", submissionId: "ps-001", fieldGroup: "Insured Information", fieldName: "Entity Type", extractedValue: "LLC", confidence: 0.99 },
    { id: "sf-005", submissionId: "ps-001", fieldGroup: "Operations", fieldName: "Primary Operations", extractedValue: "Commercial building construction, tenant improvements", confidence: 0.88 },
    { id: "sf-006", submissionId: "ps-001", fieldGroup: "Operations", fieldName: "Years in Business", extractedValue: "12", confidence: 0.94 },
    { id: "sf-007", submissionId: "ps-001", fieldGroup: "Operations", fieldName: "Number of Employees", extractedValue: "45", confidence: 0.91 },
    { id: "sf-008", submissionId: "ps-001", fieldGroup: "Operations", fieldName: "Annual Revenue", extractedValue: "$4,200,000", confidence: 0.96 },
    { id: "sf-009", submissionId: "ps-001", fieldGroup: "Operations", fieldName: "Subcontractor %", extractedValue: "35%", confidence: 0.78 },
    { id: "sf-010", submissionId: "ps-001", fieldGroup: "Locations", fieldName: "Number of Locations", extractedValue: "3", confidence: 0.97 },
    { id: "sf-011", submissionId: "ps-001", fieldGroup: "Locations", fieldName: "Primary Address", extractedValue: "1500 Industrial Pkwy, San Jose, CA 95131", confidence: 0.93 },
    { id: "sf-012", submissionId: "ps-001", fieldGroup: "Coverage", fieldName: "GL Occurrence Limit", extractedValue: "$1,000,000", confidence: 0.99 },
    { id: "sf-013", submissionId: "ps-001", fieldGroup: "Coverage", fieldName: "GL Aggregate Limit", extractedValue: "$2,000,000", confidence: 0.99 },
    { id: "sf-014", submissionId: "ps-001", fieldGroup: "Coverage", fieldName: "Products/Completed Ops Aggregate", extractedValue: "$2,000,000", confidence: 0.97 },
  ],
  "ps-002": [
    { id: "sf-015", submissionId: "ps-002", fieldGroup: "Insured Information", fieldName: "Named Insured", extractedValue: "Meridian Tech Solutions Inc.", confidence: 0.99 },
    { id: "sf-016", submissionId: "ps-002", fieldGroup: "Insured Information", fieldName: "FEIN", extractedValue: "13-7890123", confidence: 0.96 },
    { id: "sf-017", submissionId: "ps-002", fieldGroup: "Operations", fieldName: "Primary Operations", extractedValue: "IT consulting and custom software development", confidence: 0.90 },
    { id: "sf-018", submissionId: "ps-002", fieldGroup: "Operations", fieldName: "Number of Employees", extractedValue: "85", confidence: 0.93 },
    { id: "sf-019", submissionId: "ps-002", fieldGroup: "Operations", fieldName: "Annual Revenue", extractedValue: "$8,500,000", confidence: 0.95 },
    { id: "sf-020", submissionId: "ps-002", fieldGroup: "Coverage", fieldName: "PL Per Claim Limit", extractedValue: "$1,000,000", confidence: 0.98 },
    { id: "sf-021", submissionId: "ps-002", fieldGroup: "Coverage", fieldName: "PL Aggregate Limit", extractedValue: "$2,000,000", confidence: 0.98 },
  ],
};

// ── Proposal Rates (keyed by proposalId) ─────────────────────────────

export const PORTAL_PROPOSAL_RATES: Record<string, PortalRate[]> = {
  "prop-001": [
    { id: "pr-001", submissionId: "ps-001", classCode: "91580", classDescription: "Contractors — General (Subcontracted Work)", territory: "CA-01", baseRate: 12.50, exposure: 1500000, exposureBase: "Payroll", manualPremium: 18750, lcm: 1.20, adjustedPremium: 22500 },
    { id: "pr-002", submissionId: "ps-001", classCode: "91340", classDescription: "Contractors — Carpentry", territory: "CA-01", baseRate: 8.75, exposure: 800000, exposureBase: "Payroll", manualPremium: 7000, lcm: 1.10, adjustedPremium: 7700 },
    { id: "pr-003", submissionId: "ps-001", classCode: "91150", classDescription: "Contractors — Concrete Work", territory: "CA-01", baseRate: 15.20, exposure: 600000, exposureBase: "Payroll", manualPremium: 9120, lcm: 1.15, adjustedPremium: 10488 },
  ],
  "prop-002": [
    { id: "pr-004", submissionId: "ps-002", classCode: "41677", classDescription: "Computer Consulting Services", territory: "NY-01", baseRate: 5.25, exposure: 3200000, exposureBase: "Revenue", manualPremium: 16800, lcm: 1.00, adjustedPremium: 16800 },
  ],
  "prop-003": [
    { id: "pr-005", submissionId: "ps-002", classCode: "41677", classDescription: "Computer Consulting Services", territory: "NY-01", baseRate: 5.25, exposure: 3200000, exposureBase: "Revenue", manualPremium: 16800, lcm: 1.00, adjustedPremium: 16800 },
    { id: "pr-006", submissionId: "ps-002", classCode: "41675", classDescription: "Software Development", territory: "NY-01", baseRate: 4.80, exposure: 1800000, exposureBase: "Revenue", manualPremium: 8640, lcm: 0.95, adjustedPremium: 8208 },
  ],
  "prop-004": [
    { id: "pr-007", submissionId: "ps-003", classCode: "64074", classDescription: "Physicians — General Practice", territory: "TX-01", baseRate: 18.00, exposure: 2500000, exposureBase: "Revenue", manualPremium: 45000, lcm: 1.25, adjustedPremium: 56250 },
    { id: "pr-008", submissionId: "ps-003", classCode: "64073", classDescription: "Physicians — Clinics", territory: "TX-01", baseRate: 10.50, exposure: 1200000, exposureBase: "Revenue", manualPremium: 12600, lcm: 1.10, adjustedPremium: 13860 },
  ],
};

// ── Proposal Notes (keyed by proposalId) ─────────────────────────────

export const PORTAL_PROPOSAL_NOTES: Record<string, PortalNote[]> = {
  "prop-001": [
    { id: "pn-001", submissionId: "ps-001", type: "note", author: "Sarah Chen", timestamp: "2026-03-10T15:00:00Z", content: "Standard GL program drafted for Pacific Coast Builders. Using occurrence form CG 00 01 with blanket additional insured and waiver of subrogation." },
    { id: "pn-002", submissionId: "ps-001", type: "note", author: "Sarah Chen", timestamp: "2026-03-10T14:45:00Z", content: "Applied cyber exclusion credit (-5%) and waiver of subrogation charge (+3%). Net adjustment is reasonable for this class." },
  ],
  "prop-002": [
    { id: "pn-003", submissionId: "ps-002", type: "note", author: "Michael Torres", timestamp: "2026-03-01T11:00:00Z", content: "Essential coverage tier — base professional liability with Tech E&O extension. Good entry-level option for the broker to present." },
  ],
  "prop-003": [
    { id: "pn-004", submissionId: "ps-002", type: "note", author: "Michael Torres", timestamp: "2026-03-08T16:30:00Z", content: "Enhanced coverage tier adds cyber incident response. This is the recommended option given their SOC2 compliance posture." },
    { id: "pn-005", submissionId: "ps-002", type: "note", author: "Jennifer Park", timestamp: "2026-03-09T10:00:00Z", content: "Reviewed the Better tier. Premium looks competitive. Pending approval — waiting for final loss run confirmation." },
  ],
  "prop-004": [
    { id: "pn-006", submissionId: "ps-003", type: "note", author: "Sarah Chen", timestamp: "2026-01-15T11:30:00Z", content: "Healthcare GL program with EBL coverage and abuse/molestation exclusion. Standard healthcare package for physician group." },
  ],
};

// ── Proposal Forms (keyed by proposalId) ─────────────────────────────

export const PORTAL_PROPOSAL_FORMS: Record<string, SubmissionForm[]> = {
  "prop-001": [
    { id: "pf-001-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "pf-001-02", formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy", description: "Form of Business: Limited Liability Corporation" },
    { id: "pf-001-03", formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
    { id: "pf-001-04", formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion Endorsement", type: "exclusion", category: "Common Policy" },
    { id: "pf-001-05", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    { id: "pf-001-06", formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
    { id: "pf-001-07", formNumber: "CG 21 06", edition: "05 14", formName: "Exclusion — Access or Disclosure of Confidential Information", type: "exclusion", category: "GL Endorsements", adjustments: [{ id: "padj-001", description: "Cyber exclusion credit", type: "credit", amount: 1900 }] },
    { id: "pf-001-08", formNumber: "CG 24 04", edition: "05 09", formName: "Waiver of Transfer of Rights of Recovery Against Others", type: "endorsement", category: "GL Endorsements", adjustments: [{ id: "padj-002", description: "Waiver of subrogation charge", type: "debit", amount: 1140 }] },
  ],
  "prop-002": [
    { id: "pf-002-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "pf-002-02", formNumber: "PL 00 01", edition: "01 15", formName: "Professional Liability Coverage Form", type: "coverage", category: "PL Coverage" },
    { id: "pf-002-03", formNumber: "PL 21 01", edition: "01 15", formName: "Technology E&O Extension", type: "endorsement", category: "PL Endorsements", adjustments: [{ id: "padj-003", description: "Tech E&O surcharge", type: "debit", amount: 2000 }] },
  ],
  "prop-003": [
    { id: "pf-003-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "pf-003-02", formNumber: "PL 00 01", edition: "01 15", formName: "Professional Liability Coverage Form", type: "coverage", category: "PL Coverage" },
    { id: "pf-003-03", formNumber: "PL 21 01", edition: "01 15", formName: "Technology E&O Extension", type: "endorsement", category: "PL Endorsements", adjustments: [{ id: "padj-004", description: "Tech E&O surcharge", type: "debit", amount: 2400 }] },
    { id: "pf-003-04", formNumber: "PL 22 03", edition: "03 20", formName: "Cyber Incident Response Coverage", type: "endorsement", category: "PL Endorsements", adjustments: [{ id: "padj-005", description: "Cyber incident response", type: "debit", amount: 1920 }, { id: "padj-006", description: "Multi-line discount", type: "credit", amount: 820 }] },
  ],
  "prop-004": [
    { id: "pf-004-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "pf-004-02", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    { id: "pf-004-03", formNumber: "CG 22 79", edition: "04 13", formName: "Abuse or Molestation Exclusion", type: "exclusion", category: "GL Endorsements", adjustments: [{ id: "padj-007", description: "Abuse/molestation exclusion credit", type: "credit", amount: 4960 }] },
    { id: "pf-004-04", formNumber: "CG 04 35", edition: "04 13", formName: "Employee Benefits Liability Coverage", type: "endorsement", category: "GL Endorsements", adjustments: [{ id: "padj-008", description: "EBL coverage premium", type: "debit", amount: 9300 }] },
    { id: "pf-004-05", formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion", type: "exclusion", category: "Common Policy" },
  ],
};

// ── Forms & Endorsements ────────────────────────────────────────────

export const PORTAL_FORMS: Record<string, SubmissionForm[]> = {
  "ps-001": [
    // Common Policy
    { id: "sf-001-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "sf-001-02", formNumber: "MPIL 1007", edition: "01 20", formName: "Privacy Notice", type: "notice", category: "Common Policy" },
    { id: "sf-001-03", formNumber: "MPIL 1039-CA", edition: "01 20", formName: "California Surplus Lines Notice (D-2)", type: "notice", category: "Common Policy" },
    { id: "sf-001-04", formNumber: "MPIL 1041", edition: "02 20", formName: "How To Report A Claim", type: "notice", category: "Common Policy" },
    { id: "sf-001-05", formNumber: "MPIL 1083", edition: "04 15", formName: "U.S. Treasury Department's Office Of Foreign Assets Control (OFAC) Advisory Notice To Policyholders", type: "notice", category: "Common Policy" },
    { id: "sf-001-06", formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy", description: "Form of Business: Limited Liability Corporation" },
    { id: "sf-001-07", formNumber: "MDIL 1002", edition: "01 10", formName: "Schedule of Taxes, Surcharges Or Fees", type: "policy", category: "Common Policy" },
    { id: "sf-001-08", formNumber: "MDIL 1001", edition: "08 11", formName: "Forms Schedule", type: "policy", category: "Common Policy" },
    { id: "sf-001-09", formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
    { id: "sf-001-10", formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion Endorsement", type: "exclusion", category: "Common Policy" },
    { id: "sf-001-11", formNumber: "MEIL 1200-CA", edition: "02 23", formName: "Service of Suit - California", type: "endorsement", category: "Common Policy" },
    { id: "sf-001-12", formNumber: "MEIL 1225", edition: "10 11", formName: "Change - Civil Union", type: "endorsement", category: "Common Policy" },
    { id: "sf-001-13", formNumber: "MIL 1214", edition: "09 17", formName: "Trade Or Economic Sanctions", type: "endorsement", category: "Common Policy" },
    // GL Coverage
    { id: "sf-001-14", formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
    { id: "sf-001-15", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    // GL Endorsements
    { id: "sf-001-16", formNumber: "CG 03 00", edition: "01 96", formName: "Deductible Liability Insurance", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-17", formNumber: "CG 21 34", edition: "01 87", formName: "Designated Work Exclusion", type: "exclusion", category: "GL Endorsements", description: "Description of your work: highway/bridge work, dam work" },
    { id: "sf-001-18", formNumber: "CG 21 36", edition: "03 05", formName: "New Entities Exclusion", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-19", formNumber: "CG 21 47", edition: "12 07", formName: "Employment-Related Practices Exclusion", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-20", formNumber: "CG 21 49", edition: "09 99", formName: "Total Pollution Exclusion Endorsement", type: "exclusion", category: "GL Endorsements", adjustments: [{ id: "adj-001", description: "Pollution exclusion credit — no hazardous materials exposure", type: "credit", amount: 750 }] },
    { id: "sf-001-21", formNumber: "CG 21 53", edition: "01 96", formName: "Exclusion - Designated Ongoing Operations", type: "exclusion", category: "GL Endorsements", description: "Designated Operations: traffic control, highway/bridge construction, dam construction" },
    { id: "sf-001-22", formNumber: "CG 21 73", edition: "01 15", formName: "Exclusion Of Certified Acts Of Terrorism", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-23", formNumber: "CG 22 54", edition: "11 85", formName: "Exclusion - Logging and Lumbering Operations", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-24", formNumber: "CG 22 94", edition: "10 01", formName: "Exclusion - Damage To Work Performed By Subcontractors On Your Behalf", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-25", formNumber: "CG 24 26", edition: "04 13", formName: "Amendment Of Insured Contract Definition", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-26", formNumber: "MEGL 0001", edition: "05 24", formName: "Combination General Endorsement", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-27", formNumber: "MEGL 0008", edition: "04 20", formName: "Exclusion - Continuous or Progressive Injury or Damage", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-28", formNumber: "MEGL 0009-01", edition: "09 18", formName: "Blanket Additional Insured", type: "endorsement", category: "GL Endorsements", adjustments: [{ id: "adj-002", description: "Additional insured — blanket surcharge", type: "debit", amount: 1200 }, { id: "adj-003", description: "Multi-year discount", type: "credit", amount: 300 }] },
    { id: "sf-001-29", formNumber: "MEGL 0028", edition: "05 16", formName: "Exclusion - Cancer", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-30", formNumber: "MEGL 0030", edition: "05 17", formName: "Limitation Of Coverage To Specified Covered Operations", type: "endorsement", category: "GL Endorsements", description: "Covered Operations: Land/Brush clearing and excavation operations" },
    { id: "sf-001-31", formNumber: "MEGL 0103", edition: "07 18", formName: "Limitation - Contractor Or Subcontractor Management", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-32", formNumber: "MEGL 0170", edition: "05 16", formName: "Premium Basis", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-33", formNumber: "MEGL 0241-01", edition: "05 16", formName: "Blanket Waiver of Transfer of Rights Against Others To Us", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-34", formNumber: "MEGL 0273", edition: "05 16", formName: "Amended Mobile Equipment Exclusion - Over The Road", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-35", formNumber: "MEGL 0300", edition: "09 21", formName: "Exclusion - New Residential Work", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-36", formNumber: "MEGL 1331", edition: "04 24", formName: "Exclusion - Operations Covered By A Consolidated (Wrap-Up) Insurance Program", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-37", formNumber: "MEGL 1361", edition: "05 16", formName: "Excl - Tainted Drywall/Gypsum Containing Bldng Materials", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-38", formNumber: "MEGL 1390", edition: "12 15", formName: "Limitation - Welding Operations", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-39", formNumber: "MEGL 1397", edition: "07 10", formName: "Exclusion - Aircraft, Auto Or Watercraft", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-40", formNumber: "MEGL 1592", edition: "06 21", formName: "Limited Exclusion - Specified Underground Hazards", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-41", formNumber: "MEGL 1614", edition: "03 20", formName: "Exclusion - Conditional Open Roofs and Specified Roofing Operations", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-42", formNumber: "MEGL 1625", edition: "11 13", formName: "Exclusion - Specified States", type: "exclusion", category: "GL Endorsements", description: "Specified States: New York, Colorado, West Virginia, Missouri" },
    { id: "sf-001-43", formNumber: "MEGL 1637", edition: "10 19", formName: "Exclusion - Employer's Liability And Bodily Injury To Contractors, Subcontractors, Or Independent Contractors", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-44", formNumber: "MEGL 1673", edition: "05 16", formName: "Exclusion - Prior Completed Or Abandoned Work", type: "exclusion", category: "GL Endorsements", description: "Date: 3/11/2025" },
    { id: "sf-001-45", formNumber: "MEGL 2262", edition: "03 21", formName: "Amended Insuring Agreements - Duty to Defend and Indemnify", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-001-46", formNumber: "MEGL 2310", edition: "04 20", formName: "Exclusion - Wild Fire", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-47", formNumber: "MEGL 2322", edition: "05 21", formName: "Exclusion - Communicable Disease", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-48", formNumber: "MGL 1356", edition: "10 20", formName: "Exclusion - Cyber Incident, Data Compromise, And Violation Of Statutes Related To Personal Data", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-001-49", formNumber: "MGL 1615", edition: "01 23", formName: "Exclusion - Perfluoroalkyl and Polyfluoroalkyl Substances (PFAS)", type: "exclusion", category: "GL Endorsements" },
  ],
  "ps-003": [
    // Summit Healthcare Group - GL, smaller subset
    { id: "sf-003-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "sf-003-02", formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy" },
    { id: "sf-003-03", formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
    { id: "sf-003-04", formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion Endorsement", type: "exclusion", category: "Common Policy" },
    { id: "sf-003-05", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    { id: "sf-003-06", formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
    { id: "sf-003-07", formNumber: "CG 21 47", edition: "12 07", formName: "Employment-Related Practices Exclusion", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-003-08", formNumber: "CG 21 49", edition: "09 99", formName: "Total Pollution Exclusion Endorsement", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-003-09", formNumber: "MEGL 0001", edition: "05 24", formName: "Combination General Endorsement", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-003-10", formNumber: "MEGL 2322", edition: "05 21", formName: "Exclusion - Communicable Disease", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-003-11", formNumber: "MGL 1356", edition: "10 20", formName: "Exclusion - Cyber Incident, Data Compromise, And Violation Of Statutes Related To Personal Data", type: "exclusion", category: "GL Endorsements" },
  ],
  "ps-005": [
    // Coastal Dining Group - GL, restaurant subset
    { id: "sf-005-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "sf-005-02", formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy" },
    { id: "sf-005-03", formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
    { id: "sf-005-04", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    { id: "sf-005-05", formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
    { id: "sf-005-06", formNumber: "CG 21 49", edition: "09 99", formName: "Total Pollution Exclusion Endorsement", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-005-07", formNumber: "MEGL 0001", edition: "05 24", formName: "Combination General Endorsement", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-005-08", formNumber: "MEGL 2322", edition: "05 21", formName: "Exclusion - Communicable Disease", type: "exclusion", category: "GL Endorsements" },
  ],
  "ps-006": [
    // Apex Security Services - GL, security guard subset
    { id: "sf-006-01", formNumber: "MJIL 1000", edition: "08 10", formName: "Policy Jacket (Evanston)", type: "policy", category: "Common Policy" },
    { id: "sf-006-02", formNumber: "MDIL 1000", edition: "08 11", formName: "Common Policy Declaration", type: "policy", category: "Common Policy" },
    { id: "sf-006-03", formNumber: "IL 00 17", edition: "11 98", formName: "Common Policy Conditions", type: "policy", category: "Common Policy" },
    { id: "sf-006-04", formNumber: "IL 00 21", edition: "09 08", formName: "Nuclear Energy Liability Exclusion Endorsement", type: "exclusion", category: "Common Policy" },
    { id: "sf-006-05", formNumber: "CG 00 01", edition: "04 13", formName: "Commercial General Liability Coverage Form", type: "coverage", category: "GL Coverage" },
    { id: "sf-006-06", formNumber: "MDGL 1008", edition: "08 11", formName: "Commercial General Liability Coverage Part Declarations", type: "coverage", category: "GL Coverage" },
    { id: "sf-006-07", formNumber: "CG 21 47", edition: "12 07", formName: "Employment-Related Practices Exclusion", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-006-08", formNumber: "CG 21 49", edition: "09 99", formName: "Total Pollution Exclusion Endorsement", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-006-09", formNumber: "MEGL 0001", edition: "05 24", formName: "Combination General Endorsement", type: "endorsement", category: "GL Endorsements" },
    { id: "sf-006-10", formNumber: "MEGL 1397", edition: "07 10", formName: "Exclusion - Aircraft, Auto Or Watercraft", type: "exclusion", category: "GL Endorsements" },
    { id: "sf-006-11", formNumber: "MGL 1356", edition: "10 20", formName: "Exclusion - Cyber Incident, Data Compromise, And Violation Of Statutes Related To Personal Data", type: "exclusion", category: "GL Endorsements" },
  ],
};

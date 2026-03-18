import type { ClauseAlignment } from "@/lib/types";

export const ALIGNMENTS: ClauseAlignment[] = [
  // ── One-to-One Alignments ──
  {
    id: "al-001",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-pollution-01",
        title: "Pollution Exclusion",
        formNumber: "MGL-2024-07",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-pollution-01",
        title: "Total Pollution Exclusion",
        formNumber: "KGL-2024-03",
      },
    ],
    retrievalScore: 0.96,
    rerankScore: 0.94,
    anchorTerms: [
      "pollution",
      "discharge",
      "dispersal",
      "seepage",
      "hostile fire",
    ],
    confidence: 0.95,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 1,
      extractionConfidence: 0.95,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:00:00Z",
    },
  },
  {
    id: "al-002",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-ccc-01",
        title: "Care Custody or Control Exclusion",
        formNumber: "MGL-2024-07",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-ccc-01",
        title: "Care Custody Control with Sublimit",
        formNumber: "KGL-2024-03",
      },
    ],
    retrievalScore: 0.94,
    rerankScore: 0.92,
    anchorTerms: [
      "care",
      "custody",
      "control",
      "personal property",
      "entrusted",
    ],
    confidence: 0.93,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 2,
      extractionConfidence: 0.93,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:05:00Z",
    },
  },
  {
    id: "al-003",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-dtd-01",
        title: "Duty to Defend",
        formNumber: "MPL-2024-05",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-dtr-01",
        title: "Duty to Reimburse",
        formNumber: "KPL-2024-02",
      },
    ],
    retrievalScore: 0.92,
    rerankScore: 0.90,
    anchorTerms: [
      "defend",
      "reimburse",
      "defense costs",
      "counsel",
      "consent",
    ],
    confidence: 0.91,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 3,
      extractionConfidence: 0.91,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:10:00Z",
    },
  },
  {
    id: "al-004",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-ab-01",
        title: "Assault and Battery Exclusion",
        formNumber: "MGL-2024-07",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-ab-01",
        title: "Absolute Assault and Battery Exclusion",
        formNumber: "KGL-2024-03",
      },
    ],
    retrievalScore: 0.98,
    rerankScore: 0.97,
    anchorTerms: [
      "assault",
      "battery",
      "negligent security",
      "bodily injury",
    ],
    confidence: 0.97,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 4,
      extractionConfidence: 0.97,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:15:00Z",
    },
  },
  {
    id: "al-005",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-cyber-ext-01",
        title: "Cyber Extortion Coverage",
        formNumber: "MCY-2024-09",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-cyber-ext-01",
        title: "Cyber Extortion with Sublimit",
        formNumber: "KCY-2024-01",
      },
    ],
    retrievalScore: 0.91,
    rerankScore: 0.89,
    anchorTerms: [
      "extortion",
      "ransomware",
      "ransom payment",
      "cryptocurrency",
    ],
    confidence: 0.90,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 5,
      extractionConfidence: 0.90,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:20:00Z",
    },
  },
  {
    id: "al-006",
    matchType: "one_to_one",
    markelClauses: [
      {
        id: "mcl-hammer-01",
        title: "Consent to Settle Clause",
        formNumber: "MPL-2024-05",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-hammer-01",
        title: "Consent to Settle with Hammer",
        formNumber: "KPL-2024-02",
      },
    ],
    retrievalScore: 0.88,
    rerankScore: 0.86,
    anchorTerms: [
      "consent",
      "settlement",
      "hammer clause",
      "refuse",
      "co-payment",
    ],
    confidence: 0.87,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 6,
      extractionConfidence: 0.87,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:25:00Z",
    },
  },

  // ── One-to-Many Alignments ──
  {
    id: "al-007",
    matchType: "one_to_many",
    markelClauses: [
      {
        id: "mcl-ai-01",
        title: "Additional Insured — Ongoing Operations",
        formNumber: "MGL-2024-07",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-ai-01",
        title: "Additional Insured — Scheduled",
        formNumber: "KGL-2024-03",
      },
      {
        id: "kcl-ai-02",
        title: "Additional Insured — Blanket (Contractors)",
        formNumber: "KGL-2024-03-E1",
      },
      {
        id: "kcl-ai-03",
        title: "Additional Insured — Completed Operations",
        formNumber: "KGL-2024-03-E2",
      },
    ],
    retrievalScore: 0.78,
    rerankScore: 0.75,
    anchorTerms: [
      "additional insured",
      "ongoing operations",
      "completed operations",
      "blanket",
    ],
    confidence: 0.76,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 7,
      extractionConfidence: 0.76,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:30:00Z",
    },
  },
  {
    id: "al-008",
    matchType: "one_to_many",
    markelClauses: [
      {
        id: "mcl-netsec-01",
        title: "Network Security & Privacy Liability",
        formNumber: "MCY-2024-09",
      },
    ],
    kinsaleClauses: [
      {
        id: "kcl-netsec-01",
        title: "Network Security Liability",
        formNumber: "KCY-2024-01",
      },
      {
        id: "kcl-priv-01",
        title: "Privacy Liability — First Party",
        formNumber: "KCY-2024-01",
      },
    ],
    retrievalScore: 0.82,
    rerankScore: 0.79,
    anchorTerms: [
      "network security",
      "privacy",
      "unauthorized access",
      "data breach",
    ],
    confidence: 0.80,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 8,
      extractionConfidence: 0.80,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:35:00Z",
    },
  },

  // ── Unmatched Alignments ──
  {
    id: "al-009",
    matchType: "unmatched",
    markelClauses: [
      {
        id: "mcl-epli-3rd-01",
        title: "EPLI — Third-Party Coverage Extension",
        formNumber: "MEP-2024-06",
      },
    ],
    kinsaleClauses: [],
    retrievalScore: 0.65,
    rerankScore: 0.62,
    anchorTerms: [
      "third party",
      "employment practices",
      "discrimination",
      "customer",
    ],
    confidence: 0.65,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 9,
      extractionConfidence: 0.65,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:40:00Z",
    },
  },
  {
    id: "al-010",
    matchType: "unmatched",
    markelClauses: [],
    kinsaleClauses: [
      {
        id: "kcl-reg-01",
        title: "Regulatory Proceeding Defense Coverage",
        formNumber: "KCY-2024-01",
      },
    ],
    retrievalScore: 0.68,
    rerankScore: 0.65,
    anchorTerms: [
      "regulatory",
      "governmental authority",
      "fines",
      "penalties",
      "defense costs",
    ],
    confidence: 0.67,
    provenance: {
      documentId: "doc-alignment-01",
      documentName: "Clause Alignment Report v2.4",
      pageNumber: 10,
      extractionConfidence: 0.67,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-16T09:45:00Z",
    },
  },
];

export const ALIGNMENT_MAP: Record<string, ClauseAlignment> =
  Object.fromEntries(ALIGNMENTS.map((al) => [al.id, al]));

import type { ClaimVignette } from "@/lib/types";

export const SCENARIOS: ClaimVignette[] = [
  {
    id: "cv-001",
    title: "HVAC Refrigerant Release During Building Fire",
    coverageType: "General Liability",
    narrative:
      "An HVAC contractor's refrigerant lines ruptured during a hostile fire at a commercial building, releasing R-410A refrigerant that caused respiratory injuries to three firefighters. The fire department filed a claim alleging the contractor's installation created a pollution hazard.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's hostile fire exception to the pollution exclusion applies. The refrigerant release was caused by a hostile fire, bringing it within the carve-back at Section I, 2(f)(1)(d).",
      triggerClause: {
        fullText:
          "This exclusion does not apply to bodily injury or property damage arising out of heat, smoke or fumes from a hostile fire.",
        highlightStart: 0,
        highlightEnd: 107,
        provenance: {
          documentId: "doc-pc-commercial-gl-01",
          documentName: "P&C Commercial GL Policy Form MGL-2024-07",
          pageNumber: 14,
          clauseId: "CG-00-01-Section-I-2f-exception",
          extractionConfidence: 0.96,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T10:30:00Z",
        },
      },
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's pollution exclusion contains no hostile fire exception. The refrigerant release constitutes a pollutant discharge regardless of cause, and the claim is fully excluded.",
      exclusionClause: {
        fullText:
          "No exception is provided for hostile fire events under this exclusion.",
        highlightStart: 0,
        highlightEnd: 72,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 16,
          clauseId: "KGL-EX-2f",
          extractionConfidence: 0.95,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T10:32:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-001"],
    confidence: 0.94,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 1,
      extractionConfidence: 0.94,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:00:00Z",
    },
  },
  {
    id: "cv-002",
    title: "Software Bug Causes Client Data Loss",
    coverageType: "Professional Liability",
    narrative:
      "A custom software firm deployed a database migration tool with a critical bug that corrupted 18 months of client financial records. The client filed a claim for $2.1M in reconstruction costs and lost business revenue. The bug originated from code written three years before the current policy period.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial provides full prior acts coverage when no retroactive date is shown. The wrongful act (defective code) predates the policy period but the claim was first made during the policy period, satisfying the claims-made trigger.",
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's mandatory retroactive date of 01/01/2020 means the defective code written in 2017 predates the retro date. The claim is excluded because the wrongful act occurred before the stated retroactive date.",
      exclusionClause: {
        fullText:
          "A retroactive date is mandatory and must be specified for coverage to attach.",
        highlightStart: 0,
        highlightEnd: 78,
        provenance: {
          documentId: "doc-kinsale-pl-01",
          documentName: "Kinsale PL Policy Form KPL-2024-02",
          pageNumber: 6,
          clauseId: "KPL-IG-1a",
          extractionConfidence: 0.95,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T11:02:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-004"],
    confidence: 0.93,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 2,
      extractionConfidence: 0.93,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:05:00Z",
    },
  },
  {
    id: "cv-003",
    title: "Restaurant Patron Assault — Negligent Security",
    coverageType: "General Liability",
    narrative:
      "A patron was severely beaten by another customer in the parking lot of a full-service restaurant. The victim filed suit alleging the restaurant failed to provide adequate lighting, security cameras, or security personnel despite three prior violent incidents at the location.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's assault and battery exclusion applies only to acts committed by or directed by the insured. Third-party patron violence with alleged negligent security falls outside the exclusion scope. The insured's alleged failure to prevent the assault is a covered negligence claim.",
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's absolute assault and battery exclusion covers all claims 'arising out of or in any way related to assault and battery,' including negligent hiring, supervision, and security claims. The claim is entirely excluded regardless of the insured's culpability.",
      exclusionClause: {
        fullText:
          "This exclusion applies to claims alleging negligent hiring, supervision, or security.",
        highlightStart: 0,
        highlightEnd: 88,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 17,
          clauseId: "KGL-EX-AB",
          extractionConfidence: 0.93,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T12:32:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-013"],
    confidence: 0.91,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 3,
      extractionConfidence: 0.91,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:10:00Z",
    },
  },
  {
    id: "cv-004",
    title: "Ransomware Attack on SaaS Platform",
    coverageType: "Cyber Liability",
    narrative:
      "A software publisher's cloud-hosted SaaS platform was encrypted by a ransomware group demanding 15 BTC (approximately $450,000) to restore access. The attack exploited a vulnerability in the AWS-hosted application layer, affecting 200 enterprise customers and causing $1.2M in business interruption losses.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's cyber extortion coverage applies at full policy limits without cryptocurrency restrictions. The network security liability coverage is not limited to systems owned by the insured, so the AWS-hosted platform is covered.",
    },
    kinsaleOutcome: {
      outcome: "partial",
      reasoning:
        "Kinsale's ransomware sublimit caps coverage at $250,000, and the cryptocurrency exclusion precludes payment of the Bitcoin ransom. Additionally, the AWS cloud infrastructure may fall outside the 'owned, operated, or controlled' requirement for network security liability.",
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-005", "cd-012"],
    confidence: 0.90,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 4,
      extractionConfidence: 0.90,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:15:00Z",
    },
  },
  {
    id: "cv-005",
    title: "GC Subcontractor Defective Work — Water Intrusion",
    coverageType: "General Liability",
    narrative:
      "A general contractor's subcontractor installed flashing improperly on a commercial building, causing water intrusion that damaged drywall, electrical systems, and flooring throughout three floors. The building owner filed a claim for $800K in repairs after the project was completed.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial retains the subcontractor exception to Exclusion l (Damage to Your Work). Since the defective work was performed by a subcontractor, the exclusion does not apply and the property damage to the overall completed project is covered under products-completed operations.",
      triggerClause: {
        fullText:
          "This exclusion does not apply if the damaged work or the work out of which the damage arises was performed on your behalf by a subcontractor.",
        highlightStart: 0,
        highlightEnd: 145,
        provenance: {
          documentId: "doc-pc-commercial-gl-01",
          documentName: "P&C Commercial GL Policy Form MGL-2024-07",
          pageNumber: 16,
          clauseId: "CG-00-01-Section-I-2l",
          extractionConfidence: 0.93,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T13:10:00Z",
        },
      },
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale removes the subcontractor exception to the Damage to Your Work exclusion. Subcontractor work is treated as the insured's own work, and all damage to the completed project is excluded.",
      exclusionClause: {
        fullText:
          "No exception is provided for work performed by subcontractors.",
        highlightStart: 0,
        highlightEnd: 63,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 18,
          clauseId: "KGL-EX-2l",
          extractionConfidence: 0.92,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T13:12:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-017"],
    confidence: 0.92,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 5,
      extractionConfidence: 0.92,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:20:00Z",
    },
  },
  {
    id: "cv-006",
    title: "Investment Advisor SEC Enforcement Action",
    coverageType: "Professional Liability",
    narrative:
      "An investment advisory firm faced an SEC enforcement action alleging unsuitable investment recommendations to elderly clients. Defense costs totaled $420K before a $600K settlement was reached. The firm refused the insurer's initial $350K settlement recommendation.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial provides duty-to-defend with costs outside limits. The full $420K defense costs are paid in addition to the $1M limit. Under the standard hammer clause, P&C Commercial's liability is capped at the $350K proposed settlement plus $420K in defense costs.",
    },
    kinsaleOutcome: {
      outcome: "partial",
      reasoning:
        "Kinsale's duty-to-reimburse with costs inside limits means the $420K defense costs erode the $1M limit to $580K. The 60/40 hammer clause further caps Kinsale's liability at 60% of the $350K proposed settlement ($210K), leaving the firm responsible for $390K plus all subsequent defense costs.",
    },
    regressionStatus: "fail",
    relatedClauseDeltaIds: ["cd-010", "cd-014"],
    confidence: 0.88,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 6,
      extractionConfidence: 0.88,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:25:00Z",
    },
  },
  {
    id: "cv-007",
    title: "Janitorial Worker Damages Client Server Room",
    coverageType: "General Liability",
    narrative:
      "A janitorial worker accidentally discharged a fire extinguisher in a client's server room, causing $38,000 in damage to network equipment. The client filed a claim for the equipment replacement and two days of business interruption costs.",
    pcCommercialOutcome: {
      outcome: "not_covered",
      reasoning:
        "P&C Commercial's care, custody, or control exclusion applies. The server equipment was in the insured's care during cleaning operations, and no exception exists for this type of property damage in the P&C Commercial form.",
    },
    kinsaleOutcome: {
      outcome: "covered",
      reasoning:
        "Kinsale's CCC coverage carve-back provides up to $50,000 per occurrence for property in the insured's care during covered operations. The $38,000 equipment claim falls within the sublimit. Business interruption costs would be excluded as consequential damages.",
      triggerClause: {
        fullText:
          "Coverage is provided for property damage to property in the care, custody, or control of the insured up to a sublimit of $50,000 per occurrence.",
        highlightStart: 0,
        highlightEnd: 148,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 15,
          clauseId: "KGL-EX-2j",
          extractionConfidence: 0.93,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T13:42:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-020"],
    confidence: 0.89,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 7,
      extractionConfidence: 0.89,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:30:00Z",
    },
  },
  {
    id: "cv-008",
    title: "Restaurant Employee Harasses Customer",
    coverageType: "EPLI",
    narrative:
      "A server at a full-service restaurant made repeated unwanted sexual comments to a regular customer over several months. The customer filed a lawsuit alleging sexual harassment and hostile environment, naming both the server and the restaurant as defendants.",
    pcCommercialOutcome: {
      outcome: "not_covered",
      reasoning:
        "P&C Commercial's EPLI form limits coverage to claims by employees and applicants. A customer's harassment claim is a third-party claim and falls outside the scope of the insuring agreement.",
    },
    kinsaleOutcome: {
      outcome: "covered",
      reasoning:
        "Kinsale's EPLI form extends coverage to third-party claims by customers alleging discrimination or harassment by an employee in the course of employment duties. The server's conduct occurred during work duties, triggering the third-party coverage extension.",
      triggerClause: {
        fullText:
          "Third-party coverage extends to claims by customers, clients, or vendors alleging discrimination or harassment by an employee of the insured in the course of their employment duties.",
        highlightStart: 0,
        highlightEnd: 178,
        provenance: {
          documentId: "doc-kinsale-ep-01",
          documentName: "Kinsale EPLI Policy Form KEP-2024-04",
          pageNumber: 9,
          clauseId: "KEP-IG-2c",
          extractionConfidence: 0.92,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T11:22:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-006"],
    confidence: 0.90,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 8,
      extractionConfidence: 0.90,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:35:00Z",
    },
  },
  {
    id: "cv-009",
    title: "Plumbing Contractor — Products Aggregate Exhaustion",
    coverageType: "General Liability",
    narrative:
      "A plumbing contractor faced three separate completed operations claims totaling $1.8M in a single policy year. The claims involved defective pipe installations in different commercial buildings that each caused water damage after project completion.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's Products-Completed Operations aggregate equals the $2M General Aggregate, providing sufficient capacity to cover all three claims within the policy period.",
    },
    kinsaleOutcome: {
      outcome: "partial",
      reasoning:
        "Kinsale's Products-Completed Operations aggregate is capped at 50% of the General Aggregate ($1M). After the first two claims exhaust $1M, the third claim of approximately $600K has no remaining Products-Completed Operations coverage.",
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-002"],
    confidence: 0.91,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 9,
      extractionConfidence: 0.91,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:40:00Z",
    },
  },
  {
    id: "cv-010",
    title: "Construction Project — Oral Subcontract Indemnity",
    coverageType: "General Liability",
    narrative:
      "A general contractor relied on an oral agreement with a subcontractor for indemnification. When the subcontractor's work caused a bodily injury claim, the GC tendered the claim under its GL policy's contractual liability coverage, citing the oral indemnification agreement.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's broad insured contract definition covers any contract pertaining to the business, including oral agreements. The oral indemnification agreement qualifies as an insured contract.",
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's insured contract definition requires a written agreement executed before the loss. Oral agreements are explicitly excluded from the definition. The GC's oral indemnification agreement does not qualify.",
      exclusionClause: {
        fullText:
          "Oral agreements, implied contracts, and any contract executed after the date of loss are specifically excluded from this definition.",
        highlightStart: 0,
        highlightEnd: 130,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 24,
          clauseId: "KGL-DEF-9f",
          extractionConfidence: 0.94,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T10:40:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-003"],
    confidence: 0.92,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 10,
      extractionConfidence: 0.92,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:45:00Z",
    },
  },
  {
    id: "cv-011",
    title: "Physician Misdiagnosis — Professional Liability",
    coverageType: "Professional Liability",
    narrative:
      "A physician misdiagnosed a patient's condition, resulting in a delayed cancer diagnosis and subsequent bodily injury claim for $1.5M. The claim was filed against the physician's professional liability policy.",
    pcCommercialOutcome: {
      outcome: "not_covered",
      reasoning:
        "P&C Commercial's professional liability form explicitly excludes bodily injury claims. The misdiagnosis resulted in physical harm (delayed treatment), which falls within the bodily injury exclusion. The claim would need to be tendered to a separate medical malpractice policy.",
    },
    kinsaleOutcome: {
      outcome: "covered",
      reasoning:
        "Kinsale's PL form includes a bodily injury carve-back for licensed healthcare providers. The misdiagnosis constitutes a medical incident by a licensed provider, and coverage applies in excess of any applicable medical malpractice insurance.",
      triggerClause: {
        fullText:
          "This policy covers loss, including bodily injury to the extent it arises from a wrongful act in the performance of professional services rendered by a licensed healthcare provider.",
        highlightStart: 0,
        highlightEnd: 170,
        provenance: {
          documentId: "doc-kinsale-pl-01",
          documentName: "Kinsale PL Policy Form KPL-2024-02",
          pageNumber: 10,
          clauseId: "KPL-IG-BI",
          extractionConfidence: 0.93,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T13:22:00Z",
        },
      },
    },
    regressionStatus: "warning",
    relatedClauseDeltaIds: ["cd-018"],
    confidence: 0.87,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 11,
      extractionConfidence: 0.87,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:50:00Z",
    },
  },
  {
    id: "cv-012",
    title: "Software Publisher — GDPR Regulatory Fine",
    coverageType: "Cyber Liability",
    narrative:
      "A software publisher suffered a data breach exposing 50,000 EU customer records. The Irish Data Protection Commission initiated an investigation and ultimately imposed a regulatory fine of $800K, with defense costs of $150K incurred during the proceeding.",
    pcCommercialOutcome: {
      outcome: "not_covered",
      reasoning:
        "P&C Commercial's cyber form excludes all regulatory proceedings, fines, penalties, and associated defense costs. The GDPR investigation and resulting fine are entirely excluded.",
    },
    kinsaleOutcome: {
      outcome: "covered",
      reasoning:
        "Kinsale provides regulatory defense coverage including insurable fines and defense costs subject to a sublimit. The $150K defense costs and the $800K fine (to the extent insurable under Irish law) are covered up to the regulatory defense sublimit.",
      triggerClause: {
        fullText:
          "We will pay regulatory defense costs incurred by the insured in connection with a regulatory proceeding brought by a governmental authority arising from a covered data breach.",
        highlightStart: 0,
        highlightEnd: 173,
        provenance: {
          documentId: "doc-kinsale-cy-01",
          documentName: "Kinsale Cyber Policy Form KCY-2024-01",
          pageNumber: 22,
          clauseId: "KCY-IG-REG",
          extractionConfidence: 0.90,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T13:02:00Z",
        },
      },
    },
    regressionStatus: "fail",
    relatedClauseDeltaIds: ["cd-016"],
    confidence: 0.86,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 12,
      extractionConfidence: 0.86,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T10:55:00Z",
    },
  },
  {
    id: "cv-013",
    title: "Janitorial Service — Independent Contractor Injury",
    coverageType: "General Liability",
    narrative:
      "An independent contractor working for a janitorial company fell from a ladder while cleaning exterior windows at a client location. The contractor filed a bodily injury claim alleging the janitorial company failed to provide proper safety equipment and training.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial provides affirmative vicarious liability coverage for independent contractor operations performed within the scope of engagement. The injury occurred during cleaning operations within the contractor's engagement.",
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's blanket independent contractor exclusion applies to all bodily injury arising from operations performed by independent contractors, regardless of supervision. The claim is fully excluded.",
      exclusionClause: {
        fullText:
          "This insurance does not apply to bodily injury or property damage arising out of operations performed for the insured by independent contractors, subcontractors, or temporary staffing personnel.",
        highlightStart: 0,
        highlightEnd: 185,
        provenance: {
          documentId: "doc-kinsale-gl-01",
          documentName: "Kinsale GL Policy Form KGL-2024-03",
          pageNumber: 12,
          clauseId: "KGL-EX-IC",
          extractionConfidence: 0.93,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T11:52:00Z",
        },
      },
    },
    regressionStatus: "pass",
    relatedClauseDeltaIds: ["cd-009"],
    confidence: 0.91,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 13,
      extractionConfidence: 0.91,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T11:00:00Z",
    },
  },
  {
    id: "cv-014",
    title: "Restaurant Fire — Ordinance or Law Compliance",
    coverageType: "Property",
    narrative:
      "A fire caused $500K in damage to a restaurant occupying a 1960s-era building. The local building authority required compliance with current fire suppression, ADA, and electrical codes for reconstruction, adding $180K in code-upgrade costs beyond the direct damage repair.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial provides ordinance or law coverage at 25% of building limit. For a $1M building limit, $250K is available for increased cost of construction, which is sufficient to cover the $180K in code-upgrade costs.",
    },
    kinsaleOutcome: {
      outcome: "partial",
      reasoning:
        "Kinsale limits ordinance or law coverage to the lesser of 10% of building limit or $100K. For the same $1M building, only $100K is available, leaving an $80K gap for the remaining code-upgrade costs.",
    },
    regressionStatus: "warning",
    relatedClauseDeltaIds: ["cd-008"],
    confidence: 0.89,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 14,
      extractionConfidence: 0.89,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T11:05:00Z",
    },
  },
  {
    id: "cv-015",
    title: "Construction Umbrella — Underlying Limits Exhaustion",
    coverageType: "Umbrella",
    narrative:
      "A construction company's $1M primary GL limit was exhausted by a $1M settlement. A second occurrence resulted in a $2.5M judgment. The insured tendered the excess to its umbrella carrier seeking drop-down and following-form coverage for the second claim.",
    pcCommercialOutcome: {
      outcome: "covered",
      reasoning:
        "P&C Commercial's umbrella follows form with the underlying GL and provides drop-down coverage when underlying limits are exhausted by payment of covered claims. The second occurrence is covered by the umbrella following the same terms as the underlying GL.",
    },
    kinsaleOutcome: {
      outcome: "not_covered",
      reasoning:
        "Kinsale's umbrella is excess-only without following form or drop-down provisions. Since the underlying GL limits are exhausted and the insured cannot maintain underlying coverage, the umbrella does not respond to the second occurrence.",
      exclusionClause: {
        fullText:
          "No drop-down coverage is provided when underlying limits are exhausted and the insured must maintain scheduled underlying coverage at all times for this policy to apply.",
        highlightStart: 0,
        highlightEnd: 170,
        provenance: {
          documentId: "doc-kinsale-um-01",
          documentName: "Kinsale Umbrella Policy Form KUM-2024-05",
          pageNumber: 4,
          clauseId: "KUM-IG-1",
          extractionConfidence: 0.90,
          modelVersion: "v2.4.1",
          extractionTimestamp: "2025-01-15T11:32:00Z",
        },
      },
    },
    regressionStatus: "fail",
    relatedClauseDeltaIds: ["cd-007"],
    confidence: 0.87,
    provenance: {
      documentId: "doc-scenarios-01",
      documentName: "Scenario Analysis Report v2.4",
      pageNumber: 15,
      extractionConfidence: 0.87,
      modelVersion: "v2.4.1",
      extractionTimestamp: "2025-01-17T11:10:00Z",
    },
  },
];

export const SCENARIO_MAP: Record<string, ClaimVignette> = Object.fromEntries(
  SCENARIOS.map((sc) => [sc.id, sc])
);

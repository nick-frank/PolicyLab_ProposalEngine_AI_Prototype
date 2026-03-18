import type { WorkflowDeepDive } from "@/lib/types";

export const WORKFLOWS: WorkflowDeepDive[] = [
  // ── Apex Plumbing & Heating LLC — Auto-Quote ──
  {
    submissionId: "sub-001",
    startedAt: "2025-01-10T14:30:05Z",
    completedAt: "2025-01-10T14:30:47Z",
    modelVersion: "v2.4.1",
    stages: {
      classify: {
        status: "complete",
        data: {
          naicsCode: "238220",
          naicsDescription:
            "Plumbing, Heating, and Air-Conditioning Contractors",
          coverageTypes: ["General Liability", "Umbrella"],
          qualityScore: 0.91,
          riskFlags: [
            {
              name: "Prior claims history",
              severity: "low",
              evidence:
                "One closed GL claim in 2022 for $12,000 — slip-and-fall at job site. No pattern of recurring losses.",
            },
          ],
          confidence: 0.94,
          reasoningSteps: [
            {
              step: 1,
              description: "Extracted business description from ACORD application",
              evidence:
                "Insured operates as a licensed plumbing and HVAC contractor performing residential and light commercial installations, repairs, and maintenance across Northern Virginia.",
              confidence: 0.96,
            },
            {
              step: 2,
              description: "Mapped operations to NAICS code",
              evidence:
                "Primary operations match NAICS 238220 (Plumbing, Heating, and Air-Conditioning Contractors). Secondary janitorial maintenance operations are incidental (<5% of revenue).",
              confidence: 0.95,
            },
            {
              step: 3,
              description: "Validated submission completeness",
              evidence:
                "All required fields populated: 5-year loss runs provided, financial statements for 3 years attached, certificates of insurance for subcontractors included. Quality score: 0.91.",
              confidence: 0.93,
            },
            {
              step: 4,
              description: "Assessed risk flag severity",
              evidence:
                "Single prior GL claim ($12K, closed 2022) is below the threshold for elevated concern. No OSHA citations, no active litigation, EMR of 0.89.",
              confidence: 0.94,
            },
          ],
          provenance: {
            documentId: "sub-001-classify",
            documentName: "Apex Plumbing ACORD Application",
            pageNumber: 1,
            extractionConfidence: 0.94,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-10T14:30:10Z",
          },
        },
      },
      retrieve: {
        status: "complete",
        data: {
          similarInsureds: [
            {
              name: "Metro HVAC Systems Inc",
              naicsCode: "238220",
              similarityScore: 0.92,
              priorOutcome: "Quoted and bound at $17,200 premium",
              lossRatio: 0.28,
            },
            {
              name: "Capitol Plumbing Solutions",
              naicsCode: "238220",
              similarityScore: 0.89,
              priorOutcome: "Quoted and bound at $19,800 premium",
              lossRatio: 0.35,
            },
            {
              name: "Blue Ridge Mechanical Corp",
              naicsCode: "238220",
              similarityScore: 0.86,
              priorOutcome: "Quoted and bound at $16,500 premium",
              lossRatio: 0.22,
            },
            {
              name: "Tidewater Plumbing & Heat",
              naicsCode: "238220",
              similarityScore: 0.84,
              priorOutcome: "Quoted, declined by insured",
              lossRatio: 0.41,
            },
          ],
          relevantLosses: [
            {
              description:
                "Water damage from improper copper pipe soldering in commercial kitchen. Third-party property damage claim.",
              amount: 45000,
              year: 2023,
              relevanceScore: 0.88,
            },
            {
              description:
                "HVAC refrigerant leak during installation causing temporary evacuation. Bodily injury claim for chemical exposure symptoms.",
              amount: 78000,
              year: 2022,
              relevanceScore: 0.85,
            },
            {
              description:
                "Slip-and-fall on job site due to unattended tools in walkway. Employee of another subcontractor injured.",
              amount: 32000,
              year: 2024,
              relevanceScore: 0.82,
            },
          ],
          clauseFingerprints: [
            {
              clauseId: "cd-001",
              title: "Pollution Exclusion — Hostile Fire Exception",
              matchScore: 0.91,
            },
            {
              clauseId: "cd-002",
              title: "Products-Completed Operations Aggregate Limit",
              matchScore: 0.88,
            },
            {
              clauseId: "cd-019",
              title: "Notice of Occurrence — Reporting Condition",
              matchScore: 0.75,
            },
          ],
          provenance: {
            documentId: "sub-001-retrieve",
            documentName: "Similar Insured Retrieval Report",
            pageNumber: 1,
            extractionConfidence: 0.92,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-10T14:30:20Z",
          },
        },
      },
      analyze: {
        status: "complete",
        data: {
          relevantClauseDeltas: [
            {
              clauseDeltaId: "cd-001",
              title: "Pollution Exclusion — Hostile Fire Exception",
              direction: "tighter",
              severity: "high",
              recommendation:
                "Monitor for refrigerant-related claims. Markel's hostile fire exception provides competitive advantage for HVAC contractors.",
            },
            {
              clauseDeltaId: "cd-002",
              title: "Products-Completed Operations Aggregate Limit",
              direction: "tighter",
              severity: "medium",
              recommendation:
                "Full aggregate for completed operations supports pricing at indicated level. Highlight to broker as value differentiator.",
            },
          ],
          tighteningOptions: [
            {
              description:
                "Add Designated Premises endorsement to limit coverage to scheduled job sites only",
              impactEstimate: "Premium reduction of $800-$1,200",
              evidenceSpan: {
                fullText:
                  "Coverage A applies to bodily injury or property damage arising out of operations performed for you by independent contractors, including your general supervision thereof.",
                highlightStart: 0,
                highlightEnd: 95,
                provenance: {
                  documentId: "doc-markel-gl-01",
                  documentName: "Markel GL Policy Form MGL-2024-07",
                  pageNumber: 10,
                  extractionConfidence: 0.90,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-10T14:30:25Z",
                },
              },
            },
          ],
          provenance: {
            documentId: "sub-001-analyze",
            documentName: "Clause Delta Analysis Report",
            pageNumber: 1,
            extractionConfidence: 0.91,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-10T14:30:30Z",
          },
        },
      },
      evaluate: {
        status: "complete",
        data: {
          appetiteScore: 0.88,
          lossFeatures: [
            { name: "Years in business", value: "15", weight: 0.15 },
            { name: "EMR", value: "0.89", weight: 0.20 },
            { name: "Annual revenue", value: "$4.2M", weight: 0.10 },
            {
              name: "Prior 5-year loss ratio",
              value: "0.18",
              weight: 0.25,
            },
            {
              name: "Subcontractor percentage",
              value: "15%",
              weight: 0.10,
            },
            {
              name: "Safety program rating",
              value: "Above average",
              weight: 0.10,
            },
            { name: "Geographic spread", value: "Single state (VA)", weight: 0.10 },
          ],
          clauseImpacts: [
            {
              clauseTitle: "Pollution Exclusion — Hostile Fire Exception",
              impactValue: 0.05,
            },
            {
              clauseTitle: "Products-Completed Operations Aggregate Limit",
              impactValue: 0.03,
            },
          ],
          combinedScore: 0.91,
          confidence: 0.93,
          calibrationBucket: "low_risk_trade_contractor",
          provenance: {
            documentId: "sub-001-evaluate",
            documentName: "Risk Evaluation Scorecard",
            pageNumber: 1,
            extractionConfidence: 0.93,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-10T14:30:35Z",
          },
        },
      },
      explain: {
        status: "complete",
        data: {
          overallRecommendation: "accept",
          summary:
            "Apex Plumbing & Heating LLC is a well-established HVAC contractor with 15 years of operations, strong loss history (0.18 ratio), and favorable EMR (0.89). The submission is complete with all required documentation. Risk profile is consistent with our low-risk trade contractor appetite. Recommend auto-quote at indicated premium of $18,500.",
          recommendations: [
            {
              action: "Issue quote at $18,500 annual premium",
              rationale:
                "Combined score of 0.91 exceeds the 0.80 auto-quote threshold. Loss features and clause impacts are favorable. Premium is within the range of comparable bound risks ($16,500-$19,800).",
              citations: [
                {
                  documentId: "sub-001-evaluate",
                  documentName: "Risk Evaluation Scorecard",
                  pageNumber: 1,
                  extractionConfidence: 0.93,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-10T14:30:35Z",
                },
              ],
            },
            {
              action:
                "Highlight pollution exclusion advantage to broker",
              rationale:
                "Markel's hostile fire exception provides broader coverage than Kinsale for HVAC contractors handling refrigerants. This is a meaningful differentiation point for the broker conversation.",
              citations: [
                {
                  documentId: "doc-markel-gl-01",
                  documentName: "Markel GL Policy Form MGL-2024-07",
                  pageNumber: 14,
                  clauseId: "CG-00-01-Section-I-2f",
                  extractionConfidence: 0.96,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-15T10:30:00Z",
                },
              ],
            },
          ],
          reasoningSteps: [
            {
              step: 1,
              description: "Verified NAICS 238220 is within E&S appetite",
              evidence:
                "Plumbing/HVAC contractors are an approved class with standard rating factors. No referral triggers identified.",
              confidence: 0.96,
            },
            {
              step: 2,
              description: "Assessed loss history and EMR favorability",
              evidence:
                "Five-year loss ratio of 0.18 is significantly below the class average of 0.42. EMR of 0.89 confirms better-than-average loss experience.",
              confidence: 0.95,
            },
            {
              step: 3,
              description: "Compared to similar bound risks",
              evidence:
                "Four comparable HVAC contractors identified with premiums ranging $16,500-$19,800 and loss ratios 0.22-0.41. Apex's profile is favorable to the peer set.",
              confidence: 0.93,
            },
            {
              step: 4,
              description: "Confirmed no disqualifying risk factors",
              evidence:
                "Single prior claim is below threshold. No OSHA citations, no active litigation, no excluded operations identified.",
              confidence: 0.94,
            },
            {
              step: 5,
              description: "Generated auto-quote recommendation",
              evidence:
                "Combined score of 0.91 with high confidence (0.93). All underwriting criteria met for automatic quote issuance.",
              confidence: 0.93,
            },
          ],
          provenance: {
            documentId: "sub-001-explain",
            documentName: "Underwriting Decision Report",
            pageNumber: 1,
            extractionConfidence: 0.93,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-10T14:30:47Z",
          },
        },
      },
    },
  },

  // ── NovaTech Solutions Inc — Needs Review ──
  {
    submissionId: "sub-002",
    startedAt: "2025-01-11T09:15:05Z",
    completedAt: "2025-01-11T09:16:12Z",
    modelVersion: "v2.4.1",
    stages: {
      classify: {
        status: "complete",
        data: {
          naicsCode: "541511",
          naicsDescription: "Custom Computer Programming Services",
          coverageTypes: ["Professional Liability", "Cyber Liability"],
          qualityScore: 0.62,
          riskFlags: [
            {
              name: "High client concentration",
              severity: "high",
              evidence:
                "Top 3 clients represent 78% of revenue. Loss of a single client relationship could trigger multiple E&O claims.",
            },
            {
              name: "Offshore development team",
              severity: "medium",
              evidence:
                "40% of engineering staff located in offshore centers with limited quality assurance oversight documented in the submission.",
            },
            {
              name: "Missing financial statements",
              severity: "medium",
              evidence:
                "Only 2 years of financials provided; 3-year history required for PL submissions over $25K premium.",
            },
          ],
          confidence: 0.78,
          reasoningSteps: [
            {
              step: 1,
              description: "Classified business operations from application",
              evidence:
                "NovaTech develops custom enterprise software solutions specializing in financial services middleware and API integrations. Operations map to NAICS 541511.",
              confidence: 0.94,
            },
            {
              step: 2,
              description: "Identified coverage type requirements",
              evidence:
                "Primary need is Professional Liability for software development E&O. Secondary need is Cyber Liability given processing of client financial data through API connections.",
              confidence: 0.91,
            },
            {
              step: 3,
              description: "Assessed submission quality and completeness",
              evidence:
                "Submission is missing third year of financial statements. Application narrative is sparse on QA processes and offshore oversight. Quality score reduced to 0.62.",
              confidence: 0.82,
            },
            {
              step: 4,
              description: "Flagged elevated risk indicators",
              evidence:
                "Client concentration at 78% in top 3 and offshore development at 40% of staff both exceed referral thresholds. These require underwriter evaluation.",
              confidence: 0.85,
            },
          ],
          provenance: {
            documentId: "sub-002-classify",
            documentName: "NovaTech ACORD Application and Supplemental",
            pageNumber: 1,
            extractionConfidence: 0.82,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-11T09:15:15Z",
          },
        },
      },
      retrieve: {
        status: "complete",
        data: {
          similarInsureds: [
            {
              name: "CodeCraft Solutions LLC",
              naicsCode: "541511",
              similarityScore: 0.85,
              priorOutcome: "Quoted and bound at $38,000 premium",
              lossRatio: 0.45,
            },
            {
              name: "FinTech Bridge Inc",
              naicsCode: "541511",
              similarityScore: 0.82,
              priorOutcome: "Declined — client concentration exceeded 80%",
              lossRatio: 0.62,
            },
            {
              name: "Pinnacle Software Group",
              naicsCode: "541511",
              similarityScore: 0.79,
              priorOutcome:
                "Quoted and bound at $45,000 with offshore exclusion endorsement",
              lossRatio: 0.38,
            },
          ],
          relevantLosses: [
            {
              description:
                "Custom middleware failure caused 72-hour outage for financial services client. Client sued for $1.2M in lost revenue and regulatory penalties.",
              amount: 850000,
              year: 2023,
              relevanceScore: 0.92,
            },
            {
              description:
                "API integration error resulted in duplicate financial transactions totaling $340K. Developer E&O claim settled at $280K.",
              amount: 280000,
              year: 2024,
              relevanceScore: 0.89,
            },
            {
              description:
                "Offshore development team introduced security vulnerability exploited in client data breach. Combined PL/Cyber claim totaling $1.8M.",
              amount: 1800000,
              year: 2022,
              relevanceScore: 0.94,
            },
          ],
          clauseFingerprints: [
            {
              clauseId: "cd-004",
              title: "Claims-Made Retroactive Date Restriction",
              matchScore: 0.93,
            },
            {
              clauseId: "cd-010",
              title: "Duty to Defend vs. Duty to Reimburse",
              matchScore: 0.90,
            },
            {
              clauseId: "cd-005",
              title: "Network Security Liability — Trigger Definition",
              matchScore: 0.78,
            },
          ],
          provenance: {
            documentId: "sub-002-retrieve",
            documentName: "Similar Insured Retrieval Report",
            pageNumber: 1,
            extractionConfidence: 0.88,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-11T09:15:35Z",
          },
        },
      },
      analyze: {
        status: "complete",
        data: {
          relevantClauseDeltas: [
            {
              clauseDeltaId: "cd-004",
              title: "Claims-Made Retroactive Date Restriction",
              direction: "tighter",
              severity: "high",
              recommendation:
                "Full prior acts coverage is critical for software firms with legacy codebases. Verify NovaTech's maintenance obligations for older client systems.",
            },
            {
              clauseDeltaId: "cd-010",
              title: "Duty to Defend vs. Duty to Reimburse",
              direction: "tighter",
              severity: "high",
              recommendation:
                "Duty-to-defend with costs outside limits is a significant value proposition. Financial services clients often mandate this coverage structure.",
            },
            {
              clauseDeltaId: "cd-005",
              title: "Network Security Liability — Trigger Definition",
              direction: "tighter",
              severity: "high",
              recommendation:
                "NovaTech's cloud-hosted services mean the network security trigger definition is critical. Confirm coverage extends to cloud infrastructure.",
            },
          ],
          tighteningOptions: [
            {
              description:
                "Add Offshore Services Exclusion limiting coverage to work performed by U.S.-based personnel only",
              impactEstimate: "Premium reduction of $4,000-$6,000",
              evidenceSpan: {
                fullText:
                  "40% of engineering staff located in offshore centers with limited quality assurance oversight documented in the submission.",
                highlightStart: 0,
                highlightEnd: 105,
                provenance: {
                  documentId: "sub-002-classify",
                  documentName:
                    "NovaTech ACORD Application and Supplemental",
                  pageNumber: 3,
                  extractionConfidence: 0.85,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-11T09:15:45Z",
                },
              },
            },
            {
              description:
                "Add Client Concentration Sublimit capping any single-client claim at 50% of aggregate",
              impactEstimate: "Premium reduction of $2,500-$3,500",
              evidenceSpan: {
                fullText:
                  "Top 3 clients represent 78% of revenue. Loss of a single client relationship could trigger multiple E&O claims.",
                highlightStart: 0,
                highlightEnd: 95,
                provenance: {
                  documentId: "sub-002-classify",
                  documentName:
                    "NovaTech ACORD Application and Supplemental",
                  pageNumber: 2,
                  extractionConfidence: 0.88,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-11T09:15:50Z",
                },
              },
            },
          ],
          provenance: {
            documentId: "sub-002-analyze",
            documentName: "Clause Delta Analysis Report",
            pageNumber: 1,
            extractionConfidence: 0.86,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-11T09:15:55Z",
          },
        },
      },
      evaluate: {
        status: "complete",
        data: {
          appetiteScore: 0.65,
          lossFeatures: [
            { name: "Years in business", value: "7", weight: 0.12 },
            { name: "Annual revenue", value: "$8.5M", weight: 0.10 },
            {
              name: "Client concentration (top 3)",
              value: "78%",
              weight: 0.22,
            },
            {
              name: "Offshore staff percentage",
              value: "40%",
              weight: 0.18,
            },
            {
              name: "Prior 5-year loss ratio",
              value: "0.32",
              weight: 0.20,
            },
            {
              name: "Contract types",
              value: "Fixed price (60%), T&M (40%)",
              weight: 0.08,
            },
            { name: "Industry vertical", value: "Financial services", weight: 0.10 },
          ],
          clauseImpacts: [
            {
              clauseTitle: "Claims-Made Retroactive Date Restriction",
              impactValue: 0.08,
            },
            {
              clauseTitle: "Duty to Defend vs. Duty to Reimburse",
              impactValue: 0.06,
            },
            {
              clauseTitle: "Network Security Liability — Trigger Definition",
              impactValue: 0.04,
            },
          ],
          combinedScore: 0.62,
          confidence: 0.78,
          calibrationBucket: "moderate_risk_tech_services",
          provenance: {
            documentId: "sub-002-evaluate",
            documentName: "Risk Evaluation Scorecard",
            pageNumber: 1,
            extractionConfidence: 0.78,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-11T09:16:00Z",
          },
        },
      },
      explain: {
        status: "complete",
        data: {
          overallRecommendation: "review",
          summary:
            "NovaTech Solutions presents a moderate-risk technology services profile with notable concerns around client concentration (78% in top 3) and offshore development oversight (40% of staff). The submission is incomplete, missing the third year of financial statements. While the company has acceptable loss history and operates in our appetite for custom software, the risk flags require human underwriter assessment before a quote can be issued.",
          recommendations: [
            {
              action: "Request additional information before quoting",
              rationale:
                "Third year of financial statements is required per guidelines. Additionally, request documentation of offshore QA processes, code review procedures, and client contract terms.",
              citations: [
                {
                  documentId: "sub-002-classify",
                  documentName:
                    "NovaTech ACORD Application and Supplemental",
                  pageNumber: 1,
                  extractionConfidence: 0.82,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-11T09:15:15Z",
                },
              ],
            },
            {
              action:
                "Consider offshore exclusion or sublimit endorsement",
              rationale:
                "Similar insured 'Pinnacle Software Group' was bound with an offshore exclusion. This approach reduces exposure while allowing the account to be written.",
              citations: [
                {
                  documentId: "sub-002-retrieve",
                  documentName: "Similar Insured Retrieval Report",
                  pageNumber: 1,
                  extractionConfidence: 0.88,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-11T09:15:35Z",
                },
              ],
            },
            {
              action:
                "Evaluate client concentration risk with revenue diversification plan",
              rationale:
                "FinTech Bridge (82% similarity) was declined for similar client concentration. However, NovaTech is at 78% versus FinTech Bridge's 80%+ — borderline but potentially acceptable with appropriate sublimits.",
              citations: [
                {
                  documentId: "sub-002-retrieve",
                  documentName: "Similar Insured Retrieval Report",
                  pageNumber: 1,
                  extractionConfidence: 0.88,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-11T09:15:35Z",
                },
              ],
            },
          ],
          reasoningSteps: [
            {
              step: 1,
              description:
                "Confirmed NAICS 541511 is within E&S appetite with referral triggers",
              evidence:
                "Custom software development is an approved class but client concentration >70% and offshore staff >30% both trigger mandatory referral to senior underwriter.",
              confidence: 0.92,
            },
            {
              step: 2,
              description:
                "Identified submission completeness deficiencies",
              evidence:
                "Missing third year of financials reduces ability to assess revenue trend and profitability stability. Incomplete information prevents auto-quote.",
              confidence: 0.88,
            },
            {
              step: 3,
              description:
                "Analyzed comparable prior decisions for guidance",
              evidence:
                "One comparable was declined (FinTech Bridge) and one was bound with restrictions (Pinnacle). The split outcome suggests this risk is on the border and requires judgment.",
              confidence: 0.85,
            },
            {
              step: 4,
              description:
                "Assessed relevant clause delta impacts on pricing",
              evidence:
                "Three high-severity clause deltas are relevant. The combined term gap advantage versus Kinsale supports competitive pricing if the risk is accepted.",
              confidence: 0.83,
            },
            {
              step: 5,
              description:
                "Generated needs-review recommendation with actionable next steps",
              evidence:
                "Combined score of 0.62 falls below auto-quote threshold (0.80) but above auto-decline (0.40). Referral to underwriter with specific information requests and endorsement suggestions.",
              confidence: 0.80,
            },
          ],
          provenance: {
            documentId: "sub-002-explain",
            documentName: "Underwriting Decision Report",
            pageNumber: 1,
            extractionConfidence: 0.80,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-11T09:16:12Z",
          },
        },
      },
    },
  },

  // ── ToxiChem Processing Inc — Auto-Decline ──
  {
    submissionId: "sub-010",
    startedAt: "2025-01-19T08:30:05Z",
    completedAt: "2025-01-19T08:30:38Z",
    modelVersion: "v2.4.1",
    stages: {
      classify: {
        status: "complete",
        data: {
          naicsCode: "325199",
          naicsDescription:
            "All Other Basic Organic Chemical Manufacturing",
          coverageTypes: ["General Liability", "Umbrella", "Property"],
          qualityScore: 0.95,
          riskFlags: [
            {
              name: "Prohibited NAICS code",
              severity: "high",
              evidence:
                "NAICS 325199 (Organic Chemical Manufacturing) is on the prohibited class list due to catastrophic environmental and bodily injury exposure.",
            },
            {
              name: "Tier 1 TRI reporter",
              severity: "high",
              evidence:
                "Facility is a Tier 1 reporter under the Toxic Release Inventory, releasing over 25,000 lbs of listed chemicals annually.",
            },
            {
              name: "Recent EPA enforcement",
              severity: "high",
              evidence:
                "EPA consent decree from 2023 requiring $3.5M in corrective action for Clean Air Act violations at the primary facility.",
            },
            {
              name: "Catastrophic event history",
              severity: "high",
              evidence:
                "2021 chemical release resulted in shelter-in-place order for surrounding community. $8M in third-party claims currently in litigation.",
            },
          ],
          confidence: 0.97,
          reasoningSteps: [
            {
              step: 1,
              description: "Identified business operations as chemical manufacturing",
              evidence:
                "ToxiChem processes specialty organic chemicals including solvents, intermediates, and catalysts for petrochemical and pharmaceutical customers. Primary facility in Baton Rouge, LA.",
              confidence: 0.98,
            },
            {
              step: 2,
              description: "Mapped to NAICS 325199 — prohibited class",
              evidence:
                "Operations map to NAICS 325199 (All Other Basic Organic Chemical Manufacturing). This NAICS code is on the prohibited class list effective 2023-Q1.",
              confidence: 0.97,
            },
            {
              step: 3,
              description: "Identified multiple disqualifying risk factors",
              evidence:
                "Four high-severity risk flags identified: prohibited class, TRI reporting, active EPA consent decree, and prior catastrophic event with $8M in pending litigation.",
              confidence: 0.96,
            },
            {
              step: 4,
              description: "Confirmed immediate auto-decline per class guidelines",
              evidence:
                "Prohibited class designation is a hard stop. No override or referral pathway exists for NAICS 325199. Auto-decline regardless of submission quality.",
              confidence: 0.98,
            },
          ],
          provenance: {
            documentId: "sub-010-classify",
            documentName: "ToxiChem ACORD Application",
            pageNumber: 1,
            extractionConfidence: 0.97,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-19T08:30:10Z",
          },
        },
      },
      retrieve: {
        status: "complete",
        data: {
          similarInsureds: [
            {
              name: "ChemStar Processing LLC",
              naicsCode: "325199",
              similarityScore: 0.91,
              priorOutcome: "Declined — prohibited class",
              lossRatio: 1.85,
            },
            {
              name: "Gulf States Chemical Corp",
              naicsCode: "325199",
              similarityScore: 0.88,
              priorOutcome: "Declined — prohibited class, EPA violations",
              lossRatio: 2.10,
            },
            {
              name: "SynthChem Industries",
              naicsCode: "325110",
              similarityScore: 0.82,
              priorOutcome: "Declined — prohibited class",
              lossRatio: 1.45,
            },
          ],
          relevantLosses: [
            {
              description:
                "Chemical plant explosion resulting in community evacuation and multiple bodily injury claims. Total incurred exceeded $15M across GL and excess layers.",
              amount: 15200000,
              year: 2021,
              relevanceScore: 0.96,
            },
            {
              description:
                "Groundwater contamination from chemical storage facility. Environmental remediation and third-party claims ongoing for 8 years. Current reserves at $22M.",
              amount: 22000000,
              year: 2019,
              relevanceScore: 0.94,
            },
            {
              description:
                "Worker exposure to volatile organic compounds resulting in occupational disease claims. 12 claimants with total exposure estimated at $6M.",
              amount: 6000000,
              year: 2023,
              relevanceScore: 0.91,
            },
          ],
          clauseFingerprints: [
            {
              clauseId: "cd-001",
              title: "Pollution Exclusion — Hostile Fire Exception",
              matchScore: 0.95,
            },
          ],
          provenance: {
            documentId: "sub-010-retrieve",
            documentName: "Similar Insured Retrieval Report",
            pageNumber: 1,
            extractionConfidence: 0.95,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-19T08:30:18Z",
          },
        },
      },
      analyze: {
        status: "complete",
        data: {
          relevantClauseDeltas: [
            {
              clauseDeltaId: "cd-001",
              title: "Pollution Exclusion — Hostile Fire Exception",
              direction: "tighter",
              severity: "high",
              recommendation:
                "Not applicable — account is auto-declined. Pollution exclusion analysis is moot for prohibited class.",
            },
          ],
          tighteningOptions: [],
          provenance: {
            documentId: "sub-010-analyze",
            documentName: "Clause Delta Analysis Report",
            pageNumber: 1,
            extractionConfidence: 0.95,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-19T08:30:25Z",
          },
        },
      },
      evaluate: {
        status: "complete",
        data: {
          appetiteScore: 0.0,
          lossFeatures: [
            {
              name: "NAICS prohibited class",
              value: "Yes — hard decline",
              weight: 1.0,
            },
            {
              name: "EPA enforcement actions",
              value: "Active consent decree ($3.5M)",
              weight: 0.0,
            },
            {
              name: "Pending litigation",
              value: "$8M in open claims",
              weight: 0.0,
            },
            {
              name: "TRI reporting status",
              value: "Tier 1 (>25,000 lbs/year)",
              weight: 0.0,
            },
          ],
          clauseImpacts: [],
          combinedScore: 0.0,
          confidence: 0.98,
          calibrationBucket: "prohibited_class_immediate_decline",
          provenance: {
            documentId: "sub-010-evaluate",
            documentName: "Risk Evaluation Scorecard",
            pageNumber: 1,
            extractionConfidence: 0.98,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-19T08:30:30Z",
          },
        },
      },
      explain: {
        status: "complete",
        data: {
          overallRecommendation: "decline",
          summary:
            "ToxiChem Processing Inc operates in NAICS 325199 (Organic Chemical Manufacturing), which is on the prohibited class list. This is an immediate auto-decline with no referral pathway. The insured also has an active EPA consent decree, $8M in pending litigation from a 2021 chemical release, and is a Tier 1 TRI reporter. All comparable prior submissions in this class were declined.",
          recommendations: [
            {
              action: "Issue decline letter referencing prohibited class",
              rationale:
                "NAICS 325199 is a hard-stop prohibited class. The decline should reference the class prohibition and suggest the broker seek coverage from specialty environmental carriers.",
              citations: [
                {
                  documentId: "sub-010-classify",
                  documentName: "ToxiChem ACORD Application",
                  pageNumber: 1,
                  extractionConfidence: 0.97,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-19T08:30:10Z",
                },
              ],
            },
            {
              action:
                "Notify broker of alternative market suggestions",
              rationale:
                "Chemical manufacturing accounts should be directed to specialty environmental carriers such as Steadfast, Great American E&S, or Beazley Environmental. These carriers have appropriate pricing models and form language for this class.",
              citations: [
                {
                  documentId: "sub-010-retrieve",
                  documentName: "Similar Insured Retrieval Report",
                  pageNumber: 1,
                  extractionConfidence: 0.95,
                  modelVersion: "v2.4.1",
                  extractionTimestamp: "2025-01-19T08:30:18Z",
                },
              ],
            },
          ],
          reasoningSteps: [
            {
              step: 1,
              description:
                "Identified NAICS 325199 as prohibited class",
              evidence:
                "Chemical manufacturing is on the prohibited class list. This is a hard stop with no underwriter override available.",
              confidence: 0.98,
            },
            {
              step: 2,
              description:
                "Confirmed all comparable accounts were declined",
              evidence:
                "Three similar insureds in NAICS 325199/325110 were all declined. Historical loss ratios for this class range 1.45-2.10, confirming unprofitable exposure.",
              confidence: 0.96,
            },
            {
              step: 3,
              description:
                "Documented additional disqualifying factors",
              evidence:
                "Active EPA consent decree, $8M pending litigation, and Tier 1 TRI status would independently warrant decline even if the class were not prohibited.",
              confidence: 0.97,
            },
            {
              step: 4,
              description:
                "Assessed catastrophic loss potential",
              evidence:
                "Comparable losses in the chemical sector range $6M-$22M per event, with multi-year environmental remediation tails. Exposure is incompatible with E&S appetite.",
              confidence: 0.95,
            },
            {
              step: 5,
              description:
                "Generated auto-decline with broker guidance",
              evidence:
                "Immediate decline with recommendation to direct broker to specialty environmental carriers with appropriate risk transfer mechanisms for this class.",
              confidence: 0.98,
            },
          ],
          provenance: {
            documentId: "sub-010-explain",
            documentName: "Underwriting Decision Report",
            pageNumber: 1,
            extractionConfidence: 0.98,
            modelVersion: "v2.4.1",
            extractionTimestamp: "2025-01-19T08:30:38Z",
          },
        },
      },
    },
  },
];

export const WORKFLOW_MAP: Record<string, WorkflowDeepDive> =
  Object.fromEntries(WORKFLOWS.map((wf) => [wf.submissionId, wf]));

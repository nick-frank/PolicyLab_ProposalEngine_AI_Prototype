import { jsPDF } from "jspdf";
import type {
  PortalSubmission,
  PortalProposal,
  PortalRate,
  SubmissionForm,
} from "./types";

// ── Constants ──────────────────────────────────────────────────────────

const PAGE_W = 215.9; // letter width mm
const PAGE_H = 279.4; // letter height mm
const MARGIN_L = 20;
const MARGIN_R = 20;
const MARGIN_T = 25;
const MARGIN_B = 20;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

const GOLD = [178, 144, 60] as const; // Markel gold
const DARK = [33, 33, 33] as const;
const GRAY = [100, 100, 100] as const;
const LIGHT_GRAY = [200, 200, 200] as const;
const TABLE_HEADER_BG = [240, 237, 228] as const;

const POLICY_FEE = 150;
const TRIA_RATE = 0.03;
const TRIA_MIN = 150;

// ── Helpers ────────────────────────────────────────────────────────────

function fmt$(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

/** Draw the gold "MARKEL" header on every page */
function drawHeader(doc: jsPDF) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...GOLD);
  doc.text("MARKEL", MARGIN_L, 15);
  // thin gold line under header
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_L, 18, PAGE_W - MARGIN_R, 18);
}

/** Draw a right-aligned sub-header with insured + txn on pages 2+ */
function drawSubHeader(doc: jsPDF, sub: PortalSubmission) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  const txt = `${sub.insuredName}  |  ${sub.referenceNumber}`;
  doc.text(txt, PAGE_W - MARGIN_R, 14, { align: "right" });
}

/** Draw page number footer */
function drawFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(
    `Page ${pageNum} of ${totalPages}`,
    PAGE_W / 2,
    PAGE_H - 10,
    { align: "center" }
  );
  doc.text(
    "Markel Insurance Company — Evanston, IL",
    PAGE_W - MARGIN_R,
    PAGE_H - 10,
    { align: "right" }
  );
}

/** Section title (bold, dark, with underline) — returns new Y */
function sectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text(title, MARGIN_L, y);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_L, y + 1.5, PAGE_W - MARGIN_R, y + 1.5);
  return y + 8;
}

/** Label-value pair row — returns new Y */
function labelValue(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  labelX = MARGIN_L,
  valueX = MARGIN_L + 55
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(label, labelX, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(value, valueX, y);
  return y + 5;
}

/** Draw a simple table. Returns new Y after table. */
function drawTable(
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  options?: { rightAlignCols?: number[] }
): number {
  const rightAlignCols = new Set(options?.rightAlignCols || []);
  const rowH = 5.5;

  // Header row
  doc.setFillColor(...TABLE_HEADER_BG);
  doc.rect(MARGIN_L, y - 3.5, CONTENT_W, rowH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  let x = MARGIN_L + 2;
  headers.forEach((h, i) => {
    if (rightAlignCols.has(i)) {
      doc.text(h, x + colWidths[i] - 4, y, { align: "right" });
    } else {
      doc.text(h, x, y);
    }
    x += colWidths[i];
  });
  y += rowH;

  // Data rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  for (const row of rows) {
    // Check for page overflow
    if (y > PAGE_H - MARGIN_B - 10) {
      return y; // caller should handle page break
    }
    x = MARGIN_L + 2;
    doc.setTextColor(...DARK);
    row.forEach((cell, i) => {
      if (rightAlignCols.has(i)) {
        doc.text(cell, x + colWidths[i] - 4, y, { align: "right" });
      } else {
        // Truncate long text to fit column
        const maxW = colWidths[i] - 4;
        const truncated = doc.getTextWidth(cell) > maxW
          ? cell.substring(0, Math.floor(cell.length * maxW / doc.getTextWidth(cell))) + "…"
          : cell;
        doc.text(truncated, x, y);
      }
      x += colWidths[i];
    });
    // light separator
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.1);
    doc.line(MARGIN_L, y + 1.5, PAGE_W - MARGIN_R, y + 1.5);
    y += rowH;
  }

  return y + 2;
}

/** Wrap text into lines that fit within maxWidth */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    const test = currentLine ? currentLine + " " + word : word;
    if (doc.getTextWidth(test) > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ── Page Builders ──────────────────────────────────────────────────────

function buildPage1_QuoteSummary(
  doc: jsPDF,
  sub: PortalSubmission,
  proposal: PortalProposal,
  rates: PortalRate[]
) {
  drawHeader(doc);
  let y = MARGIN_T + 5;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  doc.text("Quote Summary", MARGIN_L, y);
  y += 10;

  // Date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(fmtDate(proposal.createdDate), MARGIN_L, y);
  y += 10;

  // Broker & Underwriter side by side
  y = sectionTitle(doc, y, "Broker Information");
  y = labelValue(doc, y, "Broker:", sub.broker);
  y = labelValue(doc, y, "Reference:", sub.referenceNumber);
  y += 5;

  y = sectionTitle(doc, y, "Underwriter Contact");
  y = labelValue(doc, y, "Underwriter:", sub.assignedUnderwriter);
  if (sub.approver) {
    y = labelValue(doc, y, "Approver:", sub.approver);
  }
  y = labelValue(doc, y, "Company:", "Markel Insurance Company");
  y = labelValue(doc, y, "Address:", "Ten Parkway North, Deerfield, IL 60015");
  y += 5;

  // Named Insured
  y = sectionTitle(doc, y, "Named Insured");
  y = labelValue(doc, y, "Insured Name:", sub.insuredName);
  y = labelValue(doc, y, "State:", sub.state);
  y = labelValue(doc, y, "NAICS:", `${sub.naicsCode} — ${sub.naicsDescription}`);
  y = labelValue(doc, y, "Line of Business:", sub.lineOfBusiness);
  y += 5;

  // Policy Term
  y = sectionTitle(doc, y, "Policy Term");
  y = labelValue(doc, y, "Effective Date:", shortDate(sub.effectiveDate));
  y = labelValue(doc, y, "Expiration Date:", shortDate(sub.expirationDate));
  y += 5;

  // Premium Summary
  const totalAdjustedPremium = rates.reduce((s, r) => s + r.adjustedPremium, 0);
  const triaPremium = Math.max(
    Math.round(totalAdjustedPremium * TRIA_RATE),
    TRIA_MIN
  );
  const surplusLinesTax = Math.round(totalAdjustedPremium * 0.032); // CA standard ~3.2%
  const stampingFee = Math.round(totalAdjustedPremium * 0.0018); // CA stamping
  const totalCost = totalAdjustedPremium + POLICY_FEE + triaPremium + surplusLinesTax + stampingFee;

  y = sectionTitle(doc, y, "Premium Summary");
  y = labelValue(doc, y, "GL Premium:", fmt$(totalAdjustedPremium));
  y = labelValue(doc, y, "Policy Fee:", fmt$(POLICY_FEE));
  y = labelValue(doc, y, "TRIA Premium:", fmt$(triaPremium));
  y = labelValue(doc, y, "Surplus Lines Tax:", fmt$(surplusLinesTax));
  y = labelValue(doc, y, "Stamping Fee:", fmt$(stampingFee));

  // Total line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_L + 55, y - 2, MARGIN_L + 110, y - 2);
  y += 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("Total Estimated Cost:", MARGIN_L, y);
  doc.text(fmt$(totalCost), MARGIN_L + 55, y);
  y += 5;

  // Disclaimer
  y += 5;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const disclaimer =
    "This quote summary is for informational purposes only and does not constitute a binder of insurance. Coverage is subject to the terms, conditions, and exclusions of the policy as issued.";
  const lines = wrapText(doc, disclaimer, CONTENT_W);
  for (const line of lines) {
    doc.text(line, MARGIN_L, y);
    y += 3.5;
  }
}

function buildPage2_BindingConditions(doc: jsPDF, sub: PortalSubmission) {
  doc.addPage();
  drawHeader(doc);
  drawSubHeader(doc, sub);
  let y = MARGIN_T + 5;

  y = sectionTitle(doc, y, "Binding Conditions");
  y += 3;

  const conditions = [
    "Receipt and acceptance of the signed application.",
    "Receipt and acceptance of a currently valued loss run from all carriers for the past five (5) years.",
    "Receipt of signed Binding Authorization from the broker of record.",
    "Premium payment in full is due within 30 days of the effective date.",
    "All information submitted to Markel must be accurate and complete. Any material misrepresentation may void the policy.",
    "The insured must maintain all safety programs and operations as described in the application.",
    "Markel reserves the right to conduct a physical inspection of the insured's premises and operations.",
    "Any changes in operations, exposures, or ownership must be reported to Markel immediately.",
    "This quote is valid for 30 days from the date issued, subject to re-underwriting upon expiration.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  for (const cond of conditions) {
    const lines = wrapText(doc, cond, CONTENT_W - 10);
    doc.text("•", MARGIN_L + 2, y);
    for (let i = 0; i < lines.length; i++) {
      doc.text(lines[i], MARGIN_L + 8, y);
      y += 4.5;
    }
    y += 1;
  }

  // Catastrophe disclaimer
  y += 8;
  y = sectionTitle(doc, y, "Catastrophe Exposure Disclaimer");
  y += 2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  const catText =
    "This policy does not provide coverage for certified acts of terrorism as defined in the Terrorism Risk Insurance Act (TRIA), as amended. Separate terrorism coverage may be available through the TRIA endorsement included in this proposal. The insured is responsible for reviewing the terrorism coverage options presented and making an informed election.";
  const catLines = wrapText(doc, catText, CONTENT_W);
  for (const line of catLines) {
    doc.text(line, MARGIN_L, y);
    y += 4;
  }
}

function buildPage3_GLCoverage(
  doc: jsPDF,
  sub: PortalSubmission,
  proposal: PortalProposal,
  rates: PortalRate[],
  forms: SubmissionForm[]
) {
  doc.addPage();
  drawHeader(doc);
  drawSubHeader(doc, sub);
  let y = MARGIN_T + 5;

  y = sectionTitle(doc, y, "General Liability Coverage");
  y += 3;

  // Limits of Insurance
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Limits of Insurance", MARGIN_L, y);
  y += 6;

  const limits = [
    ["General Aggregate Limit", "$2,000,000"],
    ["Products/Completed Operations Aggregate", "$2,000,000"],
    ["Each Occurrence Limit", "$1,000,000"],
    ["Personal & Advertising Injury Limit", "$1,000,000"],
    ["Damage to Premises Rented to You", "$100,000"],
    ["Medical Expense (any one person)", "$10,000"],
  ];

  for (const [label, value] of limits) {
    y = labelValue(doc, y, label + ":", value);
  }
  y += 3;

  // Deductible
  y = labelValue(doc, y, "Deductible:", "$0 Each Occurrence");
  y += 5;

  // Location Schedule
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Location Schedule", MARGIN_L, y);
  y += 6;

  y = drawTable(
    doc,
    y,
    ["Loc #", "Territory", "State", "Description"],
    [["1", rates[0]?.territory || "—", sub.state, sub.naicsDescription]],
    [15, 30, 20, CONTENT_W - 65]
  );
  y += 3;

  // Classification & Premium
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Classification & Premium", MARGIN_L, y);
  y += 6;

  const rateRows = rates.map((r) => [
    r.classCode,
    r.classDescription,
    r.exposureBase,
    new Intl.NumberFormat("en-US").format(r.exposure),
    r.baseRate.toFixed(2),
    fmt$(r.manualPremium),
    r.lcm.toFixed(2),
    fmt$(r.adjustedPremium),
  ]);

  const totalAdj = rates.reduce((s, r) => s + r.adjustedPremium, 0);
  rateRows.push(["", "Total", "", "", "", "", "", fmt$(totalAdj)]);

  y = drawTable(
    doc,
    y,
    ["Code", "Description", "Basis", "Exposure", "Rate", "Manual Prem", "LCM", "Adj. Prem"],
    rateRows,
    [18, 52, 18, 22, 15, 22, 14, CONTENT_W - 161],
    { rightAlignCols: [3, 4, 5, 6, 7] }
  );
  y += 5;

  // Additional Coverages / Endorsement adjustments
  const formsWithAdj = forms.filter((f) => f.adjustments && f.adjustments.length > 0);
  if (formsWithAdj.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK);
    doc.text("Additional Coverage Adjustments", MARGIN_L, y);
    y += 6;

    const adjRows: string[][] = [];
    for (const f of formsWithAdj) {
      for (const adj of f.adjustments!) {
        adjRows.push([
          f.formNumber,
          adj.description,
          adj.type === "credit" ? `(${fmt$(adj.amount)})` : fmt$(adj.amount),
        ]);
      }
    }

    y = drawTable(
      doc,
      y,
      ["Form", "Description", "Amount"],
      adjRows,
      [30, CONTENT_W - 60, 30],
      { rightAlignCols: [2] }
    );
  }
}

function buildPage4_Terrorism(
  doc: jsPDF,
  sub: PortalSubmission,
  rates: PortalRate[]
) {
  doc.addPage();
  drawHeader(doc);
  drawSubHeader(doc, sub);
  let y = MARGIN_T + 5;

  y = sectionTitle(doc, y, "Terrorism Risk Insurance Act (TRIA) Disclosure");
  y += 3;

  const totalPremium = rates.reduce((s, r) => s + r.adjustedPremium, 0);
  const triaPremium = Math.max(Math.round(totalPremium * TRIA_RATE), TRIA_MIN);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const triaText = [
    "In accordance with the Terrorism Risk Insurance Act of 2002, as amended and reauthorized (TRIA), we are required to offer you terrorism coverage and to inform you of the premium for this coverage.",
    "",
    "Coverage for acts of terrorism is included in your policy. The portion of your premium attributable to coverage for certified acts of terrorism is as follows:",
  ];

  for (const para of triaText) {
    if (!para) {
      y += 4;
      continue;
    }
    const lines = wrapText(doc, para, CONTENT_W);
    for (const line of lines) {
      doc.text(line, MARGIN_L, y);
      y += 4.5;
    }
  }

  y += 5;
  y = labelValue(doc, y, "GL Premium:", fmt$(totalPremium));
  y = labelValue(doc, y, "TRIA Rate:", `${(TRIA_RATE * 100).toFixed(1)}% of GL Premium`);
  y = labelValue(doc, y, "TRIA Premium:", fmt$(triaPremium));
  y = labelValue(doc, y, "Minimum TRIA Premium:", fmt$(TRIA_MIN));
  y += 8;

  const disclosure2 = [
    "The United States Department of the Treasury will determine whether an event is a certified act of terrorism. Under TRIA, the federal government will pay 80% of covered terrorism losses exceeding the statutorily established deductible, and the insurer will be responsible for 20%. The federal share applies when total industry insured losses from certified acts of terrorism exceed $200 million in a calendar year.",
    "",
    "The premium charge for terrorism coverage is determined using the current Markel rate filing for this coverage territory and class of business. Terrorism premium is subject to a minimum premium as noted above.",
  ];

  for (const para of disclosure2) {
    if (!para) {
      y += 4;
      continue;
    }
    const lines = wrapText(doc, para, CONTENT_W);
    for (const line of lines) {
      doc.text(line, MARGIN_L, y);
      y += 4.5;
    }
  }
}

function buildPage5_ExcessIndication(
  doc: jsPDF,
  sub: PortalSubmission,
  rates: PortalRate[]
) {
  doc.addPage();
  drawHeader(doc);
  drawSubHeader(doc, sub);
  let y = MARGIN_T + 5;

  y = sectionTitle(doc, y, "Excess Liability Indication");
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const introLines = wrapText(
    doc,
    "The following excess liability indications are available in conjunction with the underlying General Liability coverage quoted above. These are indications only and are subject to underwriting review and approval.",
    CONTENT_W
  );
  for (const line of introLines) {
    doc.text(line, MARGIN_L, y);
    y += 4.5;
  }
  y += 5;

  const totalPremium = rates.reduce((s, r) => s + r.adjustedPremium, 0);

  // Standard excess tier multipliers
  const tiers = [
    { limit: "$1M xs $1M", multiplier: 0.6 },
    { limit: "$2M xs $1M", multiplier: 0.85 },
    { limit: "$3M xs $1M", multiplier: 1.05 },
    { limit: "$4M xs $1M", multiplier: 1.2 },
    { limit: "$5M xs $1M", multiplier: 1.35 },
  ];

  const tierRows = tiers.map((t) => [
    t.limit,
    `${(t.multiplier * 100).toFixed(0)}%`,
    fmt$(Math.round(totalPremium * t.multiplier)),
  ]);

  y = drawTable(
    doc,
    y,
    ["Excess Limit", "Rate Factor", "Indicated Premium"],
    tierRows,
    [50, 40, CONTENT_W - 90],
    { rightAlignCols: [1, 2] }
  );

  y += 8;

  // Governing Class
  const governingRate = rates.reduce(
    (max, r) => (r.adjustedPremium > max.adjustedPremium ? r : max),
    rates[0]
  );

  y = sectionTitle(doc, y, "Governing Classification");
  y += 3;
  y = labelValue(doc, y, "Class Code:", governingRate.classCode);
  y = labelValue(doc, y, "Description:", governingRate.classDescription);
  y = labelValue(doc, y, "Territory:", governingRate.territory);

  y += 10;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const note =
    "Excess indications are subject to separate underwriting review. Final terms, conditions, and pricing may differ from the indications shown above. Minimum premium applies.";
  const noteLines = wrapText(doc, note, CONTENT_W);
  for (const line of noteLines) {
    doc.text(line, MARGIN_L, y);
    y += 3.5;
  }
}

function buildPages6_7_FormsEndorsements(
  doc: jsPDF,
  sub: PortalSubmission,
  forms: SubmissionForm[]
) {
  doc.addPage();
  drawHeader(doc);
  drawSubHeader(doc, sub);
  let y = MARGIN_T + 5;

  y = sectionTitle(doc, y, "Forms and Endorsements Schedule");
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);

  // Group forms by category
  const grouped = new Map<string, SubmissionForm[]>();
  for (const f of forms) {
    const cat = f.category || "Other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(f);
  }

  for (const [category, catForms] of grouped) {
    // Check page overflow
    if (y > PAGE_H - MARGIN_B - 30) {
      doc.addPage();
      drawHeader(doc);
      drawSubHeader(doc, sub);
      y = MARGIN_T + 5;
    }

    // Category header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.text(category, MARGIN_L, y);
    y += 5;

    const formRows = catForms.map((f) => [
      f.formNumber,
      f.edition,
      f.formName,
      f.type,
    ]);

    y = drawTable(
      doc,
      y,
      ["Form Number", "Edition", "Form Name", "Type"],
      formRows,
      [32, 18, CONTENT_W - 68, 18]
    );

    // Print descriptions if any
    for (const f of catForms) {
      if (f.description) {
        if (y > PAGE_H - MARGIN_B - 15) {
          doc.addPage();
          drawHeader(doc);
          drawSubHeader(doc, sub);
          y = MARGIN_T + 5;
        }
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...GRAY);
        const descLines = wrapText(
          doc,
          `${f.formNumber}: ${f.description}`,
          CONTENT_W - 5
        );
        for (const line of descLines) {
          doc.text(line, MARGIN_L + 5, y);
          y += 3.5;
        }
      }
    }

    y += 4;
  }
}

// ── Main Export Function ───────────────────────────────────────────────

export function generateProposalPdf(
  submission: PortalSubmission,
  proposal: PortalProposal,
  rates: PortalRate[],
  forms: SubmissionForm[]
) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });

  // Build all pages
  buildPage1_QuoteSummary(doc, submission, proposal, rates);
  buildPage2_BindingConditions(doc, submission);
  buildPage3_GLCoverage(doc, submission, proposal, rates, forms);
  buildPage4_Terrorism(doc, submission, rates);

  if (rates.length > 0) {
    buildPage5_ExcessIndication(doc, submission, rates);
  }

  buildPages6_7_FormsEndorsements(doc, submission, forms);

  // Add page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  // Download
  const fileName = `Markel_Proposal_${submission.referenceNumber.replace(/\s+/g, "_")}_v${proposal.version}.pdf`;
  doc.save(fileName);
}

import puppeteer from "puppeteer";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  PageBreak,
  AlignmentType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
} from "docx";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");
const PDF_DIR = path.join(SCREENSHOT_DIR, "pdf");

// ── GL Rater test data (injected into localStorage) ──────────────────────
const GL_RATER_TEST_QUOTES = [
  {
    quote_id: "quote-test-001",
    insured_name: "ABC Construction Co.",
    status: "calculated",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    pl2_selection: "Contractors",
    territory: "CA-01",
    technical_premium: 12362.5,
    input_data: {
      policy_details: {
        insured_name: "ABC Construction Co.",
        deal_number: "Txn9163632",
        pl2_selection: "Contractors",
        territory: "CA-01",
        effective_date: "2026-03-03",
        expiration_date: "2027-03-03",
        occurrence_limit: 1000000,
        aggregate_limit: 2000000,
        sir_type: "SIR",
        sir_amount: 2500,
        commission: 0.15,
        new_renewal_sales: 8000000,
        expiring_sales: 7500000,
      },
      class_codes: [
        { code: "10026", description: "Commercial Construction", location: "001", exposure: 5000000, rate: 1.25 },
        { code: "10033", description: "Residential Construction", location: "002", exposure: 3000000, rate: 1.5 },
      ],
      experience_modifier: {
        evaluation_date: "2024-01-01",
        modifier_value: 1.15,
        losses: [
          { date: "2023-06-15", indemnity: 25000, expense: 5000 },
          { date: "2022-11-20", indemnity: 15000, expense: 3000 },
        ],
      },
      uw_notes: "Primary contractor for commercial and residential projects in California.",
    },
  },
  {
    quote_id: "quote-test-002",
    insured_name: "XYZ Restaurant Group",
    status: "draft",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    pl2_selection: "General Liability",
    territory: "NY-02",
    technical_premium: 8500,
    input_data: {
      policy_details: { insured_name: "XYZ Restaurant Group", pl2_selection: "General Liability", territory: "NY-02" },
      class_codes: [
        { code: "16910", description: "Restaurant - Fast Food", location: "001", exposure: 2500000, rate: 0.85 },
        { code: "16911", description: "Restaurant - Full Service", location: "002", exposure: 3200000, rate: 1.10 },
      ],
      experience_modifier: {},
      uw_notes: "",
    },
  },
  {
    quote_id: "quote-test-003",
    insured_name: "Tech Solutions Inc.",
    status: "approved",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    pl2_selection: "Products Liability - Occurrence",
    territory: "TX-03",
    technical_premium: 15750,
    input_data: {
      policy_details: { insured_name: "Tech Solutions Inc.", pl2_selection: "Products Liability - Occurrence", territory: "TX-03" },
      class_codes: [
        { code: "59941", description: "Electronic Components Mfg", location: "001", exposure: 12000000, rate: 0.65 },
      ],
      experience_modifier: { evaluation_date: "2024-06-01", modifier_value: 0.92 },
      uw_notes: "Clean loss history. Primary products liability for electronic component manufacturing.",
    },
  },
];

// ── Pages to capture ─────────────────────────────────────────────────────
const PAGES = [
  // Dashboard
  {
    url: "/",
    title: "Dashboard — Platform Overview",
    section: "Dashboard",
    description:
      "This is the main landing page an underwriter sees upon logging in. It surfaces key metrics — open submissions, pending approvals, and recent activity — in a single view. The navigation sidebar provides one-click access to every module in the platform. Users typically start here each morning to triage their workload and jump into the highest-priority items.",
  },

  // PolicyLab
  {
    url: "/phase2/clause-deltas",
    title: "Clause Delta Library — List View",
    section: "PolicyLab",
    description:
      "This screen lists every clause-level difference the AI has identified between Markel's policy forms and competitor offerings. Underwriters use the search bar and filters to locate specific exclusions, conditions, or definitions. Each row shows the clause name, the carriers compared, and a severity indicator. Clicking any row opens the full side-by-side comparison. This is the starting point for competitive form analysis.",
  },
  {
    url: "/phase2/clause-deltas/cd-001",
    title: "Clause Delta Detail — Pollution Exclusion",
    section: "PolicyLab",
    description:
      "Here the underwriter sees the exact wording differences for a pollution exclusion clause across two carrier forms. The left and right panels display each carrier's language with differences highlighted. Below, the AI provides a plain-English summary of the practical impact — for example, whether Markel's form is broader or narrower — and recommends whether this delta creates a competitive advantage or exposure. Users reference this screen when positioning quotes against specific competitors.",
  },
  {
    url: "/phase2/scorecards",
    title: "Coverage Tightness Scorecards — Overview",
    section: "PolicyLab",
    description:
      "The scorecards overview presents a grid of coverage segments (e.g., Plumbing/HVAC, Artisan Contractors) with a tightness score for each carrier. Higher scores indicate more restrictive coverage; lower scores indicate broader forms. Underwriters use this to quickly identify which product lines Markel leads on breadth and where competitors may be more generous. Click any segment card to drill into the full scorecard breakdown.",
  },
  {
    url: "/phase2/scorecards/sc-001",
    title: "Scorecard Detail — Plumbing/HVAC GL",
    section: "PolicyLab",
    description:
      "This detailed scorecard breaks down coverage tightness for the Plumbing/HVAC GL segment across multiple dimensions: exclusions, conditions, definitions, and endorsements. A radar chart visualizes how each carrier compares at a glance. Below, a clause-by-clause table shows individual scores with expandable explanations. Underwriters use this when preparing for broker negotiations or evaluating whether to broaden or tighten their own form for a specific class.",
  },
  {
    url: "/phase2/scenario-checks",
    title: "Scenario-Based Coverage Checks — List",
    section: "PolicyLab",
    description:
      "This page lists hypothetical loss scenarios — pollution incidents, completed-operations failures, product recalls — that test how each carrier's form would respond. Each scenario shows a brief description, the carriers evaluated, and a pass/fail indicator. Underwriters use these checks to validate competitive claims ('our form covers what theirs doesn't') and to identify coverage gaps before they result in denied claims.",
  },
  {
    url: "/phase2/scenario-checks/cv-001",
    title: "Scenario Detail — Pollution Incident",
    section: "PolicyLab",
    description:
      "The scenario detail walks through a specific pollution-incident loss event step by step. Each element of the loss (e.g., gradual contamination, cleanup costs, third-party bodily injury) is mapped to the relevant policy provisions. A matrix shows which carriers would pay, which would deny, and the specific clauses that drive each outcome. Underwriters reference this when explaining form differences to brokers or when deciding whether to offer manuscript endorsements.",
  },
  {
    url: "/phase2/pricing-analysis",
    title: "Selection & Pricing Analysis",
    section: "PolicyLab",
    description:
      "This screen presents an adverse-selection and pricing-adequacy analysis. Charts compare Markel's rate level to competitors across class codes, highlighting segments where Markel may be attracting unfavorable risk (priced too low) or losing desirable business (priced too high). A data table below shows per-class rate comparisons with loss ratio context. Underwriters and actuaries use this to calibrate rate recommendations and identify classes where pricing adjustments would improve the book's performance.",
  },
  {
    url: "/phase2/clause-alignment",
    title: "Clause Alignment Explorer",
    section: "PolicyLab",
    description:
      "The Clause Alignment Explorer lets underwriters search for a coverage concept — such as 'additional insured' or 'waiver of subrogation' — and instantly see how every competitor's form addresses it. Results are ranked by AI-powered similarity scores. This tool is especially useful when a broker asks 'does your form match what they offer?' — the underwriter can pull up the alignment in seconds and give a precise answer.",
  },
  {
    url: "/phase2/clause-alignment/al-001",
    title: "Alignment Detail — Pollution Exclusion Match",
    section: "PolicyLab",
    description:
      "This detail view displays the specific clause matches found for a pollution exclusion alignment search. Each matched clause is shown side by side with a confidence score indicating how closely the language aligns. Key differences in scope, applicability, and exceptions are highlighted. The underwriter uses this to determine whether Markel's pollution exclusion is substantively equivalent to a competitor's — critical for form-matching requirements in large accounts.",
  },
  {
    url: "/phase2/document-audit",
    title: "Document Understanding Audit — Overview",
    section: "PolicyLab",
    description:
      "This audit screen provides transparency into how the AI parsed each uploaded policy document. Every processed document is listed with an extraction quality score, the number of clauses identified, and any ambiguities flagged for human review. Users click into individual documents to verify the AI's interpretation. This builds trust in the AI outputs by letting underwriters see exactly what the system understood and where it might need correction.",
  },
  {
    url: "/phase2/document-audit/doc-markel-gl-01",
    title: "Document Audit Detail — Markel GL Policy",
    section: "PolicyLab",
    description:
      "The document audit detail for Markel's GL policy shows the AI's extracted structure alongside the original source text. Sections, clauses, exclusions, and definitions are organized in a navigable tree. Each extracted element has a confidence indicator — green for high confidence, amber for uncertain. Users can click on any element to see the exact source text it was derived from. This is where subject-matter experts validate the AI's document understanding before it feeds into clause comparisons and scorecards.",
  },
  {
    url: "/phase2/claims-search",
    title: "Claims Search — AI Chat Interface",
    section: "PolicyLab",
    description:
      "This conversational interface lets underwriters query historical claims data using natural language. For example, an underwriter might type 'Show me all pollution claims for plumbing contractors in California over the past 3 years' and receive an instant, structured answer with relevant claim records and aggregate statistics. The chat maintains context across messages, allowing follow-up questions. Source references link back to individual claim records for verification.",
  },

  // ProposalEngine
  {
    url: "/phase3/submissions",
    title: "Submission Queue — Triage Inbox",
    section: "ProposalEngine",
    description:
      "The triage inbox is where underwriters manage their incoming submission flow. Each submission is automatically scored by the AI appetite model and assigned a recommendation: Auto-Quote (green), Needs Review (amber), or Auto-Decline (red). The list can be sorted by score, date, or insured name. Underwriters typically work through this queue each day, quickly handling auto-recommendations and spending their time on the nuanced 'Needs Review' cases.",
  },
  {
    url: "/phase3/submissions/sub-001",
    title: "Submission Detail — Apex Plumbing (Auto-Quote)",
    section: "ProposalEngine",
    description:
      "This is the full detail view for a submission the AI recommends auto-quoting. The top section shows the insured's profile, requested coverages, and the AI's appetite score with a breakdown of contributing factors. Below, matched class codes, comparable prior accounts, and suggested pricing are displayed. The underwriter can approve the auto-quote with one click, override the recommendation, or add conditions before proceeding. This screen demonstrates how the AI accelerates straightforward submissions while keeping the underwriter in control.",
  },
  {
    url: "/phase3/submissions/sub-002",
    title: "Submission Detail — NovaTech Solutions (Needs Review)",
    section: "ProposalEngine",
    description:
      "This submission has been flagged for human review because the AI detected risk factors that fall outside automatic thresholds — in this case, a technology company with unusual product liability exposure. The screen highlights the specific concerns (e.g., 'revenue concentration in single product line,' 'limited loss history'), suggests questions the underwriter should ask the broker, and surfaces comparable past accounts for reference. This shows how the AI assists rather than replaces underwriter judgment on complex risks.",
  },
  {
    url: "/phase3/submissions/sub-010",
    title: "Submission Detail — ToxiChem Processing (Auto-Decline)",
    section: "ProposalEngine",
    description:
      "This screen shows a submission the AI has recommended declining. The risk profile includes disqualifying factors — in this case, a chemical processing operation with significant environmental exposure. The decline rationale references specific appetite guidelines and prohibited class codes. The underwriter can override the decline if warranted, but the system provides clear documentation of why the AI reached its recommendation.",
  },
  {
    url: "/phase3/workflow/sub-001",
    title: "Agentic Workflow — Apex Plumbing (Auto-Quote)",
    section: "ProposalEngine",
    description:
      "This visualization traces the AI's step-by-step decision process for evaluating the Apex Plumbing submission. Each node in the workflow represents an agent action — data extraction, class code lookup, appetite scoring, loss history analysis, pricing estimation — with intermediate results, confidence scores, and execution timing. Underwriters can inspect any step to understand why the AI reached its recommendation. This transparency view is critical for audit compliance and for building underwriter trust in AI-assisted decisions.",
  },
  {
    url: "/phase3/workflow/sub-002",
    title: "Agentic Workflow — NovaTech Solutions (Needs Review)",
    section: "ProposalEngine",
    description:
      "This workflow view shows how the AI processed a submission that was ultimately escalated to human review. The visualization highlights the exact step where the AI's confidence dropped below the auto-decision threshold — in this case, during the risk classification phase. The data the AI gathered up to that point (class code suggestions, preliminary pricing, comparable accounts) is carried forward to assist the underwriter, saving significant manual research time.",
  },
  {
    url: "/phase3/workflow/sub-010",
    title: "Agentic Workflow — ToxiChem Processing (Auto-Decline)",
    section: "ProposalEngine",
    description:
      "This workflow traces the AI's evaluation of a submission that was auto-declined. The visualization shows how the AI identified disqualifying risk factors early in the pipeline — the class code matched a prohibited list, and the environmental exposure score exceeded the maximum threshold. The short-circuit behavior demonstrates efficiency: once a hard decline trigger is hit, the AI stops further analysis and documents the reason, freeing up processing capacity for viable submissions.",
  },

  // Submissions & Proposals
  {
    url: "/submissions",
    title: "Submissions Portal — Active Submissions",
    section: "Submissions & Proposals",
    description:
      "The submissions portal is the day-to-day workspace for managing the underwriting pipeline. Active submissions are listed with their insured name, broker, line of business, status, and assigned underwriter. Filters let users narrow by status (New, In Review, Quoted, Bound) or line of business. Each row links to the full submission detail. This screen provides the 30,000-foot view of the team's current workload and pipeline health.",
  },
  // Submission Detail — all tabs
  {
    url: "/submissions/ps-001",
    title: "Submission Detail — Overview Tab",
    section: "Submissions & Proposals",
    clickTab: "overview",
    description:
      "The Overview tab is the first thing an underwriter sees when opening a submission. It presents a summary of the insured's profile — company name, line of business, broker, effective dates, and requested limits. Key metrics like estimated premium and loss ratios are surfaced at the top. This tab provides the 'at a glance' context an underwriter needs before diving into the detailed data on other tabs.",
  },
  {
    url: "/submissions/ps-001",
    title: "Submission Detail — Documents Tab",
    section: "Submissions & Proposals",
    clickTab: "documents",
    description:
      "The Documents tab organizes all files attached to the submission — applications, loss runs, supplemental questionnaires, broker correspondence, and prior policy declarations. Each document shows its type, upload date, and source. Underwriters use this tab to review the complete submission package and verify that all required materials have been received before proceeding with the quote.",
  },
  {
    url: "/submissions/ps-001",
    title: "Submission Detail — Loss Runs Tab",
    section: "Submissions & Proposals",
    clickTab: "loss-runs",
    description:
      "The Loss Runs tab presents the insured's historical loss data in a structured table. Each row represents a loss occurrence with details including date, description, incurred amount, paid amount, and open reserves. Underwriters analyze this data to assess the insured's loss experience, identify concerning patterns, and determine the appropriate experience modification factor for the rating.",
  },
  {
    url: "/submissions/ps-001",
    title: "Submission Detail — Submission Notes Tab",
    section: "Submissions & Proposals",
    clickTab: "notes",
    description:
      "The Submission Notes tab captures all internal underwriting commentary and external correspondence related to this submission. Notes are timestamped and attributed to the author. Underwriters use this tab to document their analysis, record broker conversations, flag items for follow-up, and maintain an audit trail of the decision-making process throughout the lifecycle of the submission.",
  },
  {
    url: "/submissions/ps-001",
    title: "Submission Detail — Structured Data Tab",
    section: "Submissions & Proposals",
    clickTab: "structured",
    description:
      "The Structured Data tab displays key-value pairs extracted from the submission documents by the AI. Fields include insured details, coverage specifics, payroll figures, revenue, employee counts, and other underwriting-relevant data points. Each field shows its extracted value and source document. This tab accelerates data entry by pre-populating information that would otherwise require manual transcription from PDF applications.",
  },

  // Proposal Detail — all tabs
  {
    url: "/submissions/ps-001/proposals/prop-001",
    title: "Proposal Detail — Rates Tab",
    section: "Submissions & Proposals",
    clickTab: "rates",
    description:
      "The Rates tab displays the detailed premium calculation for this proposal. It includes the classification rates, exposure bases, premium at rate, schedule modifications, and the final calculated premium. For GL proposals, a specialized rating view shows class code breakdowns with per-exposure pricing. The underwriter can review the mathematical basis of the quote and verify that all rating factors have been correctly applied.",
    capturePdf: true,
  },
  {
    url: "/submissions/ps-001/proposals/prop-001",
    title: "Proposal Detail — Proposal Notes Tab",
    section: "Submissions & Proposals",
    clickTab: "notes",
    description:
      "The Proposal Notes tab captures comments and correspondence specific to this version of the proposal. Unlike submission-level notes, these are scoped to the proposal itself — documenting pricing rationale, approval conditions, broker feedback on terms, and any negotiation history. This audit trail is valuable when reviewing how a proposal evolved across versions or when a different underwriter picks up the account.",
  },
  {
    url: "/submissions/ps-001/proposals/prop-001",
    title: "Proposal Detail — Forms Tab",
    section: "Submissions & Proposals",
    clickTab: "forms",
    description:
      "The Forms tab lists all policy forms and endorsements included in this proposal. Each entry shows the form number, title, edition date, and whether it is mandatory or optional. The underwriter uses this tab to review and customize the forms package — adding manuscript endorsements, removing inapplicable forms, or substituting alternative editions. This forms schedule is also included in the exported Proposal PDF sent to the broker.",
  },
  {
    url: "/submissions/proposals",
    title: "Proposals Overview — All Proposals",
    section: "Submissions & Proposals",
    description:
      "This cross-submission view aggregates all proposals in the system into a single list. Columns show the associated submission, insured name, proposal version, total premium, status, and last updated date. Underwriters and managers use this view to track which proposals are awaiting approval, identify stale proposals nearing expiration, and compare pricing trends across the book. Sorting and filtering make it easy to find specific proposals or prioritize action items.",
  },

  // GL Rating
  {
    url: "/rating/primary-gl-rater",
    title: "Primary GL Rater — Exposure Rating",
    section: "GL Rating",
    description:
      "The GL Rater is the core premium calculation tool. The Exposure Rating tab — shown here — is where underwriters enter the key rating inputs: product line, territory, class codes, exposure amounts, limits, and deductibles. The interface dynamically adapts based on the selected product line (Contractors, General Liability, Products Liability), showing or hiding fields as appropriate. After entering all inputs, the system calculates the technical premium in real time. Additional tabs provide experience rating and underwriting notes.",
    injectTestData: true,
  },
  {
    url: "/rating/history",
    title: "Rating History — Saved Quotes",
    section: "GL Rating",
    description:
      "The rating history screen shows all previously saved quote calculations. Each entry displays the insured name, product line, territory, technical premium, and status (draft, calculated, approved). Users can click any quote to reload it into the rater for review or modification, or select multiple quotes for side-by-side comparison. This page serves as the underwriter's quote library — a record of all rating work performed.",
  },
  {
    url: "/rating/compare",
    title: "Rating Comparison — Side by Side",
    section: "GL Rating",
    description:
      "The comparison view places two or more saved quotes side by side, highlighting differences in inputs and outputs. This is used when the underwriter has run multiple pricing scenarios (e.g., different limits, territories, or class code combinations) and needs to evaluate the options. Differences are color-coded for quick identification. Managers also use this screen to review how a quote has changed between versions during the approval process.",
  },
  {
    url: "/rating/approvals",
    title: "Rating Approvals — Pending Reviews",
    section: "GL Rating",
    description:
      "The approvals queue lists all rating calculations that require supervisory sign-off before they can be bound. Each item shows the reason it was flagged — exceeding the underwriter's binding authority, schedule modifications outside guidelines, or premium below minimum thresholds. Approvers can review the full quote, add comments, and either approve or return the rating for revision. This workflow enforces pricing discipline and authority controls.",
  },
];

// ── Screenshot capture ───────────────────────────────────────────────────

async function captureScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  // Set up download behavior for PDF capture
  const client = await page.createCDPSession();
  await client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: PDF_DIR,
  });

  const screenshots = [];
  let testDataInjected = false;

  for (let i = 0; i < PAGES.length; i++) {
    const { url, title, section, description, injectTestData, capturePdf, clickTab } = PAGES[i];
    const filename = `screenshot-${String(i + 1).padStart(2, "0")}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    // Inject GL rater test data before the first rating page
    if (injectTestData && !testDataInjected) {
      console.log("  [*] Injecting GL rater test data into localStorage...");
      await page.goto(`${BASE}/`, { waitUntil: "networkidle0", timeout: 15000 });
      await page.evaluate((quotes) => {
        localStorage.setItem("gl_rater_quotes", JSON.stringify(quotes));
      }, GL_RATER_TEST_QUOTES);
      testDataInjected = true;
      console.log("  [*] Test data injected.");
    }

    console.log(`[${i + 1}/${PAGES.length}] Capturing: ${title}`);
    try {
      await page.goto(`${BASE}${url}`, {
        waitUntil: "networkidle0",
        timeout: 20000,
      });
      await new Promise((r) => setTimeout(r, 1500));

      // Click a specific tab if requested — use Puppeteer's native click for React/Radix compat
      if (clickTab) {
        const tabLabels = {
          overview: "Overview",
          documents: "Documents",
          "loss-runs": "Loss Runs",
          notes: "Notes",
          structured: "Structured",
          rates: "Rates",
          forms: "Forms",
        };
        const label = tabLabels[clickTab] || clickTab;
        let tabClicked = false;

        // Find all tab buttons and click the one matching our label
        const tabButtons = await page.$$('[role="tab"]');
        for (const btn of tabButtons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text && text.includes(label)) {
            await btn.click();
            tabClicked = true;
            break;
          }
        }

        if (tabClicked) {
          console.log(`  [*] Clicked tab: ${clickTab} ("${label}")`);
          await new Promise((r) => setTimeout(r, 1500));
        } else {
          console.log(`  [!] Could not find tab: ${clickTab} — available tabs:`);
          for (const btn of tabButtons) {
            const text = await page.evaluate((el) => el.textContent, btn);
            console.log(`      - "${text}"`);
          }
        }
      }

      await page.screenshot({ path: filepath, fullPage: true });
      screenshots.push({ filepath, title, section, filename, description });
      console.log(`  -> Saved: ${filename}`);

      // Capture proposal PDF if flagged
      if (capturePdf) {
        console.log("  [*] Triggering PDF export...");
        try {
          // Find and click the Export Proposal PDF button
          const downloadBtn = await page.$('button:has(svg)');
          const buttons = await page.$$("button");
          for (const btn of buttons) {
            const text = await page.evaluate((el) => el.textContent, btn);
            if (text && text.includes("Export Proposal PDF")) {
              await btn.click();
              console.log("  [*] Clicked Export Proposal PDF button");
              break;
            }
          }
          // Wait for download
          await new Promise((r) => setTimeout(r, 3000));

          // Find downloaded PDF
          const pdfFiles = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));
          if (pdfFiles.length > 0) {
            const pdfPath = path.join(PDF_DIR, pdfFiles[0]);
            console.log(`  [*] PDF downloaded: ${pdfFiles[0]}`);

            // Try to convert PDF pages to images using macOS qlmanage
            const pdfImages = await convertPdfToImages(pdfPath, browser);
            for (let pi = 0; pi < pdfImages.length; pi++) {
              screenshots.push({
                filepath: pdfImages[pi],
                title: `Proposal PDF Export — Page ${pi + 1}`,
                section: "PDF Export Preview",
                filename: path.basename(pdfImages[pi]),
                description:
                  pi === 0
                    ? "The platform generates professional, branded PDF proposals ready to send to brokers. This multi-page document includes a quote summary with broker and insured details, policy terms, premium breakdown, coverage specifications, TRIA disclosures, excess liability indications, and a full forms and endorsements schedule. The PDF is generated client-side using jsPDF and downloads instantly — no server round-trip required."
                    : null,
              });
            }

            // Also copy PDF to output directory
            const outputPdfPath = path.join(process.cwd(), "..", pdfFiles[0]);
            fs.copyFileSync(pdfPath, outputPdfPath);
            console.log(`  [*] PDF also saved to: ${outputPdfPath}`);
          }
        } catch (pdfErr) {
          console.error(`  [*] PDF capture error: ${pdfErr.message}`);
        }
      }
    } catch (err) {
      console.error(`  -> ERROR on ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nCaptured ${screenshots.length} items total.`);
  return screenshots;
}

// Convert PDF to images using Puppeteer (open PDF in Chrome)
async function convertPdfToImages(pdfPath, browser) {
  const images = [];

  try {
    // Method 1: Use macOS qlmanage for a high-quality thumbnail
    const qlOutput = path.join(PDF_DIR, "ql-preview");
    if (!fs.existsSync(qlOutput)) fs.mkdirSync(qlOutput, { recursive: true });

    try {
      execSync(`qlmanage -t -s 1440 -o "${qlOutput}" "${pdfPath}" 2>/dev/null`, { timeout: 10000 });
      // qlmanage creates a file like filename.pdf.png
      const qlFiles = fs.readdirSync(qlOutput).filter((f) => f.endsWith(".png"));
      if (qlFiles.length > 0) {
        const qlImage = path.join(qlOutput, qlFiles[0]);
        const destPath = path.join(SCREENSHOT_DIR, "pdf-preview-cover.png");
        fs.copyFileSync(qlImage, destPath);
        images.push(destPath);
        console.log("  [*] PDF cover page captured via qlmanage");
      }
    } catch {
      console.log("  [*] qlmanage not available, trying Puppeteer PDF viewer...");
    }

    // Method 2: Open PDF in Chrome and take a screenshot of each visible page
    if (images.length === 0) {
      const pdfPage = await browser.newPage();
      await pdfPage.setViewport({ width: 1000, height: 1400 });
      await pdfPage.goto(`file://${pdfPath}`, { waitUntil: "networkidle0", timeout: 15000 });
      await new Promise((r) => setTimeout(r, 2000));
      const pdfScreenPath = path.join(SCREENSHOT_DIR, "pdf-preview-cover.png");
      await pdfPage.screenshot({ path: pdfScreenPath, fullPage: false });
      images.push(pdfScreenPath);
      await pdfPage.close();
      console.log("  [*] PDF preview captured via Chrome PDF viewer");
    }

    // Also try to get additional pages via Chrome PDF viewer (scroll)
    if (images.length === 1) {
      try {
        const pdfPage = await browser.newPage();
        await pdfPage.setViewport({ width: 1000, height: 1400 });
        await pdfPage.goto(`file://${pdfPath}`, { waitUntil: "networkidle0", timeout: 15000 });
        await new Promise((r) => setTimeout(r, 2000));

        // Scroll to capture additional pages (pages 2-4)
        for (let pg = 2; pg <= 4; pg++) {
          await pdfPage.evaluate((n) => {
            // Chrome PDF viewer uses shadow DOM; scroll the main embed element
            const embed = document.querySelector("embed");
            if (embed) {
              window.scrollBy(0, 1300);
            } else {
              window.scrollBy(0, 1300);
            }
          }, pg);
          await new Promise((r) => setTimeout(r, 800));
          const pgPath = path.join(SCREENSHOT_DIR, `pdf-preview-page${pg}.png`);
          await pdfPage.screenshot({ path: pgPath, fullPage: false });
          images.push(pgPath);
        }
        await pdfPage.close();
        console.log(`  [*] Captured ${images.length} PDF pages total`);
      } catch {
        // Fine — we have at least the cover page
      }
    }
  } catch (err) {
    console.error(`  [*] PDF image conversion error: ${err.message}`);
  }

  return images;
}

// ── Word document generation ─────────────────────────────────────────────

async function createWordDoc(screenshots) {
  console.log("\nGenerating Word document...");

  const children = [];

  // ── Title page ──
  children.push(
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      children: [
        new TextRun({ text: "MARKEL", bold: true, size: 72, font: "Calibri", color: "B2903C" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "AI-Powered Underwriting Intelligence Platform",
          bold: true,
          size: 48,
          font: "Calibri",
          color: "333333",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 200 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Product Walkthrough & Screenshot Guide",
          size: 32,
          color: "666666",
          font: "Calibri",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 800 } }),
    // Section list
    ...[
      "Dashboard",
      "PolicyLab",
      "ProposalEngine",
      "Submissions & Proposals",
      "GL Rating",
      "PDF Export Preview",
    ].map(
      (label) =>
        new Paragraph({
          children: [new TextRun({ text: label, size: 24, color: "888888", font: "Calibri" })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 60 },
        })
    ),
    new Paragraph({ spacing: { before: 1500 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
          size: 22,
          color: "999999",
          font: "Calibri",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 100 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Confidential — For Internal Use Only",
          size: 20,
          color: "AAAAAA",
          font: "Calibri",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ── Table of contents ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Table of Contents", bold: true, size: 36, font: "Calibri", color: "333333" }),
      ],
      spacing: { after: 300 },
    })
  );

  let currentSection = "";
  let pageNum = 3; // approximate starting page
  screenshots.forEach((s, i) => {
    if (s.section !== currentSection) {
      currentSection = s.section;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: s.section, bold: true, size: 24, font: "Calibri", color: "B2903C" }),
          ],
          spacing: { before: 240 },
        })
      );
    }
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `    ${i + 1}. ${s.title}`, size: 20, font: "Calibri", color: "555555" }),
        ],
        spacing: { before: 40 },
      })
    );
  });

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ── Screenshot pages ──
  currentSection = "";
  for (const s of screenshots) {
    if (s.section !== currentSection) {
      currentSection = s.section;
      // Section divider
      children.push(
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          children: [
            new TextRun({ text: s.section, bold: true, size: 36, font: "Calibri", color: "B2903C" }),
          ],
          spacing: { after: 100 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: "B2903C", space: 4 },
          },
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    }

    // Page title
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: s.title, bold: true, size: 28, font: "Calibri", color: "333333" }),
        ],
        spacing: { before: 200, after: 120 },
      })
    );

    // Description
    if (s.description) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: s.description, size: 21, font: "Calibri", color: "555555" }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Screenshot image
    const imgBuffer = fs.readFileSync(s.filepath);
    const sizeInfo = getImageDimensions(imgBuffer);
    const maxWidth = 595; // ~6.2 inches
    const scale = Math.min(1, maxWidth / sizeInfo.width);
    const displayWidth = Math.round(sizeInfo.width * scale);
    const displayHeight = Math.round(sizeInfo.height * scale);

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: imgBuffer,
            transformation: { width: displayWidth, height: displayHeight },
            type: "png",
          }),
        ],
        spacing: { after: 100 },
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
        },
      })
    );

    // Page break
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
          },
        },
        children,
      },
    ],
  });

  const outputPath = path.join(process.cwd(), "..", "Markel_UI_Demo_Screenshots.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`\nWord document saved to: ${outputPath}`);
  return outputPath;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function getImageDimensions(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return { width: 1440, height: 900 };
}

// ── Main ─────────────────────────────────────────────────────────────────
(async () => {
  try {
    const screenshots = await captureScreenshots();
    if (screenshots.length > 0) {
      await createWordDoc(screenshots);
    } else {
      console.error("No screenshots captured!");
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();

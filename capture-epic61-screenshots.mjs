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
} from "docx";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:3001";
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots-epic61");
const PROPOSAL_URL = "/submissions/ps-001/proposals/prop-001c";

// ── Pages to capture ─────────────────────────────────────────────────────
const PAGES = [
  // 1. Full proposal page — Pricing tab (default)
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Rate & Pricing Worksheet (Top)",
    section: "Rate & Pricing Worksheet",
    description:
      "The Proposal Detail page for 'Standard GL Program Copy' (prop-001c) — an editable, human-created draft proposal for Pacific Coast Builders LLC. The header displays the proposal name, version badge (v3), status badge (draft), total premium, and action buttons (New Version, Export Proposal PDF). Below the header, a two-column layout shows the AI-generated Proposal Summary (left) with a Regenerate button, and the Proposal Notes feed (right) with an Add Note text area. The default tab 'Rate & Pricing Worksheet' is selected, showing a 2/3 + 1/3 layout. All fields are fully editable in this mode.",
  },
  // 2. GL Limits + Deductibles (scroll down on pricing tab)
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — GL Limits, Deductibles & Fees",
    section: "Rate & Pricing Worksheet",
    description:
      "Scrolled view of the Rate & Pricing Worksheet tab showing the General Liability card with commission rate input, coverage limits (checkboxes to enable/disable each coverage, editable limit amounts), terrorism coverage toggle with rate input, and the Deductibles card with editable deductible types, applies-to fields, and amount inputs. Each coverage line can be toggled on/off with a checkbox; disabled lines are dimmed. The 'Add' button on Deductibles allows adding new deductible rows. All inputs are editable because this is a human-created proposal.",
    scrollTo: "deductibles",
  },
  // 3. Fees + Exposure Details
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Fees & Exposure Details",
    section: "Rate & Pricing Worksheet",
    description:
      "Scrolled view showing the Fees card with surplus lines tax (3%), stamping fee (0.18%), policy fee ($250), and filing fee ($175 — disabled). Each fee has an enable/disable checkbox, percentage rate input, flat amount input, and a calculated column. Below is the Exposure Details card showing class codes grouped by location address (e.g., '1200 Harbor Blvd, Long Beach CA'). Each exposure row shows class code, description, territory, exposure base, exposure amount, base rate, technical rate, LCM, and adjusted premium. An 'Edit' button allows switching all fields to editable inputs. Location subtotals are shown at the bottom of each group.",
    scrollTo: "exposure",
  },
  // 4. Priced Forms + Loss Detail
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Priced Forms & Loss Detail",
    section: "Rate & Pricing Worksheet",
    description:
      "Scrolled view showing the Priced Forms card and Loss Detail card. Priced Forms displays forms that have credit/debit adjustments — each row shows the form number, edition, name, type badge (Endorsement/Exclusion), and net adjustment amount (green for credits, red for debits). Clicking a row expands to show individual adjustments with type badges and amounts, plus an 'add adjustment' row with description input, debit/credit toggle, and amount input. Below is the Loss Detail card showing the Experience Modifier input (editable number) with contextual label, followed by a loss detail table with columns for date of loss, ground-up indemnity, ground-up expense, ground-up total incurred, indemnity less deductible, includable losses, and policy period. A totals row sums all monetary columns.",
    scrollTo: "loss-detail",
  },
  // 5. Price Summary (sticky sidebar)
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Price Summary Sidebar",
    section: "Rate & Pricing Worksheet",
    description:
      "The sticky Price Summary card in the right column of the Rate & Pricing Worksheet. It provides a real-time pricing roll-up: Exposure by Location (each location's adjusted premium subtotal), Indicated Premium, Premium Buildup (form adjustments, technical premium pre/post experience modifier, minimum premium), Fees & Surcharges (fees/taxes, terrorism premium), Market Price (bold, large font), % Delta from Technical (green if below, red if above), Commission (rate and calculated amount), and summary counts (rate classes, priced forms). This card remains visible as the user scrolls the left-column worksheets.",
    scrollTo: "price-summary",
  },
  // 6. Forms tab — default view
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Forms Tab (Overview)",
    section: "Forms",
    clickTab: "Forms",
    description:
      "The Forms tab showing the full forms & endorsements schedule for the proposal. A search bar at the top allows searching the forms catalog to add new forms. The table is organized by category with collapsible category headers (e.g., 'COMMON POLICY (4)', 'GL COVERAGE (3)', 'GL ENDORSEMENTS (12)'). Each form row displays an expand chevron, form number (monospace), edition, form name, type badge (Policy=gray, Coverage=blue, Endorsement=purple, Exclusion=red, Notice=amber), net adjustment amount, form fill button (for forms with fill-in fields), and a delete button. This is an editable proposal, so the search bar and delete buttons are visible.",
  },
  // 7. Forms tab — expanded with credits/debits
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Forms Tab with Credits/Debits Expanded",
    section: "Forms",
    clickTab: "Forms",
    expandForms: true,
    description:
      "The Forms tab with several form rows expanded to show their credit/debit adjustment details. When a form row is clicked, it expands to reveal existing adjustments — each adjustment shows a description, type badge (debit in red, credit in green), and the dollar amount with +/- prefix. Below the existing adjustments is an 'add adjustment' row with a description text input, a clickable debit/credit toggle badge, an amount input, and a Plus button to add. The net adjustment column on each form row shows the sum: green for net credits (reducing premium), red for net debits (increasing premium). Forms without adjustments show '—' in the Adj. column.",
  },
  // 8. Forms tab — form fill data
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Forms Tab with Form Fill-in Data",
    section: "Forms",
    clickTab: "Forms",
    expandFillIns: true,
    description:
      "The Forms tab showing the Form Fill feature. Some endorsement forms have fill-in fields (e.g., minimum earned premium percentage, retained premium percentage, designated work exclusions). When the Form Fill button (ClipboardEdit icon) is clicked, indigo-highlighted rows appear below the form showing each fill-in field with its label and an editable input. Percentage fields use number inputs (0-100) with a '%' suffix. In read-only mode (AI proposals), these would display as static text instead of inputs. The Form Fill button is only shown for forms that have fill-in fields defined.",
  },
  // 9. Location Schedule tab
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Proposal Location Schedule",
    section: "Proposal Location Schedule",
    clickTab: "Proposal Location",
    description:
      "The Proposal Location Schedule tab showing all locations associated with this proposal. The table displays row number, full address (bold), type badge (Primary/Branch), description, reportable badge (green 'Yes' or zinc 'No'), effective start date, effective end date, and a delete (Trash) button. An 'Add Location' button at the top-right opens an inline form for adding new locations. A footer note explains: 'Adding a location adds it to both this proposal and the submission schedule. Removing only removes it from this proposal.' Locations are derived from the submission's location schedule but can diverge independently.",
  },
  // 10. Location Schedule — Add Location form expanded
  {
    url: PROPOSAL_URL,
    title: "Proposal Detail — Add Location Form",
    section: "Proposal Location Schedule",
    clickTab: "Proposal Location",
    expandAddLocation: true,
    description:
      "The Proposal Location Schedule tab with the 'Add Location' form expanded. The form shows input fields for: Address (required, text input with placeholder '123 Main St, City, ST 00000'), Type (text input with placeholder 'Primary, Branch, Warehouse...'), Description (free text), Reportable (checkbox, default checked), Effective Start (date input), and Effective End (date input). The 'Add to Schedule' button is disabled until the address field is filled. A 'Cancel' button closes the form. New locations are added to both the proposal and submission location schedules.",
  },
];

// ── Screenshot capture ───────────────────────────────────────────────────

async function captureScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  const screenshots = [];

  for (let i = 0; i < PAGES.length; i++) {
    const { url, title, section, description, clickTab, scrollTo, expandForms, expandFillIns, expandAddLocation } = PAGES[i];
    const filename = `epic61-${String(i + 1).padStart(2, "0")}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    console.log(`[${i + 1}/${PAGES.length}] Capturing: ${title}`);
    try {
      await page.goto(`${BASE}${url}`, {
        waitUntil: "networkidle0",
        timeout: 20000,
      });
      await new Promise((r) => setTimeout(r, 1500));

      // Click a specific tab if requested
      if (clickTab) {
        let tabClicked = false;
        const tabButtons = await page.$$('[role="tab"]');
        for (const btn of tabButtons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text && text.includes(clickTab)) {
            await btn.click();
            tabClicked = true;
            break;
          }
        }
        if (tabClicked) {
          console.log(`  [*] Clicked tab containing: "${clickTab}"`);
          await new Promise((r) => setTimeout(r, 1500));
        } else {
          console.log(`  [!] Could not find tab containing: "${clickTab}"`);
          const tabButtons2 = await page.$$('[role="tab"]');
          for (const btn of tabButtons2) {
            const text = await page.evaluate((el) => el.textContent, btn);
            console.log(`      - "${text}"`);
          }
        }
      }

      // Expand form rows to show credits/debits
      if (expandForms) {
        console.log("  [*] Expanding form rows to show adjustments...");
        // Click on form rows that have adjustments (look for rows with colored adj amounts)
        const rows = await page.$$('table tbody tr.cursor-pointer');
        let expandCount = 0;
        for (const row of rows) {
          // Check if this row has a non-dash adjustment value
          const adjText = await page.evaluate((el) => {
            const cells = el.querySelectorAll('td');
            if (cells.length >= 6) {
              const adjCell = cells[5]; // Adj. (Net) column
              const span = adjCell.querySelector('span');
              if (span && (span.classList.contains('text-red-600') || span.classList.contains('text-green-600'))) {
                return span.textContent;
              }
            }
            return null;
          }, row);
          if (adjText && expandCount < 4) {
            await row.click();
            expandCount++;
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        console.log(`  [*] Expanded ${expandCount} form rows`);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Expand form fill-in buttons
      if (expandFillIns) {
        console.log("  [*] Expanding form fill-in fields...");
        // Find and click Form Fill buttons
        const fillButtons = await page.$$('button');
        let fillCount = 0;
        for (const btn of fillButtons) {
          const hasClipboard = await page.evaluate((el) => {
            return el.querySelector('svg') !== null && el.textContent === '' && el.closest('td');
          }, btn);
          // Look for buttons with the ClipboardEdit class pattern
          const btnClasses = await page.evaluate((el) => el.className, btn);
          if (btnClasses.includes('gap-1') && btnClasses.includes('text-xs') && fillCount < 3) {
            await btn.click();
            fillCount++;
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        console.log(`  [*] Expanded ${fillCount} fill-in sections`);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Expand Add Location form
      if (expandAddLocation) {
        console.log("  [*] Expanding Add Location form...");
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const text = await page.evaluate((el) => el.textContent, btn);
          if (text && text.includes("Add Location")) {
            await btn.click();
            console.log("  [*] Clicked 'Add Location' button");
            await new Promise((r) => setTimeout(r, 800));
            break;
          }
        }
      }

      // Scroll to specific sections using text search across all elements
      if (scrollTo) {
        const scrollTargets = {
          "deductibles": { text: "Deductibles", offset: -200 },
          "exposure": { text: "Fees", offset: -80 },
          "loss-detail": { text: "Priced Forms", offset: -80 },
          "price-summary": { text: "Price Summary", offset: -80 },
        };
        const target = scrollTargets[scrollTo];
        if (target) {
          const scrolled = await page.evaluate((searchText, scrollOffset) => {
            // Search all elements for the target text
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              // Only check direct text content (not children)
              const directText = Array.from(el.childNodes)
                .filter(n => n.nodeType === Node.TEXT_NODE)
                .map(n => n.textContent.trim())
                .join('');
              if (directText.includes(searchText) && el.offsetHeight > 0) {
                const rect = el.getBoundingClientRect();
                window.scrollTo(0, window.scrollY + rect.top + scrollOffset);
                return true;
              }
            }
            // Fallback: check textContent
            for (const el of allElements) {
              if (el.textContent && el.textContent.trim().startsWith(searchText) && el.children.length <= 2 && el.offsetHeight > 0) {
                const rect = el.getBoundingClientRect();
                window.scrollTo(0, window.scrollY + rect.top + scrollOffset);
                return true;
              }
            }
            return false;
          }, target.text, target.offset);
          console.log(`  [*] Scroll to "${scrollTo}": ${scrolled ? "success" : "failed"}`);
          await new Promise((r) => setTimeout(r, 500));
        }
      }

      await page.screenshot({ path: filepath, fullPage: scrollTo ? false : true });
      screenshots.push({ filepath, title, section, filename, description });
      console.log(`  -> Saved: ${filename}`);
    } catch (err) {
      console.error(`  -> ERROR on ${url}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`\nCaptured ${screenshots.length} items total.`);
  return screenshots;
}

// ── Word document generation ─────────────────────────────────────────────

function getImageDimensions(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return { width: 1440, height: 900 };
}

async function createWordDoc(screenshots) {
  console.log("\nGenerating Word document...");

  const children = [];

  // ── Title page ──
  children.push(
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      children: [
        new TextRun({ text: "P&C COMMERCIAL", bold: true, size: 72, font: "Calibri", color: "B2903C" }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Epic 61: Proposal Detail Interface",
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
          text: "Screenshot Documentation & Feature Guide",
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
      "Rate & Pricing Worksheet",
      "Forms (with Credits/Debits & Form Fill-ins)",
      "Proposal Location Schedule",
    ].map(
      (label) =>
        new Paragraph({
          children: [new TextRun({ text: label, size: 24, color: "888888", font: "Calibri" })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 60 },
        })
    ),
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Editable vs Read-Only Modes Documented",
          size: 24,
          color: "B2903C",
          font: "Calibri",
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ spacing: { before: 1200 } }),
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

  // ── Read-only vs Editable summary page ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Read-Only vs Editable Modes", bold: true, size: 36, font: "Calibri", color: "333333" }),
      ],
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "The Proposal Detail page operates in two modes depending on how the proposal was created:",
          size: 22,
          font: "Calibri",
          color: "555555",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Editable Mode", bold: true, size: 24, font: "Calibri", color: "B2903C" }),
        new TextRun({
          text: " — Human-created proposals (default). All fields, limits, rates, forms, and locations can be modified. Search bars, add/remove buttons, and input fields are all visible and functional. The screenshots in this document show this mode.",
          size: 22,
          font: "Calibri",
          color: "555555",
        }),
      ],
      spacing: { after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Read-Only Mode", bold: true, size: 24, font: "Calibri", color: "B2903C" }),
        new TextRun({
          text: " — AI-generated proposals (aiGenerated: true). A violet banner with Bot and Lock icons indicates immutability. All input fields render as static text, all add/remove/edit controls are hidden, and all checkboxes are disabled. Users must copy the proposal to create an editable version.",
          size: 22,
          font: "Calibri",
          color: "555555",
        }),
      ],
      spacing: { after: 150 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Key differences in read-only mode:",
          bold: true,
          size: 22,
          font: "Calibri",
          color: "333333",
        }),
      ],
      spacing: { before: 200, after: 100 },
    }),
    ...[
      "Coverage limit inputs become static currency text",
      "Commission and terrorism rate inputs become static percentage text",
      "Deductible type/applies-to/amount inputs become static text; Add/Delete buttons hidden",
      "Fee rate %/flat amount inputs become static text; Add button hidden",
      "Exposure Edit button is hidden entirely",
      "Forms search bar and delete buttons are hidden",
      "Form adjustment add/remove rows are hidden",
      "Form fill-in fields display as static text instead of inputs",
      "Priced Forms search/add/remove controls are hidden",
      "'Copy to Edit' button replaces 'New Version'; Approve/Decline buttons hidden",
    ].map(
      (item) =>
        new Paragraph({
          children: [
            new TextRun({ text: `  \u2022  ${item}`, size: 20, font: "Calibri", color: "555555" }),
          ],
          spacing: { before: 40 },
        })
    ),
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

  const outputPath = path.join(process.cwd(), "docs", "epic_61_Proposal_interface.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`\nWord document saved to: ${outputPath}`);
  return outputPath;
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

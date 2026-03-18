import type { MockClaim, ClaimSearchResult } from "./types";
import { FORMS_CATALOG } from "./mock-data/forms-catalog";

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "because", "but", "and", "or", "if", "while", "about", "up", "it",
  "its", "that", "this", "what", "which", "who", "whom", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
  "she", "her", "they", "them", "their", "show", "find", "get", "tell",
  "give", "list", "search", "look", "see", "any", "related", "involving",
  "involve", "associated", "match", "matching", "claims", "claim",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

function extractSnippet(
  text: string,
  matchedToken: string,
  maxLength = 120
): { snippet: string; highlightStart: number; highlightEnd: number } {
  const lowerText = text.toLowerCase();
  const idx = lowerText.indexOf(matchedToken.toLowerCase());
  if (idx === -1) {
    const snippet = text.slice(0, maxLength) + (text.length > maxLength ? "..." : "");
    return { snippet, highlightStart: 0, highlightEnd: 0 };
  }

  const contextBefore = 40;
  const start = Math.max(0, idx - contextBefore);
  const end = Math.min(text.length, start + maxLength);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";

  const offset = start > 0 ? 3 : 0;
  const highlightStart = idx - start + offset;
  const highlightEnd = highlightStart + matchedToken.length;

  return { snippet, highlightStart, highlightEnd };
}

function scoreField(
  fieldText: string,
  tokens: string[],
  weight: number
): { score: number; bestToken: string } {
  const lower = fieldText.toLowerCase();
  let score = 0;
  let bestToken = "";
  let bestCount = 0;

  for (const token of tokens) {
    const regex = new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = lower.match(regex);
    if (matches) {
      score += matches.length * weight;
      if (matches.length > bestCount) {
        bestCount = matches.length;
        bestToken = token;
      }
    }
  }

  return { score, bestToken };
}

// Parse amount filters like "over $100,000" or "above 50000" or "greater than $200k"
function parseAmountFilter(query: string): { operator: "gt" | "lt"; amount: number } | null {
  const match = query.match(
    /(?:over|above|greater than|more than|exceeding|exceed)\s+\$?([\d,]+k?)/i
  );
  if (match) {
    let amount = parseFloat(match[1].replace(/,/g, ""));
    if (match[1].toLowerCase().endsWith("k")) amount *= 1000;
    return { operator: "gt", amount };
  }
  const matchLt = query.match(
    /(?:under|below|less than|fewer than)\s+\$?([\d,]+k?)/i
  );
  if (matchLt) {
    let amount = parseFloat(matchLt[1].replace(/,/g, ""));
    if (matchLt[1].toLowerCase().endsWith("k")) amount *= 1000;
    return { operator: "lt", amount };
  }
  return null;
}

// Parse status filter
function parseStatusFilter(query: string): string | null {
  const lower = query.toLowerCase();
  if (lower.includes("open")) return "open";
  if (lower.includes("closed")) return "closed";
  if (lower.includes("litigation")) return "litigation";
  if (lower.includes("reserved")) return "reserved";
  return null;
}

// Parse year filter
function parseYearFilter(query: string): number | null {
  const match = query.match(/\b(20\d{2})\b/);
  return match ? parseInt(match[1]) : null;
}

export function searchClaims(
  query: string,
  claims: MockClaim[]
): ClaimSearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const amountFilter = parseAmountFilter(query);
  const statusFilter = parseStatusFilter(query);
  const yearFilter = parseYearFilter(query);

  const results: ClaimSearchResult[] = [];

  for (const claim of claims) {
    // Apply filters
    if (amountFilter) {
      const val = Math.max(claim.amount, claim.reserveAmount);
      if (amountFilter.operator === "gt" && val <= amountFilter.amount) continue;
      if (amountFilter.operator === "lt" && val >= amountFilter.amount) continue;
    }
    if (statusFilter && claim.status !== statusFilter) continue;
    if (yearFilter) {
      const lossYear = new Date(claim.dateOfLoss).getFullYear();
      if (lossYear !== yearFilter) continue;
    }

    // Score across fields
    const descScore = scoreField(claim.description, tokens, 1.0);
    const notesText = claim.notes.join(" ");
    const notesScore = scoreField(notesText, tokens, 0.8);
    const docsText = claim.documents.map((d) => d.text).join(" ");
    const docsScore = scoreField(docsText, tokens, 0.6);
    const metaText = `${claim.claimantName} ${claim.insuredName} ${claim.category.replace(/_/g, " ")} ${claim.state}`;
    const metaScore = scoreField(metaText, tokens, 0.5);

    const totalScore = descScore.score + notesScore.score + docsScore.score + metaScore.score;
    if (totalScore < 0.1) continue;

    // Normalize score (rough cap at 10)
    const normalizedScore = Math.min(1, totalScore / (tokens.length * 3));

    // Find best snippet
    let matchedField = "description";
    let bestToken = descScore.bestToken;
    let snippetSource = claim.description;

    if (notesScore.score > descScore.score) {
      matchedField = "notes";
      bestToken = notesScore.bestToken;
      snippetSource = notesText;
    }
    if (docsScore.score > Math.max(descScore.score, notesScore.score)) {
      matchedField = "documents";
      bestToken = docsScore.bestToken;
      snippetSource = docsText;
    }

    if (!bestToken && tokens.length > 0) {
      bestToken = tokens[0];
    }

    const { snippet, highlightStart, highlightEnd } = extractSnippet(
      snippetSource,
      bestToken
    );

    results.push({
      claim,
      relevanceScore: normalizedScore,
      matchedSnippet: snippet,
      matchedField,
      highlightStart,
      highlightEnd,
    });
  }

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
}

export function searchClaimsByForm(
  formNumber: string,
  claims: MockClaim[]
): ClaimSearchResult[] {
  const results: ClaimSearchResult[] = [];
  const normalizedForm = formNumber.trim().toUpperCase();

  // Also find the form name for fuzzy matching
  const formEntry = FORMS_CATALOG.find(
    (f) => f.formNumber.toUpperCase() === normalizedForm
  );
  const formNameTokens = formEntry ? tokenize(formEntry.formName) : [];

  for (const claim of claims) {
    const hasDirectMatch = claim.associatedFormNumbers.some(
      (f) => f.toUpperCase() === normalizedForm
    );

    let fuzzyScore = 0;
    if (!hasDirectMatch && formNameTokens.length > 0) {
      const allText = [
        claim.description,
        ...claim.notes,
        ...claim.documents.map((d) => d.text),
      ].join(" ");
      const { score } = scoreField(allText, formNameTokens, 0.3);
      fuzzyScore = score;
    }

    if (!hasDirectMatch && fuzzyScore < 0.5) continue;

    const relevanceScore = hasDirectMatch ? 0.95 : Math.min(0.7, fuzzyScore / (formNameTokens.length * 2));

    const snippetText = hasDirectMatch
      ? `Claim is directly associated with form ${formNumber}.`
      : claim.description;

    results.push({
      claim,
      relevanceScore,
      matchedSnippet: snippetText,
      matchedField: hasDirectMatch ? "associatedFormNumbers" : "description",
      highlightStart: 0,
      highlightEnd: 0,
    });
  }

  return results
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);
}

const CATEGORY_LABELS: Record<string, string> = {
  bodily_injury: "Bodily Injury",
  property_damage: "Property Damage",
  products_liability: "Products Liability",
  completed_operations: "Completed Operations",
  personal_injury: "Personal Injury",
  advertising_injury: "Advertising Injury",
};

export function generateAISummary(
  query: string,
  results: ClaimSearchResult[]
): string {
  if (results.length === 0) {
    return `I wasn't able to find any claims matching "${query}". Try broadening your search terms or checking for different keywords.`;
  }

  const totalAmount = results.reduce((sum, r) => sum + r.claim.amount, 0);
  const totalReserves = results.reduce((sum, r) => sum + r.claim.reserveAmount, 0);

  // Category breakdown
  const categories: Record<string, number> = {};
  for (const r of results) {
    const label = CATEGORY_LABELS[r.claim.category] || r.claim.category;
    categories[label] = (categories[label] || 0) + 1;
  }
  const categoryBreakdown = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${cat} (${count})`)
    .join(", ");

  // Status breakdown
  const statuses: Record<string, number> = {};
  for (const r of results) {
    statuses[r.claim.status] = (statuses[r.claim.status] || 0) + 1;
  }
  const statusBreakdown = Object.entries(statuses)
    .map(([s, count]) => `${count} ${s}`)
    .join(", ");

  const topClaim = results[0];
  const topClaimAmount = topClaim.claim.amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const formattedTotal = totalAmount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const formattedReserves = totalReserves.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  let summary = `Found **${results.length} claim${results.length !== 1 ? "s" : ""}** matching your search.\n\n`;
  summary += `**Categories:** ${categoryBreakdown}\n`;
  summary += `**Status:** ${statusBreakdown}\n`;
  summary += `**Total incurred:** ${formattedTotal} | **Total reserves:** ${formattedReserves}\n\n`;
  summary += `The highest-relevance result is **${topClaim.claim.claimNumber}** (${topClaim.claim.insuredName}) at ${topClaimAmount}.`;

  return summary;
}

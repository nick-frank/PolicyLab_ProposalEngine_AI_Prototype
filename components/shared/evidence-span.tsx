"use client";
import type { EvidenceSpan as EvidenceSpanType } from "@/lib/types";
import { EvidenceCitation } from "./evidence-citation";

export function EvidenceSpan({ span, highlightColor = "bg-yellow-100" }: {
  span: EvidenceSpanType; highlightColor?: string;
}) {
  const before = span.fullText.slice(0, span.highlightStart);
  const highlight = span.fullText.slice(span.highlightStart, span.highlightEnd);
  const after = span.fullText.slice(span.highlightEnd);

  return (
    <div className="rounded-md border-l-4 border-amber-400 bg-muted/20 p-3 space-y-2">
      <p className="text-sm leading-relaxed font-serif">
        {before}
        <mark className={`${highlightColor} px-0.5 rounded`}>{highlight}</mark>
        {after}
      </p>
      <EvidenceCitation provenance={span.provenance} variant="inline" />
    </div>
  );
}

"use client";
import type { Provenance } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function confidenceColor(c: number) {
  if (c < 0.5) return "text-red-600";
  if (c < 0.8) return "text-amber-600";
  return "text-green-600";
}

export function EvidenceCitation({ provenance, variant = "inline" }: {
  provenance: Provenance; variant?: "inline" | "block";
}) {
  if (variant === "inline") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded cursor-help">
            [{provenance.documentName}, p.{provenance.pageNumber},{" "}
            <span className={confidenceColor(provenance.extractionConfidence)}>
              {Math.round(provenance.extractionConfidence * 100)}%
            </span>
            ]
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1 text-xs">
            <div><span className="font-medium">Document:</span> {provenance.documentName}</div>
            <div><span className="font-medium">Page:</span> {provenance.pageNumber}</div>
            {provenance.clauseId && <div><span className="font-medium">Clause ID:</span> {provenance.clauseId}</div>}
            <div><span className="font-medium">Model:</span> {provenance.modelVersion}</div>
            <div><span className="font-medium">Extracted:</span> {provenance.extractionTimestamp}</div>
            <div><span className="font-medium">Confidence:</span> {Math.round(provenance.extractionConfidence * 100)}%</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="font-medium">{provenance.documentName}</span>
        <span className={cn("font-semibold", confidenceColor(provenance.extractionConfidence))}>
          {Math.round(provenance.extractionConfidence * 100)}%
        </span>
      </div>
      <div className="text-muted-foreground">
        Page {provenance.pageNumber}
        {provenance.clauseId && ` · Clause ${provenance.clauseId}`}
      </div>
      <div className="text-muted-foreground">
        {provenance.modelVersion} · {provenance.extractionTimestamp}
      </div>
    </div>
  );
}

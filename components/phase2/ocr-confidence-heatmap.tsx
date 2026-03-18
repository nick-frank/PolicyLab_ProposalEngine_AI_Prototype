"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function getColor(confidence: number) {
  if (confidence >= 0.95) return "bg-green-500";
  if (confidence >= 0.90) return "bg-green-400";
  if (confidence >= 0.85) return "bg-yellow-400";
  if (confidence >= 0.75) return "bg-amber-500";
  if (confidence >= 0.60) return "bg-orange-500";
  return "bg-red-500";
}

export function OcrConfidenceHeatmap({
  pageConfidences,
}: {
  pageConfidences: { page: number; confidence: number }[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {pageConfidences.map((pc) => (
          <Tooltip key={pc.page}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-6 w-6 rounded-sm cursor-help flex items-center justify-center text-[9px] font-medium text-white",
                  getColor(pc.confidence)
                )}
              >
                {pc.page}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Page {pc.page}: {Math.round(pc.confidence * 100)}% confidence
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> High (&gt;95%)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-yellow-400" /> Medium (85-95%)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Low (&lt;60%)
        </span>
      </div>
    </div>
  );
}

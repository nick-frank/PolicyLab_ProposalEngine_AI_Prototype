"use client";
import { ConfidenceScore } from "./confidence-score";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

export function ConfidenceAbstain({ score, abstained, threshold = 0.4 }: {
  score: number; abstained: boolean; threshold?: number;
}) {
  if (abstained) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Model Abstained
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Confidence ({Math.round(score * 100)}%) was below the {Math.round(threshold * 100)}% threshold. The model chose not to score this item.
        </TooltipContent>
      </Tooltip>
    );
  }
  return <ConfidenceScore score={score} showBar showLabel />;
}

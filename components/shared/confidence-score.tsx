"use client";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function getColor(score: number) {
  if (score < 0.5) return "text-red-600";
  if (score < 0.8) return "text-amber-600";
  return "text-green-600";
}

function getBarColor(score: number) {
  if (score < 0.5) return "[&>div]:bg-red-500";
  if (score < 0.8) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-green-500";
}

export function ConfidenceScore({ score, showBar = false, showLabel = false, size = "default" }: {
  score: number; showBar?: boolean; showLabel?: boolean; size?: "sm" | "default";
}) {
  const pct = Math.round(score * 100);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-2", size === "sm" && "text-xs")}>
          {showLabel && <span className="text-muted-foreground">Confidence</span>}
          <span className={cn("font-semibold", getColor(score))}>{pct}%</span>
          {showBar && <Progress value={pct} className={cn("w-16 h-1.5", getBarColor(score))} />}
        </span>
      </TooltipTrigger>
      <TooltipContent>Raw score: {score.toFixed(4)}</TooltipContent>
    </Tooltip>
  );
}

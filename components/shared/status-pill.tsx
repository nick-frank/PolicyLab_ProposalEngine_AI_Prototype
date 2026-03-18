"use client";
import { cn } from "@/lib/utils";
import { TRIAGE_BUCKET_CONFIG } from "@/lib/constants";
import type { TriageBucket } from "@/lib/types";
import { XCircle, AlertTriangle, CheckCircle } from "lucide-react";

const iconMap = { auto_decline: XCircle, needs_review: AlertTriangle, auto_quote: CheckCircle };

export function StatusPill({ bucket, showConfidence = false, confidence }: {
  bucket: TriageBucket; showConfidence?: boolean; confidence?: number;
}) {
  const config = TRIAGE_BUCKET_CONFIG[bucket];
  const Icon = iconMap[bucket];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", config.bgClass, config.textClass)}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
      {showConfidence && confidence !== undefined && (
        <span className="ml-1 opacity-80">{Math.round(confidence * 100)}%</span>
      )}
    </span>
  );
}

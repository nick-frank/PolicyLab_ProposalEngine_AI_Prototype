"use client";

import { useState } from "react";
import { TRIAGE_BUCKET_CONFIG } from "@/lib/constants";
import type { TriageBucket } from "@/lib/types";
import { ChevronDown, ChevronRight, XCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const iconMap: Record<TriageBucket, typeof XCircle> = {
  auto_decline: XCircle,
  needs_review: AlertTriangle,
  auto_quote: CheckCircle,
};

export function TriageBucketHeader({
  bucket,
  count,
  avgConfidence,
  defaultOpen = true,
  children,
}: {
  bucket: TriageBucket;
  count: number;
  avgConfidence: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const config = TRIAGE_BUCKET_CONFIG[bucket];
  const Icon = iconMap[bucket];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className={cn("flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-colors", config.bgClass)}>
          <Icon className={cn("h-5 w-5", config.textClass)} />
          <span className={cn("text-sm font-semibold", config.textClass)}>
            {config.label}
          </span>
          <span className={cn("text-sm", config.textClass)}>
            ({count})
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            Avg Confidence: {Math.round(avgConfidence * 100)}%
          </span>
          <div className="ml-auto">
            {open ? (
              <ChevronDown className={cn("h-4 w-4", config.textClass)} />
            ) : (
              <ChevronRight className={cn("h-4 w-4", config.textClass)} />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

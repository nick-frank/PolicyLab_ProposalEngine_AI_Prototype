"use client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConfidenceScore } from "./confidence-score";

type SimpleStep = string;
type DetailedStep = { step: number; description: string; evidence: string; confidence: number };

export function ReasoningTrace({ steps, defaultOpen = false }: {
  steps: SimpleStep[] | DetailedStep[]; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isDetailed = steps.length > 0 && typeof steps[0] !== "string";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
        Reasoning Trace ({steps.length} steps)
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 mt-3 border-l-2 border-muted pl-4 space-y-3">
          {steps.map((s, i) => {
            if (typeof s === "string") {
              return (
                <div key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">{i + 1}</span>
                  <p className="text-sm pt-0.5">{s}</p>
                </div>
              );
            }
            const step = s as DetailedStep;
            return (
              <div key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">{step.step}</span>
                <div className="space-y-1 pt-0.5">
                  <p className="text-sm">{step.description}</p>
                  <p className="text-xs text-muted-foreground">{step.evidence}</p>
                  <ConfidenceScore score={step.confidence} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReasoningTrace } from "@/components/shared/reasoning-trace";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import { RecommendationPanel } from "./recommendation-panel";
import type { WorkflowExplain } from "@/lib/types";
import { cn } from "@/lib/utils";

const recommendationConfig = {
  accept: { label: "Accept", className: "bg-green-100 text-green-800 border-green-200" },
  decline: { label: "Decline", className: "bg-red-100 text-red-800 border-red-200" },
  review: { label: "Review", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

export function WorkflowStageExplain({ data }: { data: WorkflowExplain }) {
  const recConfig = recommendationConfig[data.overallRecommendation];

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Overall Recommendation */}
        <div className="flex items-center gap-3">
          <Badge className={cn("text-sm px-3 py-1", recConfig.className)}>
            {recConfig.label}
          </Badge>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed">{data.summary}</p>

        {/* Recommendations */}
        <RecommendationPanel recommendations={data.recommendations} />

        {/* Full Reasoning Trace */}
        <ReasoningTrace steps={data.reasoningSteps} defaultOpen />

        {/* Provenance */}
        <ProvenanceFooter provenance={data.provenance} />
      </CardContent>
    </Card>
  );
}

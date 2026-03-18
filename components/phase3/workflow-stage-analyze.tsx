"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TightnessBadge } from "@/components/shared/tightness-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { EvidenceSpan } from "@/components/shared/evidence-span";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { WorkflowAnalyze } from "@/lib/types";

export function WorkflowStageAnalyze({ data }: { data: WorkflowAnalyze }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Section 1: Relevant Clause Deltas */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Relevant Clause Deltas</h4>
          <div className="space-y-2">
            {data.relevantClauseDeltas.map((cd) => (
              <div key={cd.clauseDeltaId} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/phase2/clause-deltas/${cd.clauseDeltaId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {cd.title}
                  </Link>
                  <TightnessBadge direction={cd.direction} size="sm" />
                  <SeverityIndicator severity={cd.severity} variant="dot" />
                </div>
                <p className="text-sm text-muted-foreground">{cd.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Tightening Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Tightening Options</h4>
          <div className="space-y-3">
            {data.tighteningOptions.map((opt, i) => (
              <div key={i} className="rounded-md border p-3 space-y-2">
                <p className="text-sm font-medium">{opt.description}</p>
                <Badge variant="secondary" className="text-xs">{opt.impactEstimate}</Badge>
                <EvidenceSpan span={opt.evidenceSpan} highlightColor="bg-amber-100" />
              </div>
            ))}
          </div>
        </div>

        <ProvenanceFooter provenance={data.provenance} />
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EvidenceSpan } from "@/components/shared/evidence-span";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { ClaimVignette, ScenarioOutcome, RegressionStatus } from "@/lib/types";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const regressionConfig: Record<
  RegressionStatus,
  { icon: typeof CheckCircle; color: string; bg: string; label: string }
> = {
  pass: { icon: CheckCircle, color: "text-green-700", bg: "bg-green-50", label: "Regression Pass" },
  fail: { icon: XCircle, color: "text-red-700", bg: "bg-red-50", label: "Regression Fail" },
  warning: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50", label: "Regression Warning" },
};

const outcomeColors = {
  covered: "bg-green-100 text-green-800 border-green-200",
  not_covered: "bg-red-100 text-red-800 border-red-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
};

function OutcomeColumn({ label, outcome }: { label: string; outcome: ScenarioOutcome }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{label}</h4>
        <Badge variant="outline" className={cn(outcomeColors[outcome.outcome])}>
          {outcome.outcome.replace("_", " ")}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{outcome.reasoning}</p>
      {outcome.triggerClause && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Trigger Clause</span>
          <EvidenceSpan span={outcome.triggerClause} highlightColor="bg-green-100" />
        </div>
      )}
      {outcome.exclusionClause && (
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Exclusion Clause</span>
          <EvidenceSpan span={outcome.exclusionClause} highlightColor="bg-red-100" />
        </div>
      )}
    </div>
  );
}

export function ScenarioResultPanel({ scenario }: { scenario: ClaimVignette }) {
  const regConfig = regressionConfig[scenario.regressionStatus];
  const RegIcon = regConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{scenario.title}</h1>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", regConfig.bg, regConfig.color)}>
            <RegIcon className="h-4 w-4" />
            {regConfig.label}
          </span>
        </div>
        <Badge variant="secondary">{scenario.coverageType}</Badge>
      </div>

      {/* Full Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claim Narrative</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{scenario.narrative}</p>
        </CardContent>
      </Card>

      {/* Two-Column Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <OutcomeColumn label="P&C Commercial Outcome" outcome={scenario.pcCommercialOutcome} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <OutcomeColumn label="Kinsale Outcome" outcome={scenario.kinsaleOutcome} />
          </CardContent>
        </Card>
      </div>

      {/* Related Clause Deltas */}
      {scenario.relatedClauseDeltaIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Clause Deltas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scenario.relatedClauseDeltaIds.map((id) => (
                <Link key={id} href={`/phase2/clause-deltas/${id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    {id}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confidence & Provenance */}
      <div className="flex items-center justify-between">
        <ConfidenceScore score={scenario.confidence} showBar showLabel />
        <ProvenanceFooter provenance={scenario.provenance} compact />
      </div>
    </div>
  );
}

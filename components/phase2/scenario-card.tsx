"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import type { ClaimVignette, RegressionStatus } from "@/lib/types";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const regressionConfig: Record<
  RegressionStatus,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  pass: { icon: CheckCircle, color: "text-green-600", label: "Pass" },
  fail: { icon: XCircle, color: "text-red-600", label: "Fail" },
  warning: { icon: AlertTriangle, color: "text-amber-600", label: "Warning" },
};

const outcomeColors = {
  covered: "bg-green-100 text-green-800",
  not_covered: "bg-red-100 text-red-800",
  partial: "bg-amber-100 text-amber-800",
};

export function ScenarioCard({ scenario }: { scenario: ClaimVignette }) {
  const regConfig = regressionConfig[scenario.regressionStatus];
  const RegIcon = regConfig.icon;

  return (
    <Link href={`/phase2/scenario-checks/${scenario.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">{scenario.coverageType}</Badge>
            <span className={cn("inline-flex items-center gap-1 text-xs font-medium", regConfig.color)}>
              <RegIcon className="h-3.5 w-3.5" />
              {regConfig.label}
            </span>
          </div>
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2 mt-1">
            {scenario.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {scenario.narrative}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground">P&C Commercial</span>
              <Badge variant="outline" className={cn("text-xs", outcomeColors[scenario.pcCommercialOutcome.outcome])}>
                {scenario.pcCommercialOutcome.outcome.replace("_", " ")}
              </Badge>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Kinsale</span>
              <Badge variant="outline" className={cn("text-xs", outcomeColors[scenario.kinsaleOutcome.outcome])}>
                {scenario.kinsaleOutcome.outcome.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <ConfidenceScore score={scenario.confidence} showBar />
        </CardContent>
      </Card>
    </Link>
  );
}

"use client";

import { StatCard } from "@/components/shared/stat-card";
import { Progress } from "@/components/ui/progress";
import type { ClaimVignette } from "@/lib/types";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function RegressionTestSummary({ scenarios }: { scenarios: ClaimVignette[] }) {
  const passing = scenarios.filter((s) => s.regressionStatus === "pass").length;
  const failing = scenarios.filter((s) => s.regressionStatus === "fail").length;
  const warning = scenarios.filter((s) => s.regressionStatus === "warning").length;
  const total = scenarios.length;
  const passRate = total > 0 ? Math.round((passing / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Passing"
          value={passing}
          subtitle={`${passRate}% pass rate`}
          trend="up"
          icon={CheckCircle}
        />
        <StatCard
          title="Failing"
          value={failing}
          subtitle="Requires investigation"
          trend={failing > 0 ? "down" : "flat"}
          icon={XCircle}
        />
        <StatCard
          title="Warnings"
          value={warning}
          subtitle="Potential regressions"
          trend={warning > 0 ? "down" : "flat"}
          icon={AlertTriangle}
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Overall Pass Rate</span>
          <span>{passRate}%</span>
        </div>
        <Progress value={passRate} className="h-2 [&>div]:bg-green-500" />
      </div>
    </div>
  );
}

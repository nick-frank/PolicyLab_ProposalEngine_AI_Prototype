"use client";

import { StatCard } from "@/components/shared/stat-card";
import { MetricBar } from "@/components/shared/metric-bar";
import { DASHBOARD_METRICS } from "@/lib/mock-data";
import { GitCompare, AlertTriangle, FlaskConical, TrendingUp } from "lucide-react";

export function Phase2Summary() {
  const { phase2 } = DASHBOARD_METRICS;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">PolicyLab</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clause Deltas Analyzed"
          value={phase2.totalClauseDeltas}
          subtitle="Total across all coverage lines"
          icon={GitCompare}
        />
        <StatCard
          title="Kinsale Tighter"
          value={`${phase2.kinsaleTighterPercent}%`}
          subtitle="Of all clause comparisons"
          trend="up"
          icon={TrendingUp}
        />
        <StatCard
          title="High Severity Findings"
          value={phase2.highSeverityCount}
          subtitle="Requiring attention"
          trend="up"
          icon={AlertTriangle}
        />
        <StatCard
          title="Scenarios Passing"
          value={phase2.scenariosPassingRatio}
          subtitle="Regression checks"
          icon={FlaskConical}
        />
      </div>
      <MetricBar
        segments={[
          { label: "Kinsale Tighter", value: phase2.tightnessDistribution.tighter, color: "bg-red-500" },
          { label: "Markel Broader", value: phase2.tightnessDistribution.broader, color: "bg-green-500" },
          { label: "Neutral", value: phase2.tightnessDistribution.neutral, color: "bg-zinc-400" },
        ]}
      />
    </div>
  );
}

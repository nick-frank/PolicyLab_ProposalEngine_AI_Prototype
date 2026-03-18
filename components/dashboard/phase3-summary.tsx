"use client";

import { StatCard } from "@/components/shared/stat-card";
import { MetricBar } from "@/components/shared/metric-bar";
import { DASHBOARD_METRICS } from "@/lib/mock-data";
import { Inbox, Zap, Target, Clock } from "lucide-react";

export function Phase3Summary() {
  const { phase3 } = DASHBOARD_METRICS;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">ProposalEngine</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Submissions in Queue"
          value={phase3.totalSubmissions}
          subtitle="Active submissions"
          icon={Inbox}
        />
        <StatCard
          title="Auto-Quote Rate"
          value={`${phase3.autoQuoteRate}%`}
          subtitle="Fully automated"
          icon={Zap}
        />
        <StatCard
          title="Avg Triage Confidence"
          value={`${phase3.avgTriageConfidence}%`}
          subtitle="Across all buckets"
          icon={Target}
        />
        <StatCard
          title="Avg Processing Time"
          value={`${(phase3.avgProcessingMs / 1000).toFixed(1)}s`}
          subtitle="End-to-end pipeline"
          icon={Clock}
        />
      </div>
      <MetricBar
        segments={[
          { label: "Auto-Decline", value: phase3.bucketDistribution.auto_decline, color: "bg-red-500" },
          { label: "Needs Review", value: phase3.bucketDistribution.needs_review, color: "bg-amber-500" },
          { label: "Auto-Quote", value: phase3.bucketDistribution.auto_quote, color: "bg-green-500" },
        ]}
      />
    </div>
  );
}

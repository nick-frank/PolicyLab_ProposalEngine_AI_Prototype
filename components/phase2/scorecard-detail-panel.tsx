"use client";

import Link from "next/link";
import { StatCard } from "@/components/shared/stat-card";
import { MetricBar } from "@/components/shared/metric-bar";
import { TightnessBadge } from "@/components/shared/tightness-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScorecardSegment, ClauseDelta } from "@/lib/types";
import { BarChart3, AlertTriangle, GitCompare } from "lucide-react";

export function ScorecardDetailPanel({
  scorecard,
  clauseDeltas,
}: {
  scorecard: ScorecardSegment;
  clauseDeltas: ClauseDelta[];
}) {
  return (
    <div className="space-y-6">
      {/* StatCards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Clauses"
          value={scorecard.totalClauses}
          icon={GitCompare}
        />
        <StatCard
          title="High Severity"
          value={scorecard.highSeverityCount}
          icon={AlertTriangle}
        />
        <StatCard
          title="Tighter Ratio"
          value={`${Math.round((scorecard.tighterCount / scorecard.totalClauses) * 100)}%`}
          icon={BarChart3}
        />
      </div>

      {/* Full-width MetricBar */}
      <MetricBar
        segments={[
          { label: "Tighter", value: scorecard.tighterCount, color: "bg-red-500" },
          { label: "Broader", value: scorecard.broaderCount, color: "bg-green-500" },
          { label: "Neutral", value: scorecard.neutralCount, color: "bg-zinc-400" },
        ]}
      />

      {/* Related Clause Deltas Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Related Clause Deltas</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clauseDeltas.map((cd) => (
                <TableRow key={cd.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/phase2/clause-deltas/${cd.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {cd.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <TightnessBadge direction={cd.direction} size="sm" />
                  </TableCell>
                  <TableCell>
                    <SeverityIndicator severity={cd.severity} variant="dot" />
                  </TableCell>
                  <TableCell className="text-sm">
                    {Math.round(cd.confidence * 100)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

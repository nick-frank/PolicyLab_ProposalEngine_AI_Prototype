"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricBar } from "@/components/shared/metric-bar";
import { MechanismTag } from "@/components/shared/mechanism-tag";
import type { ScorecardSegment } from "@/lib/types";

export function ScorecardGrid({ scorecards }: { scorecards: ScorecardSegment[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scorecards.map((sc) => (
        <Link key={sc.id} href={`/phase2/scorecards/${sc.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-mono">
                  {sc.naicsCode}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {sc.coverageType}
                </Badge>
              </div>
              <CardTitle className="text-sm font-semibold mt-1">
                {sc.naicsDescription}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <MetricBar
                segments={[
                  { label: "Tighter", value: sc.tighterCount, color: "bg-red-500" },
                  { label: "Broader", value: sc.broaderCount, color: "bg-green-500" },
                  { label: "Neutral", value: sc.neutralCount, color: "bg-zinc-400" },
                ]}
              />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{sc.totalClauses} clauses</span>
                <span>{sc.highSeverityCount} high severity</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sc.topMechanisms.slice(0, 3).map((m) => (
                  <MechanismTag key={m} mechanism={m} />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

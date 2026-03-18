"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import type { PricingComparison } from "@/lib/types";
import { DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function GapAnalysisPanel({ comparisons }: { comparisons: PricingComparison[] }) {
  const kinsaleWins = comparisons.filter(
    (c) => c.outcome === "kinsale_wins" && c.termGapOpportunities.length > 0
  );

  const totalImpact = kinsaleWins.reduce(
    (sum, c) => sum + c.termGapOpportunities.reduce((s, t) => s + t.estimatedPremiumImpact, 0),
    0
  );

  const allOpportunities = kinsaleWins.flatMap((c) =>
    c.termGapOpportunities.map((t) => ({ ...t, insuredName: c.insuredName }))
  );

  return (
    <div className="space-y-4">
      <StatCard
        title="Total Estimated Premium Impact"
        value={formatCurrency(totalImpact)}
        subtitle={`From ${allOpportunities.length} term-gap opportunities across ${kinsaleWins.length} accounts`}
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kinsaleWins.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{c.insuredName}</CardTitle>
                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                  Kinsale Wins
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{c.coverageType} | {c.naicsCode}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.termGapOpportunities.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border p-2">
                  <div className="space-y-0.5">
                    <Link
                      href={`/phase2/clause-deltas/${t.clauseDeltaId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {t.clauseTitle}
                    </Link>
                    <p className="text-xs text-muted-foreground">{t.clauseDeltaId}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                    <DollarSign className="h-3.5 w-3.5" />
                    {formatCurrency(t.estimatedPremiumImpact)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

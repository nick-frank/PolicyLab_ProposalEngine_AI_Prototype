"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { ClauseAlignment, MatchType } from "@/lib/types";
import { cn } from "@/lib/utils";

const matchTypeConfig: Record<MatchType, { label: string; className: string }> = {
  one_to_one: { label: "1:1 Match", className: "bg-green-100 text-green-800 border-green-200" },
  one_to_many: { label: "1:N Match", className: "bg-amber-100 text-amber-800 border-amber-200" },
  unmatched: { label: "Unmatched", className: "bg-red-100 text-red-800 border-red-200" },
};

export function AlignmentMatchCard({ alignment }: { alignment: ClauseAlignment }) {
  const mtConfig = matchTypeConfig[alignment.matchType];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={cn("text-xs", mtConfig.className)}>
            {mtConfig.label}
          </Badge>
          <ConfidenceScore score={alignment.confidence} showBar />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side-by-side clauses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Markel Clause(s)</h4>
            {alignment.markelClauses.map((c) => (
              <div key={c.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.formNumber}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Kinsale Clause(s)</h4>
            {alignment.kinsaleClauses.length === 0 ? (
              <div className="rounded-md border border-dashed p-2 text-sm text-muted-foreground italic">
                No matching clause found
              </div>
            ) : (
              alignment.kinsaleClauses.map((c) => (
                <div key={c.id} className="rounded-md border p-2 text-sm">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.formNumber}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Retrieval: </span>
            <span className="font-semibold">{(alignment.retrievalScore * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Rerank: </span>
            <span className="font-semibold">{(alignment.rerankScore * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Anchor Terms */}
        <div className="flex flex-wrap gap-1.5">
          {alignment.anchorTerms.map((term) => (
            <Badge key={term} variant="secondary" className="text-xs">
              {term}
            </Badge>
          ))}
        </div>

        <ProvenanceFooter provenance={alignment.provenance} compact />
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceCitation } from "@/components/shared/evidence-citation";
import type { Recommendation } from "@/lib/types";
import { Lightbulb } from "lucide-react";

export function RecommendationPanel({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        Recommendations
      </h4>
      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <Card key={i}>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {i + 1}
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">{rec.action}</p>
                  <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                  {rec.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {rec.citations.map((cit, j) => (
                        <EvidenceCitation key={j} provenance={cit} variant="inline" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import type { Submission } from "@/lib/types";
import { Route, AlertTriangle, BarChart3, Target, SlidersHorizontal } from "lucide-react";

export function RoutingLogicDisplay({ submission }: { submission: Submission }) {
  return (
    <div className="space-y-4">
      {/* Routing Reason Callout */}
      <Card className="border-l-4 border-l-blue-400">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Route className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Routing Decision</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {submission.routingReason}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factor Breakdown */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-sm font-semibold">Routing Factors</h3>

          {/* Risk Flags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Risk Flags</span>
              <Badge variant="secondary" className="text-xs ml-auto">{submission.riskFlags.length}</Badge>
            </div>
            {submission.riskFlags.length > 0 ? (
              <div className="ml-6 space-y-1.5">
                {submission.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <SeverityIndicator severity={flag.severity} variant="dot" />
                    <div>
                      <span className="font-medium">{flag.name}</span>
                      <p className="text-xs text-muted-foreground">{flag.evidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ml-6 text-xs text-muted-foreground">No risk flags identified</p>
            )}
          </div>

          {/* Quality Score */}
          <div className="flex items-center gap-2 text-sm">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Quality Score</span>
            <span className="ml-auto font-semibold">{Math.round(submission.qualityScore * 100)}%</span>
          </div>

          {/* Triage Confidence */}
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Triage Confidence</span>
            <span className="ml-auto font-semibold">{Math.round(submission.triageConfidence * 100)}%</span>
          </div>

          {/* Threshold Logic */}
          <div className="flex items-start gap-2 text-sm">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-medium">Threshold Logic</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {submission.triageBucket === "auto_quote" && "Quality >= 70% AND Confidence >= 80% AND High-severity flags = 0"}
                {submission.triageBucket === "auto_decline" && "Quality < 45% OR High-severity flags >= 2 OR Confidence >= 85%"}
                {submission.triageBucket === "needs_review" && "Falls between auto-quote and auto-decline thresholds"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

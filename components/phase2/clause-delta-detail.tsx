"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TightnessBadge } from "@/components/shared/tightness-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { MechanismTag } from "@/components/shared/mechanism-tag";
import { SideBySideDiff } from "@/components/shared/side-by-side-diff";
import { ReasoningTrace } from "@/components/shared/reasoning-trace";
import { ConfidenceAbstain } from "@/components/shared/confidence-abstain";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { ClauseDelta } from "@/lib/types";
import { Info } from "lucide-react";

export function ClauseDeltaDetail({ delta }: { delta: ClauseDelta }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{delta.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <TightnessBadge direction={delta.direction} />
          <SeverityIndicator severity={delta.severity} />
          <MechanismTag mechanism={delta.mechanism} />
          <Badge variant="secondary">{delta.coverageType}</Badge>
          <Badge variant="outline">{delta.naicsCode} — {delta.naicsDescription}</Badge>
        </div>
      </div>

      {/* Side-by-Side Diff */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Policy Language Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <SideBySideDiff
            markelSpan={delta.markelSpan}
            kinsaleSpan={delta.kinsaleSpan}
            tightness={delta.direction}
            mechanism={delta.mechanism}
          />
        </CardContent>
      </Card>

      {/* Plain Language Explanation */}
      <Card className="border-l-4 border-l-blue-400">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Plain Language Explanation</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {delta.plainLanguageExplanation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reasoning Trace (collapsed by default) */}
      <Card>
        <CardContent className="pt-6">
          <ReasoningTrace steps={delta.reasoningSteps} />
        </CardContent>
      </Card>

      {/* Confidence */}
      <Card>
        <CardContent className="pt-6">
          <ConfidenceAbstain score={delta.confidence} abstained={delta.abstained} />
        </CardContent>
      </Card>

      {/* Provenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Markel Provenance</CardTitle>
          </CardHeader>
          <CardContent>
            <ProvenanceFooter provenance={delta.markelProvenance} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Kinsale Provenance</CardTitle>
          </CardHeader>
          <CardContent>
            <ProvenanceFooter provenance={delta.kinsaleProvenance} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

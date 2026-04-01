"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TightnessBadge } from "@/components/shared/tightness-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { MechanismTag } from "@/components/shared/mechanism-tag";
import { ConfidenceAbstain } from "@/components/shared/confidence-abstain";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { ClauseDelta } from "@/lib/types";

export function ClauseDeltaCard({ delta }: { delta: ClauseDelta }) {
  return (
    <Link href={`/phase2/clause-deltas/${delta.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {delta.title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <TightnessBadge direction={delta.direction} size="sm" />
            <SeverityIndicator severity={delta.severity} variant="dot" />
            <MechanismTag mechanism={delta.mechanism} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {delta.plainLanguageExplanation}
          </p>
          <ConfidenceAbstain score={delta.confidence} abstained={delta.abstained} />
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {delta.coverageType}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {delta.naicsCode}
            </Badge>
          </div>
          <ProvenanceFooter provenance={delta.pcCommercialProvenance} compact />
        </CardContent>
      </Card>
    </Link>
  );
}

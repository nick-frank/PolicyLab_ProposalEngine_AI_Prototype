"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { ReasoningTrace } from "@/components/shared/reasoning-trace";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { WorkflowClassify } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function WorkflowStageClassify({ data }: { data: WorkflowClassify }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        {/* NAICS & Coverage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">NAICS Code</p>
            <p className="text-sm font-semibold">{data.naicsCode} — {data.naicsDescription}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Coverage Types</p>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {data.coverageTypes.map((ct) => (
                <Badge key={ct} variant="secondary" className="text-xs">{ct}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Score */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Quality Score</span>
          <ConfidenceScore score={data.qualityScore} showBar showLabel={false} />
        </div>

        {/* Risk Flags */}
        {data.riskFlags.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Risk Flag</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.riskFlags.map((flag, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{flag.name}</TableCell>
                    <TableCell><SeverityIndicator severity={flag.severity} variant="dot" /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{flag.evidence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No risk flags identified.</p>
        )}

        {/* Reasoning Trace */}
        <ReasoningTrace steps={data.reasoningSteps} />

        {/* Provenance */}
        <ProvenanceFooter provenance={data.provenance} />
      </CardContent>
    </Card>
  );
}

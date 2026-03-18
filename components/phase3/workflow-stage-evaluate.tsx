"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import { AppetiteScoreGauge } from "./appetite-score-gauge";
import type { WorkflowEvaluate } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WorkflowStageEvaluate({ data }: { data: WorkflowEvaluate }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Appetite Score Gauge */}
        <div className="flex justify-center">
          <AppetiteScoreGauge score={data.appetiteScore} label={data.calibrationBucket} />
        </div>

        {/* Loss Features Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Loss Features</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lossFeatures.map((lf, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{lf.name}</TableCell>
                    <TableCell className="text-sm">{lf.value}</TableCell>
                    <TableCell className="text-right text-sm">{(lf.weight * 100).toFixed(0)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Clause Impacts Table */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Clause Impacts</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clause</TableHead>
                  <TableHead className="text-right">Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.clauseImpacts.map((ci, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{ci.clauseTitle}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        "text-sm font-semibold",
                        ci.impactValue > 0 ? "text-green-600" : ci.impactValue < 0 ? "text-red-600" : "text-muted-foreground"
                      )}>
                        {ci.impactValue > 0 ? "+" : ""}{ci.impactValue}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Combined Score & Confidence */}
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-xs text-muted-foreground">Combined Score</p>
            <p className="text-xl font-bold">{data.combinedScore}/100</p>
          </div>
          <ConfidenceScore score={data.confidence} showBar showLabel />
        </div>

        <ProvenanceFooter provenance={data.provenance} />
      </CardContent>
    </Card>
  );
}

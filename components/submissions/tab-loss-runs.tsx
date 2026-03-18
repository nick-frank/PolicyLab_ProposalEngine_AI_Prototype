"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { PortalLossRun, PortalLargeLoss } from "@/lib/types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatPercent(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function weightedAvg(runs: PortalLossRun[]) {
  const totalPremium = runs.reduce((s, r) => s + r.premium, 0);
  const totalIncurred = runs.reduce((s, r) => s + r.incurred, 0);
  if (totalPremium === 0) return 0;
  return totalIncurred / totalPremium;
}

export function TabLossRuns({
  lossRuns,
  largeLosses,
}: {
  lossRuns: PortalLossRun[];
  largeLosses: PortalLargeLoss[];
}) {
  const threeYear = useMemo(() => weightedAvg(lossRuns.slice(0, 3)), [lossRuns]);
  const fiveYear = useMemo(() => weightedAvg(lossRuns.slice(0, 5)), [lossRuns]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">3-Year Weighted Avg Loss Ratio</p>
            <p className="text-2xl font-bold">{formatPercent(threeYear)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">5-Year Weighted Avg Loss Ratio</p>
            <p className="text-2xl font-bold">{formatPercent(fiveYear)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Loss Run Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Loss History by Policy Year</CardTitle>
        </CardHeader>
        <CardContent>
          {lossRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No loss run data available.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Year</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Claims</TableHead>
                  <TableHead>Incurred</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Reserves</TableHead>
                  <TableHead>Loss Ratio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lossRuns.map((lr) => (
                  <TableRow key={lr.id}>
                    <TableCell className="font-medium">{lr.policyYear}</TableCell>
                    <TableCell className="text-sm">{lr.carrier}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(lr.premium)}</TableCell>
                    <TableCell className="text-sm">{lr.claims}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(lr.incurred)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(lr.paid)}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(lr.reserves)}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <span className={lr.lossRatio > 0.6 ? "text-red-600" : lr.lossRatio > 0.4 ? "text-amber-600" : "text-green-600"}>
                        {formatPercent(lr.lossRatio)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Large Losses */}
      {largeLosses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Large Losses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Year</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {largeLosses.map((ll) => (
                  <TableRow key={ll.id}>
                    <TableCell className="font-medium">{ll.policyYear}</TableCell>
                    <TableCell className="text-sm">{ll.description}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(ll.claimAmount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ll.status === "open" ? "bg-amber-50 text-amber-700" : "bg-zinc-50 text-zinc-600"}>
                        {ll.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

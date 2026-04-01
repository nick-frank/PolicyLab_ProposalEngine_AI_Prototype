"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PricingComparison } from "@/lib/types";

type SortKey = "insuredName" | "premiumDeltaPercent" | "tightnessScore" | "outcome";

const outcomeLabels: Record<string, { label: string; className: string }> = {
  pc_commercial_wins: { label: "P&C Commercial Wins", className: "bg-green-100 text-green-800" },
  kinsale_wins: { label: "Kinsale Wins", className: "bg-red-100 text-red-800" },
  competitive: { label: "Competitive", className: "bg-amber-100 text-amber-800" },
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function PricingTable({ comparisons }: { comparisons: PricingComparison[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("premiumDeltaPercent");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...comparisons].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "premiumDeltaPercent" || sortKey === "tightnessScore") {
      return (a[sortKey] - b[sortKey]) * dir;
    }
    return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
  });

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort(k)}>
      {label}<ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortHeader label="Insured" k="insuredName" /></TableHead>
            <TableHead>Coverage</TableHead>
            <TableHead className="text-right">P&C Commercial</TableHead>
            <TableHead className="text-right">Kinsale</TableHead>
            <TableHead className="text-right"><SortHeader label="Delta" k="premiumDeltaPercent" /></TableHead>
            <TableHead className="text-right"><SortHeader label="Tightness" k="tightnessScore" /></TableHead>
            <TableHead><SortHeader label="Outcome" k="outcome" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((c) => {
            const outConfig = outcomeLabels[c.outcome];
            return (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-sm">{c.insuredName}</TableCell>
                <TableCell className="text-sm">{c.coverageType}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(c.pcCommercialPremium)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(c.kinsalePremium)}</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "text-sm font-medium",
                    c.premiumDeltaPercent < 0 ? "text-red-600" : c.premiumDeltaPercent > 0 ? "text-green-600" : "text-muted-foreground"
                  )}>
                    {c.premiumDeltaPercent > 0 ? "+" : ""}{c.premiumDeltaPercent.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm">{c.tightnessScore.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-xs", outConfig.className)}>
                    {outConfig.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

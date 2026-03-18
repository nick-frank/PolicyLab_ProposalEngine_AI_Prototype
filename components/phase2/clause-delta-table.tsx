"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TightnessBadge } from "@/components/shared/tightness-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { MechanismTag } from "@/components/shared/mechanism-tag";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import type { ClauseDelta } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type SortKey = "title" | "direction" | "severity" | "confidence" | "coverageType";

export function ClauseDeltaTable({ deltas }: { deltas: ClauseDelta[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sorted = [...deltas].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "confidence") return (a.confidence - b.confidence) * dir;
    const aVal = String(a[sortKey]);
    const bVal = String(b[sortKey]);
    return aVal.localeCompare(bVal) * dir;
  });

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => handleSort(sortKeyName)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortHeader label="Title" sortKeyName="title" /></TableHead>
            <TableHead><SortHeader label="Direction" sortKeyName="direction" /></TableHead>
            <TableHead><SortHeader label="Severity" sortKeyName="severity" /></TableHead>
            <TableHead>Mechanism</TableHead>
            <TableHead><SortHeader label="Coverage" sortKeyName="coverageType" /></TableHead>
            <TableHead>NAICS</TableHead>
            <TableHead><SortHeader label="Confidence" sortKeyName="confidence" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((delta) => (
            <TableRow key={delta.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link
                  href={`/phase2/clause-deltas/${delta.id}`}
                  className="font-medium text-sm hover:underline"
                >
                  {delta.title}
                </Link>
              </TableCell>
              <TableCell>
                <TightnessBadge direction={delta.direction} size="sm" />
              </TableCell>
              <TableCell>
                <SeverityIndicator severity={delta.severity} variant="dot" />
              </TableCell>
              <TableCell>
                <MechanismTag mechanism={delta.mechanism} />
              </TableCell>
              <TableCell className="text-sm">{delta.coverageType}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{delta.naicsCode}</TableCell>
              <TableCell>
                <ConfidenceScore score={delta.confidence} showBar />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

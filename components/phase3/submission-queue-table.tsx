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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/status-pill";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import type { Submission } from "@/lib/types";
import { ArrowUpDown, Flag } from "lucide-react";

type SortKey = "insuredName" | "triageBucket" | "triageConfidence" | "premiumEstimate" | "submittedDate";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function SubmissionQueueTable({ submissions }: { submissions: Submission[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("submittedDate");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...submissions].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "triageConfidence" || sortKey === "premiumEstimate") {
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
            <TableHead>State</TableHead>
            <TableHead><SortHeader label="Bucket" k="triageBucket" /></TableHead>
            <TableHead><SortHeader label="Confidence" k="triageConfidence" /></TableHead>
            <TableHead className="text-right"><SortHeader label="Premium" k="premiumEstimate" /></TableHead>
            <TableHead>Risk Flags</TableHead>
            <TableHead><SortHeader label="Submitted" k="submittedDate" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((sub) => (
            <TableRow key={sub.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link href={`/phase3/submissions/${sub.id}`} className="font-medium text-sm hover:underline">
                  {sub.insuredName}
                </Link>
              </TableCell>
              <TableCell className="text-sm">{sub.coverageType}</TableCell>
              <TableCell className="text-sm">{sub.state}</TableCell>
              <TableCell>
                <StatusPill bucket={sub.triageBucket} />
              </TableCell>
              <TableCell>
                <ConfidenceScore score={sub.triageConfidence} showBar />
              </TableCell>
              <TableCell className="text-right text-sm">{formatCurrency(sub.premiumEstimate)}</TableCell>
              <TableCell>
                {sub.riskFlags.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <Flag className="h-3 w-3" />
                    {sub.riskFlags.length}
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-xs">Clean</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{sub.submittedDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

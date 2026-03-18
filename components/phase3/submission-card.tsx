"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/status-pill";
import type { Submission } from "@/lib/types";
import { Flag } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function SubmissionCard({ submission }: { submission: Submission }) {
  return (
    <Link href={`/phase3/submissions/${submission.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold truncate">
              {submission.insuredName}
            </CardTitle>
            <StatusPill
              bucket={submission.triageBucket}
              showConfidence
              confidence={submission.triageConfidence}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs font-mono">{submission.naicsCode}</Badge>
            <Badge variant="secondary" className="text-xs">{submission.coverageType}</Badge>
            <Badge variant="outline" className="text-xs">{submission.state}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Premium Est.</span>
            <span className="font-semibold">{formatCurrency(submission.premiumEstimate)}</span>
          </div>
          {submission.riskFlags.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <Flag className="h-3 w-3" />
              <span>{submission.riskFlags.length} risk flag{submission.riskFlags.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

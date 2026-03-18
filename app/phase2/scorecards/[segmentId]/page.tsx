"use client";

import { use } from "react";
import { SCORECARD_MAP, CLAUSE_DELTA_MAP } from "@/lib/mock-data";
import { ScorecardDetailPanel } from "@/components/phase2/scorecard-detail-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ScorecardDetailPage({
  params,
}: {
  params: Promise<{ segmentId: string }>;
}) {
  const { segmentId } = use(params);
  const scorecard = SCORECARD_MAP[segmentId];

  if (!scorecard) {
    return (
      <EmptyState
        title="Scorecard Not Found"
        description={`No scorecard found with ID "${segmentId}".`}
      />
    );
  }

  const clauseDeltas = scorecard.clauseDeltaIds
    .map((id) => CLAUSE_DELTA_MAP[id])
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <Link href="/phase2/scorecards">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Scorecards
        </Button>
      </Link>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{scorecard.naicsDescription}</h1>
          <Badge variant="outline" className="font-mono">{scorecard.naicsCode}</Badge>
        </div>
        <Badge variant="secondary">{scorecard.coverageType}</Badge>
      </div>
      <ScorecardDetailPanel scorecard={scorecard} clauseDeltas={clauseDeltas} />
    </div>
  );
}

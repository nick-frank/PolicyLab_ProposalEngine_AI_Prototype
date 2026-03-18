"use client";

import { SCORECARDS } from "@/lib/mock-data";
import { ScorecardGrid } from "@/components/phase2/scorecard-grid";

export default function ScorecardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tightness Scorecards</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregated clause delta analysis by NAICS segment and coverage type
        </p>
      </div>
      <ScorecardGrid scorecards={SCORECARDS} />
    </div>
  );
}

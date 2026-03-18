"use client";

import { use } from "react";
import { SCENARIO_MAP } from "@/lib/mock-data";
import { ScenarioResultPanel } from "@/components/phase2/scenario-result-panel";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = use(params);
  const scenario = SCENARIO_MAP[scenarioId];

  if (!scenario) {
    return (
      <EmptyState
        title="Scenario Not Found"
        description={`No scenario found with ID "${scenarioId}".`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/phase2/scenario-checks">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Scenario Checks
        </Button>
      </Link>
      <ScenarioResultPanel scenario={scenario} />
    </div>
  );
}

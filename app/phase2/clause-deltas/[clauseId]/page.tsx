"use client";

import { use } from "react";
import { CLAUSE_DELTA_MAP } from "@/lib/mock-data";
import { ClauseDeltaDetail } from "@/components/phase2/clause-delta-detail";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClauseDeltaDetailPage({
  params,
}: {
  params: Promise<{ clauseId: string }>;
}) {
  const { clauseId } = use(params);
  const delta = CLAUSE_DELTA_MAP[clauseId];

  if (!delta) {
    return (
      <EmptyState
        title="Clause Delta Not Found"
        description={`No clause delta found with ID "${clauseId}".`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/phase2/clause-deltas">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clause Deltas
        </Button>
      </Link>
      <ClauseDeltaDetail delta={delta} />
    </div>
  );
}

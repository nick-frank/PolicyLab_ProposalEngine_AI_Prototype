"use client";

import { use } from "react";
import { ALIGNMENT_MAP } from "@/lib/mock-data";
import { AlignmentMatchCard } from "@/components/phase2/alignment-match-card";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AlignmentDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const alignment = ALIGNMENT_MAP[matchId];

  if (!alignment) {
    return (
      <EmptyState
        title="Alignment Not Found"
        description={`No clause alignment found with ID "${matchId}".`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/phase2/clause-alignment">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clause Alignment
        </Button>
      </Link>
      <h1 className="text-2xl font-bold">Alignment Detail</h1>
      <AlignmentMatchCard alignment={alignment} />
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { SUBMISSIONS } from "@/lib/mock-data";
import { TriageBucketHeader } from "@/components/phase3/triage-bucket-header";
import { SubmissionCard } from "@/components/phase3/submission-card";
import type { TriageBucket, Submission } from "@/lib/types";

const BUCKET_ORDER: TriageBucket[] = ["auto_decline", "needs_review", "auto_quote"];

export default function SubmissionsPage() {
  const grouped = useMemo(() => {
    const groups: Record<TriageBucket, Submission[]> = {
      auto_decline: [],
      needs_review: [],
      auto_quote: [],
    };
    for (const sub of SUBMISSIONS) {
      groups[sub.triageBucket].push(sub);
    }
    return groups;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submission Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-triaged submissions organized by routing bucket
        </p>
      </div>

      <div className="space-y-4">
        {BUCKET_ORDER.map((bucket) => {
          const subs = grouped[bucket];
          const avgConf = subs.length > 0
            ? subs.reduce((sum, s) => sum + s.triageConfidence, 0) / subs.length
            : 0;

          return (
            <TriageBucketHeader
              key={bucket}
              bucket={bucket}
              count={subs.length}
              avgConfidence={avgConf}
              defaultOpen={bucket === "needs_review"}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subs.map((sub) => (
                  <SubmissionCard key={sub.id} submission={sub} />
                ))}
              </div>
            </TriageBucketHeader>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { use } from "react";
import { SUBMISSION_MAP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/status-pill";
import { RoutingLogicDisplay } from "@/components/phase3/routing-logic-display";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const submission = SUBMISSION_MAP[submissionId];

  if (!submission) {
    return (
      <EmptyState
        title="Submission Not Found"
        description={`No submission found with ID "${submissionId}".`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/phase3/submissions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Queue
          </Button>
        </Link>
        {submission.hasWorkflow && (
          <Link href={`/phase3/workflow/${submission.id}`}>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Full Workflow
            </Button>
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{submission.insuredName}</h1>
          <StatusPill
            bucket={submission.triageBucket}
            showConfidence
            confidence={submission.triageConfidence}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono">{submission.naicsCode}</Badge>
          <Badge variant="secondary">{submission.naicsDescription}</Badge>
          <Badge variant="secondary">{submission.coverageType}</Badge>
          <Badge variant="outline">{submission.state}</Badge>
        </div>
      </div>

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Broker</p>
              <p className="font-medium">{submission.broker}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Submitted</p>
              <p className="font-medium">{submission.submittedDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Premium Estimate</p>
              <p className="font-medium">{formatCurrency(submission.premiumEstimate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quality Score</p>
              <p className="font-medium">{Math.round(submission.qualityScore * 100)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Routing Logic */}
      <RoutingLogicDisplay submission={submission} />
    </div>
  );
}

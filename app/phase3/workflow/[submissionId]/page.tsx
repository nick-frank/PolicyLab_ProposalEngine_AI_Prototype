"use client";

import { use } from "react";
import { WORKFLOW_MAP, SUBMISSION_MAP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/shared/status-pill";
import { WorkflowPipeline } from "@/components/phase3/workflow-pipeline";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Cpu } from "lucide-react";

export default function WorkflowPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = use(params);
  const workflow = WORKFLOW_MAP[submissionId];
  const submission = SUBMISSION_MAP[submissionId];

  if (!workflow) {
    return (
      <EmptyState
        title="Workflow Not Found"
        description={`No workflow found for submission "${submissionId}".`}
      />
    );
  }

  const startTime = new Date(workflow.startedAt);
  const endTime = new Date(workflow.completedAt);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationSec = (durationMs / 1000).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/phase3/submissions/${submissionId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Submission
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">Workflow Deep Dive</h1>
          {submission && (
            <StatusPill
              bucket={submission.triageBucket}
              showConfidence
              confidence={submission.triageConfidence}
            />
          )}
        </div>
        {submission && (
          <p className="text-sm text-muted-foreground">
            {submission.insuredName} — {submission.coverageType}
          </p>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Model:</span>
              <span className="font-mono text-xs">{workflow.modelVersion}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{durationSec}s</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Started:</span>
              <span>{startTime.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Stage Pipeline */}
      <WorkflowPipeline workflow={workflow} />
    </div>
  );
}

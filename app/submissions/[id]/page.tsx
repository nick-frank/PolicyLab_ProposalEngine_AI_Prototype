"use client";

import { use } from "react";
import {
  PORTAL_SUBMISSION_MAP,
  PORTAL_PROPOSALS,
  PORTAL_LOSS_RUNS,
  PORTAL_LARGE_LOSSES,
  PORTAL_DOCUMENTS,
  PORTAL_NOTES,
  PORTAL_STRUCTURED_FIELDS,
} from "@/lib/mock-data";
import { EmptyState } from "@/components/shared/empty-state";
import { SubmissionHeader } from "@/components/submissions/submission-header";
import { TabOverview } from "@/components/submissions/tab-overview";
import { TabDocuments } from "@/components/submissions/tab-documents";
import { TabLossRuns } from "@/components/submissions/tab-loss-runs";
import { TabLossRunsGL } from "@/components/submissions/tab-loss-runs-gl";
import { TabNotesEmails } from "@/components/submissions/tab-notes-emails";
import { TabStructuredData } from "@/components/submissions/tab-structured-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const submission = PORTAL_SUBMISSION_MAP[id];

  if (!submission) {
    return (
      <EmptyState
        title="Submission Not Found"
        description={`No submission found with ID "${id}".`}
      />
    );
  }

  const proposals = PORTAL_PROPOSALS.filter((p) => p.submissionId === id);
  const lossRuns = PORTAL_LOSS_RUNS[id] || [];
  const largeLosses = PORTAL_LARGE_LOSSES[id] || [];
  const documents = PORTAL_DOCUMENTS[id] || [];
  const notes = PORTAL_NOTES[id] || [];
  const structuredFields = PORTAL_STRUCTURED_FIELDS[id] || [];
  const isGL = submission.lineOfBusiness === "General Liability";

  return (
    <div className="space-y-6">
      <SubmissionHeader submission={submission} proposals={proposals} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="loss-runs">Loss Runs ({lossRuns.length})</TabsTrigger>
          <TabsTrigger value="notes">Submission Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="structured">Structured Data ({structuredFields.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <TabOverview
            submission={submission}
            proposals={proposals}
            structuredFields={structuredFields}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <TabDocuments documents={documents} />
        </TabsContent>

        <TabsContent value="loss-runs" className="mt-6">
          {isGL ? <TabLossRunsGL /> : <TabLossRuns lossRuns={lossRuns} largeLosses={largeLosses} />}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <TabNotesEmails initialNotes={notes} />
        </TabsContent>

        <TabsContent value="structured" className="mt-6">
          <TabStructuredData initialFields={structuredFields} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

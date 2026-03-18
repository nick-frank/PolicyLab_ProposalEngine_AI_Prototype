"use client";

import { use } from "react";
import {
  PORTAL_PROPOSAL_MAP,
  PORTAL_SUBMISSION_MAP,
  PORTAL_PROPOSAL_RATES,
  PORTAL_PROPOSAL_NOTES,
  PORTAL_PROPOSAL_FORMS,
  PORTAL_FORMS,
} from "@/lib/mock-data";
import { EmptyState } from "@/components/shared/empty-state";
import { PortalStatusBadge } from "@/components/submissions/portal-status-badge";
import { TabRates } from "@/components/submissions/tab-rates";
import { TabRatesGL } from "@/components/submissions/tab-rates-gl";
import { TabNotesEmails } from "@/components/submissions/tab-notes-emails";
import { TabForms } from "@/components/submissions/tab-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Check, X, Copy, Download } from "lucide-react";
import { generateProposalPdf } from "@/lib/proposal-pdf-export";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = use(params);
  const submission = PORTAL_SUBMISSION_MAP[id];
  const proposal = PORTAL_PROPOSAL_MAP[proposalId];

  if (!submission || !proposal) {
    return (
      <EmptyState
        title="Proposal Not Found"
        description={`No proposal found with ID "${proposalId}".`}
      />
    );
  }

  const rates = PORTAL_PROPOSAL_RATES[proposalId] || [];
  const notes = PORTAL_PROPOSAL_NOTES[proposalId] || [];
  const forms = PORTAL_PROPOSAL_FORMS[proposalId] || [];
  const isGL = submission.lineOfBusiness === "General Liability";

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link href={`/submissions/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to {submission.insuredName}
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{proposal.label}</h1>
            <Badge variant="outline" className="text-xs">v{proposal.version}</Badge>
            <Badge
              variant="outline"
              className={PROPOSAL_STATUS_COLORS[proposal.status] || ""}
            >
              {proposal.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>For: <strong>{submission.insuredName}</strong></span>
            <span>•</span>
            <span>{submission.referenceNumber}</span>
            <span>•</span>
            <PortalStatusBadge status={submission.status} size="sm" />
          </div>
          <p className="text-lg font-semibold">Total Premium: {formatCurrency(proposal.totalPremium)}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-1" />
            New Version
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const pdfForms = PORTAL_FORMS[id] || forms;
              generateProposalPdf(submission, proposal, rates, pdfForms);
            }}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Proposal PDF
          </Button>
          {proposal.status === "pending_approval" && (
            <>
              <Button size="sm" variant="default">
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="destructive">
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rates" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="rates">Rates ({rates.length})</TabsTrigger>
          <TabsTrigger value="notes">Proposal Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="forms">Forms ({forms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="mt-6">
          {isGL ? <TabRatesGL submission={submission} /> : <TabRates initialRates={rates} />}
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <TabNotesEmails initialNotes={notes} />
        </TabsContent>

        <TabsContent value="forms" className="mt-6">
          <TabForms forms={forms} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

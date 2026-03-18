"use client";

import { PortalStatusBadge } from "./portal-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortalSubmission, PortalProposal } from "@/lib/types";
import { ArrowLeft, UserCircle, Calendar, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function SubmissionHeader({
  submission,
  proposals = [],
  onChangeStatus,
  onGenerateProposal,
}: {
  submission: PortalSubmission;
  proposals?: PortalProposal[];
  onChangeStatus?: () => void;
  onGenerateProposal?: () => void;
}) {
  return (
    <div className="space-y-4">
      <Link href="/submissions">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Submissions
        </Button>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{submission.insuredName}</h1>
            <PortalStatusBadge status={submission.status} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-mono">{submission.referenceNumber}</Badge>
            <Badge variant="secondary">{submission.lineOfBusiness}</Badge>
            <Badge variant="outline">{submission.naicsCode} — {submission.naicsDescription}</Badge>
            <Badge variant="outline">{submission.state}</Badge>
          </div>
        </div>

        {/* Proposals summary — top right */}
        {proposals.length > 0 && (
          <div className="border rounded-lg p-4 min-w-[240px] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Proposals ({proposals.length})
              </h3>
            </div>
            <div className="space-y-1.5">
              {proposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/submissions/${submission.id}/proposals/${p.id}`}
                  className="flex items-center justify-between gap-3 text-sm hover:bg-muted/50 rounded px-2 py-1 -mx-2 transition-colors"
                >
                  <span className="font-medium truncate">{p.label}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">{formatCurrency(p.totalPremium)}</span>
                    <Badge variant="outline" className={`text-xs ${PROPOSAL_STATUS_COLORS[p.status] || ""}`}>
                      {p.status.replace("_", " ")}
                    </Badge>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onChangeStatus && (
          <Button variant="outline" size="sm" onClick={onChangeStatus}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Change Status
          </Button>
        )}
        {onGenerateProposal && (
          <Button size="sm" onClick={onGenerateProposal}>
            <FileText className="h-4 w-4 mr-1" />
            Generate Proposal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground flex items-center gap-1"><UserCircle className="h-3 w-3" /> Underwriter</p>
          <p className="font-medium">{submission.assignedUnderwriter}</p>
        </div>
        {submission.approver && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><UserCircle className="h-3 w-3" /> Approver</p>
            <p className="font-medium">{submission.approver}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Broker</p>
          <p className="font-medium">{submission.broker}</p>
        </div>
        <div>
          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Effective</p>
          <p className="font-medium">{submission.effectiveDate}</p>
        </div>
        <div>
          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Expiration</p>
          <p className="font-medium">{submission.expirationDate}</p>
        </div>
      </div>
    </div>
  );
}

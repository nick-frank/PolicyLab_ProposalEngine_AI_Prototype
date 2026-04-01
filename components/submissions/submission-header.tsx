"use client";

import { PortalStatusBadge } from "./portal-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PortalSubmission } from "@/lib/types";
import { ArrowLeft, UserCircle, Calendar, RefreshCw, FileText, MapPin } from "lucide-react";
import Link from "next/link";

export function SubmissionHeader({
  submission,
  onChangeStatus,
  onGenerateProposal,
}: {
  submission: PortalSubmission;
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
          <p className="font-medium">{submission.assignedUnderwriter || "Unassigned"}</p>
        </div>
        {submission.approver && (
          <div>
            <p className="text-muted-foreground flex items-center gap-1"><UserCircle className="h-3 w-3" /> Approver</p>
            <p className="font-medium">{submission.approver}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Effective</p>
          <p className="font-medium">{submission.effectiveDate}</p>
        </div>
        <div>
          <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Expiration</p>
          <p className="font-medium">{submission.expirationDate}</p>
        </div>
      </div>

      {submission.primaryAddress && (
        <div className="text-sm">
          <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Primary Address</p>
          <p className="font-medium">{submission.primaryAddress}</p>
        </div>
      )}
    </div>
  );
}

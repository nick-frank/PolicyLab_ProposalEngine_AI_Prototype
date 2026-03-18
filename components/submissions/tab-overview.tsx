"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusTimeline } from "./status-timeline";
import type { PortalSubmission, PortalProposal, PortalStructuredField } from "@/lib/types";
import { FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  pending_approval: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  declined: "bg-red-50 text-red-700",
};

export function TabOverview({
  submission,
  proposals,
  structuredFields,
}: {
  submission: PortalSubmission;
  proposals: PortalProposal[];
  structuredFields: PortalStructuredField[];
}) {
  // Group key fields for summary
  const summaryFields = structuredFields.filter(
    (f) => f.fieldGroup === "Insured Information" || f.fieldGroup === "Operations"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Summary + Proposals */}
      <div className="lg:col-span-2 space-y-6">
        {/* Key Facts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Information</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryFields.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {summaryFields.map((f) => (
                  <div key={f.id}>
                    <p className="text-muted-foreground">{f.fieldName}</p>
                    <p className="font-medium">{f.override || f.extractedValue}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No extracted fields available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Proposals ({proposals.length})</CardTitle>
            <Button size="sm" variant="outline">
              <FileText className="h-4 w-4 mr-1" />
              Generate Proposal
            </Button>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No proposals yet.</p>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => (
                  <Link
                    key={p.id}
                    href={`/submissions/${submission.id}/proposals/${p.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{p.label}</span>
                          <Badge variant="outline" className="text-xs">v{p.version}</Badge>
                          <Badge
                            variant="outline"
                            className={PROPOSAL_STATUS_COLORS[p.status] || ""}
                          >
                            {p.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {p.createdDate} — {p.forms.length} forms
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">{formatCurrency(p.totalPremium)}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Timeline */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline entries={submission.timeline} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

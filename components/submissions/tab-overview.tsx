"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusTimeline } from "./status-timeline";
import { TabDocuments } from "./tab-documents";
import { TabNotesEmails } from "./tab-notes-emails";
import type { PortalSubmission, PortalProposal, PortalDocument, PortalNote } from "@/lib/types";
import { LocationMapDialog } from "@/components/shared/location-map-dialog";
import { FileText, ArrowRight, Copy, Trash2, GitCompareArrows, Bot, Lock, Sparkles, MapPin, MapPinCheck } from "lucide-react";
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
  documents = [],
  notes = [],
}: {
  submission: PortalSubmission;
  proposals: PortalProposal[];
  documents?: PortalDocument[];
  notes?: PortalNote[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mapAddress, setMapAddress] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 2) {
          next.add(id);
        }
      }
      return next;
    });
  };

  const handleDelete = () => {
    // Stub — would call API to delete selected proposals
  };

  const handleCopy = () => {
    // Stub — would call API to duplicate the selected proposal
  };

  const handleCompare = () => {
    // Stub — would navigate to a comparison view
    const ids = Array.from(selected);
    if (ids.length === 2) {
      // Future: router.push(`/submissions/${submission.id}/proposals/compare?a=${ids[0]}&b=${ids[1]}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Proposals + Documents */}
      <div className="lg:col-span-2 space-y-6">
        {/* Proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Proposals ({proposals.length})</CardTitle>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (() => {
                const selectedProposals = proposals.filter((p) => selected.has(p.id));
                const anyDeletable = selectedProposals.some((p) => !p.aiGenerated);
                return (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    {selected.size === 2 && (
                      <Button size="sm" variant="outline" onClick={handleCompare}>
                        <GitCompareArrows className="h-4 w-4 mr-1" />
                        Compare
                      </Button>
                    )}
                    {anyDeletable && (
                      <Button size="sm" variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </>
                );
              })()}
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                Generate Proposal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No proposals yet.</p>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => {
                  const isChecked = selected.has(p.id);
                  const isDisabled = !isChecked && selected.size >= 2;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isChecked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <div className="pt-0.5">
                        <Checkbox
                          checked={isChecked}
                          disabled={isDisabled}
                          onCheckedChange={() => toggleSelect(p.id)}
                        />
                      </div>
                      <Link
                        href={`/submissions/${submission.id}/proposals/${p.id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{p.label}</span>
                              <Badge variant="outline" className="text-xs">v{p.version}</Badge>
                              <Badge
                                variant="outline"
                                className={PROPOSAL_STATUS_COLORS[p.status] || ""}
                              >
                                {p.status.replace("_", " ")}
                              </Badge>
                              {p.aiGenerated && (
                                <Badge variant="secondary" className="text-xs bg-violet-50 text-violet-700 border-violet-200 gap-1">
                                  <Bot className="h-3 w-3" />
                                  AI Generated
                                  <Lock className="h-2.5 w-2.5 ml-0.5" />
                                </Badge>
                              )}
                            </div>
                            {p.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Created {p.createdDate} — {p.forms.length} forms
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 pt-0.5">
                            <span className="font-semibold text-sm">{formatCurrency(p.totalPremium)}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insured Locations */}
        {submission.insuredLocations && submission.insuredLocations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Insured Locations ({submission.insuredLocations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Reportable</TableHead>
                    <TableHead>Effective Start</TableHead>
                    <TableHead>Effective End</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submission.insuredLocations.map((loc, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{loc.address}</TableCell>
                      <TableCell>
                        {loc.type && <Badge variant="outline" className="text-xs">{loc.type}</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{loc.description || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={loc.reportable ? "bg-green-50 text-green-700 border-green-200 text-xs" : "bg-zinc-50 text-zinc-500 border-zinc-200 text-xs"}>
                          {loc.reportable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{loc.effectiveStart || "—"}</TableCell>
                      <TableCell className="text-sm">{loc.effectiveEnd || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => setMapAddress(loc.address)}
                          title="View on map"
                        >
                          <MapPinCheck className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <LocationMapDialog
          address={mapAddress ?? ""}
          open={mapAddress !== null}
          onOpenChange={(open) => { if (!open) setMapAddress(null); }}
        />

        {/* Documents */}
        <TabDocuments documents={documents} />

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline entries={submission.timeline} />
          </CardContent>
        </Card>
      </div>

      {/* Right: Summary + Notes */}
      <div className="space-y-6">
        {submission.submissionSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-violet-600" />
                Generative Submission Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{submission.submissionSummary}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-violet-600">
                <Bot className="h-3 w-3" />
                <span>AI-generated summary — read only</span>
              </div>
            </CardContent>
          </Card>
        )}

        <TabNotesEmails initialNotes={notes} />
      </div>
    </div>
  );
}

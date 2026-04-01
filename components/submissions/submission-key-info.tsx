"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PortalSubmission, PortalStructuredField } from "@/lib/types";
import { Building2, Mail, Phone, ExternalLink } from "lucide-react";

export function SubmissionKeyInfo({
  submission,
  structuredFields,
}: {
  submission: PortalSubmission;
  structuredFields: PortalStructuredField[];
}) {
  const summaryFields = structuredFields.filter(
    (f) => f.fieldGroup === "Insured Information" || f.fieldGroup === "Operations"
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Key Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {summaryFields.map((f) => (
                <div key={f.id}>
                  <p className="text-muted-foreground text-xs">{f.fieldName}</p>
                  <p className="font-medium">{f.override || f.extractedValue}</p>
                </div>
              ))}
              <div>
                <p className="text-muted-foreground text-xs">NAICS Code</p>
                <p className="font-medium">{submission.naicsCode} — {submission.naicsDescription}</p>
              </div>
              {submission.companyUrl && (
                <div>
                  <p className="text-muted-foreground text-xs">Company URL</p>
                  <a
                    href={submission.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {submission.companyUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Broker Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Broker Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Brokerage</p>
                <p className="font-medium">{submission.broker}</p>
              </div>
              {submission.brokerContact && (
                <div>
                  <p className="text-muted-foreground text-xs">Primary Broker</p>
                  <p className="font-medium">{submission.brokerContact}</p>
                </div>
              )}
              {submission.brokerEmail && (
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="font-medium">{submission.brokerEmail}</p>
                </div>
              )}
              {submission.brokerPhone && (
                <div>
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                  <p className="font-medium">{submission.brokerPhone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

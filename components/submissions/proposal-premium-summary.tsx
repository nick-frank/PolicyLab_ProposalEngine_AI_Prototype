"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PortalProposal } from "@/lib/types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function ProposalPremiumSummary({ proposal }: { proposal: PortalProposal }) {
  const totalDebits = proposal.forms.reduce(
    (sum, f) => sum + f.debitsCredits.filter((dc) => dc.type === "debit").reduce((s, dc) => s + dc.amount, 0),
    0
  );
  const totalCredits = proposal.forms.reduce(
    (sum, f) => sum + f.debitsCredits.filter((dc) => dc.type === "credit").reduce((s, dc) => s + dc.amount, 0),
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Premium Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Base Premium</span>
          <span className="font-medium">{formatCurrency(proposal.basePremium)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-red-600">Total Debits</span>
          <span className="font-medium text-red-600">+{formatCurrency(totalDebits)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-600">Total Credits</span>
          <span className="font-medium text-green-600">-{formatCurrency(totalCredits)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-sm font-bold">
          <span>Total Premium</span>
          <span>{formatCurrency(proposal.totalPremium)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Commission (15%)</span>
          <span>{formatCurrency(proposal.commission)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

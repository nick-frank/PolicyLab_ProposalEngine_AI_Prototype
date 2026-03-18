"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, FileText, Square, CheckSquare } from "lucide-react";
import type { ClaimSearchResult } from "@/lib/types";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-blue-50", text: "text-blue-700" },
  closed: { bg: "bg-zinc-50", text: "text-zinc-600" },
  reserved: { bg: "bg-amber-50", text: "text-amber-700" },
  litigation: { bg: "bg-red-50", text: "text-red-700" },
};

const CATEGORY_LABELS: Record<string, string> = {
  bodily_injury: "Bodily Injury",
  property_damage: "Property Damage",
  products_liability: "Products Liability",
  completed_operations: "Completed Operations",
  personal_injury: "Personal Injury",
  advertising_injury: "Advertising Injury",
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function HighlightedSnippet({
  text,
  start,
  end,
}: {
  text: string;
  start: number;
  end: number;
}) {
  if (start === 0 && end === 0) {
    return <span className="text-xs text-muted-foreground">{text}</span>;
  }
  return (
    <span className="text-xs text-muted-foreground">
      {text.slice(0, start)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </span>
  );
}

interface ClaimResultCardProps {
  result: ClaimSearchResult;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (claimId: string) => void;
}

export function ClaimResultCard({
  result,
  selectable,
  selected,
  onToggleSelect,
}: ClaimResultCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { claim, relevanceScore, matchedSnippet, highlightStart, highlightEnd } = result;
  const statusStyle = STATUS_COLORS[claim.status] || STATUS_COLORS.open;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border">
        <CollapsibleTrigger className="w-full text-left">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              {selectable && (
                <button
                  className="flex-shrink-0 mt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(claim.id);
                  }}
                >
                  {selected ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{claim.claimNumber}</span>
                  <Badge
                    variant="outline"
                    className={`${statusStyle.bg} ${statusStyle.text} text-xs`}
                  >
                    {claim.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[claim.category] || claim.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{claim.claimantName}</span>
                  <span>&middot;</span>
                  <span>{claim.dateOfLoss}</span>
                  <span>&middot;</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
                <HighlightedSnippet
                  text={matchedSnippet}
                  start={highlightStart}
                  end={highlightEnd}
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {Math.round(relevanceScore * 100)}%
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t px-4 pb-4 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Insured</span>
                <p className="font-medium">{claim.insuredName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">State</span>
                <p className="font-medium">{claim.state}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Incurred Amount</span>
                <p className="font-medium">{formatCurrency(claim.amount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Reserve Amount</span>
                <p className="font-medium">{formatCurrency(claim.reserveAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date of Loss</span>
                <p className="font-medium">{claim.dateOfLoss}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date Reported</span>
                <p className="font-medium">{claim.dateReported}</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-xs mt-0.5">{claim.description}</p>
            </div>

            {claim.notes.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Adjuster Notes</span>
                <ul className="mt-1 space-y-1">
                  {claim.notes.map((note, i) => (
                    <li key={i} className="text-xs pl-3 border-l-2 border-muted">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {claim.documents.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Documents</span>
                <div className="mt-1 space-y-1">
                  {claim.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-1.5 text-xs text-blue-700"
                    >
                      <FileText className="h-3 w-3" />
                      <span>{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {claim.associatedFormNumbers.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">Associated Forms</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {claim.associatedFormNumbers.map((form) => (
                    <Badge key={form} variant="outline" className="text-xs">
                      {form}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

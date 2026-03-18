"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ClaimSet, MockClaim } from "@/lib/types";
import { getSetTotalCost } from "@/lib/claim-sets";

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

interface ClaimSetListProps {
  claimSets: ClaimSet[];
  claimsMap: Map<string, MockClaim>;
  onSelectSet: (id: string) => void;
  onDeleteSet: (id: string) => void;
}

export function ClaimSetList({
  claimSets,
  claimsMap,
  onSelectSet,
  onDeleteSet,
}: ClaimSetListProps) {
  if (claimSets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
        <p className="text-sm text-muted-foreground">
          No claim sets yet. Select claims from search results to create a set.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {claimSets.map((set) => {
        const total = getSetTotalCost(set.claimIds, claimsMap);
        const allocSum = set.allocations.reduce((a, b) => a + b.percentage, 0);
        return (
          <Card
            key={set.id}
            className="cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => onSelectSet(set.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold truncate">{set.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {set.claimIds.length} claim{set.claimIds.length !== 1 ? "s" : ""} &middot;{" "}
                    {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {allocSum === 100
                      ? "Fully allocated"
                      : set.allocations.length === 0
                        ? "No allocations"
                        : `${allocSum}% allocated`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSet(set.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

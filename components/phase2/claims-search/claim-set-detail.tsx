"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  X,
  Pencil,
  Check,
  Search,
  SplitSquareHorizontal,
  ArrowRightToLine,
} from "lucide-react";
import type { ClaimSet, MockClaim } from "@/lib/types";
import {
  validateAllocationsSum,
  computeAllocatedAmounts,
  getSetTotalCost,
} from "@/lib/claim-sets";
import { FORMS_CATALOG, type FormsCatalogEntry } from "@/lib/mock-data/forms-catalog";

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

interface ClaimSetDetailProps {
  set: ClaimSet;
  claimsMap: Map<string, MockClaim>;
  onBack: () => void;
  onRename: (id: string, name: string) => void;
  onRemoveClaim: (setId: string, claimId: string) => void;
  onAddAllocation: (setId: string, formNumber: string, formName: string) => void;
  onRemoveAllocation: (setId: string, formNumber: string) => void;
  onUpdatePercentage: (setId: string, formNumber: string, pct: number) => void;
  onDistributeEvenly: (setId: string) => void;
  onFillRemaining: (setId: string, formNumber: string) => void;
}

export function ClaimSetDetail({
  set,
  claimsMap,
  onBack,
  onRename,
  onRemoveClaim,
  onAddAllocation,
  onRemoveAllocation,
  onUpdatePercentage,
  onDistributeEvenly,
  onFillRemaining,
}: ClaimSetDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(set.name);
  const [formSearch, setFormSearch] = useState("");
  const [showFormPicker, setShowFormPicker] = useState(false);

  const totalCost = getSetTotalCost(set.claimIds, claimsMap);
  const { sum, isValid, remaining } = validateAllocationsSum(set.allocations);
  const allocated = computeAllocatedAmounts(totalCost, set.allocations);

  const existingForms = new Set(set.allocations.map((a) => a.formNumber));
  const filteredForms = FORMS_CATALOG.filter(
    (f: FormsCatalogEntry) =>
      !existingForms.has(f.formNumber) &&
      (f.formNumber.toLowerCase().includes(formSearch.toLowerCase()) ||
        f.formName.toLowerCase().includes(formSearch.toLowerCase()))
  ).slice(0, 8);

  const progressColor =
    sum === 100 ? "bg-green-500" : sum > 100 ? "bg-red-500" : "bg-amber-500";

  const handleSaveName = () => {
    if (editName.trim()) onRename(set.id, editName.trim());
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none p-4 border-b space-y-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to sets
        </button>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-sm font-semibold"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleSaveName}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold truncate flex-1">{set.name}</h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setEditName(set.name);
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {set.claimIds.length} claim{set.claimIds.length !== 1 ? "s" : ""} &middot;{" "}
          Total: {formatCurrency(totalCost)}
        </p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Claims list */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Claims
          </h4>
          {set.claimIds.map((id) => {
            const claim = claimsMap.get(id);
            if (!claim) return null;
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-muted/50 group"
              >
                <div className="min-w-0">
                  <span className="text-xs font-medium">{claim.claimNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveClaim(set.id, id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Cost Allocation Editor */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Cost Allocation
          </h4>

          {/* Progress indicator */}
          {set.allocations.length > 0 && (
            <div className="space-y-1">
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor}`}
                  style={{ width: `${Math.min(sum, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {isValid
                  ? "100% — Fully allocated"
                  : sum > 100
                    ? `${sum}% — Over-allocated by ${sum - 100}%`
                    : `${sum}% allocated (${remaining}% remaining)`}
              </p>
            </div>
          )}

          {/* Form picker */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={formSearch}
                  onChange={(e) => {
                    setFormSearch(e.target.value);
                    setShowFormPicker(true);
                  }}
                  onFocus={() => setShowFormPicker(true)}
                  placeholder="Search forms to add..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
            {showFormPicker && formSearch && filteredForms.length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredForms.map((f: FormsCatalogEntry) => (
                  <button
                    key={f.formNumber}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                    onClick={() => {
                      onAddAllocation(set.id, f.formNumber, f.formName);
                      setFormSearch("");
                      setShowFormPicker(false);
                    }}
                  >
                    <span className="font-medium">{f.formNumber}</span>{" "}
                    <span className="text-muted-foreground">{f.formName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Distribute evenly */}
          {set.allocations.length >= 2 && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => onDistributeEvenly(set.id)}
            >
              <SplitSquareHorizontal className="h-3 w-3" />
              Distribute Evenly
            </Button>
          )}

          {/* Allocation rows */}
          <div className="space-y-2">
            {set.allocations.map((alloc) => (
              <div key={alloc.formNumber} className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs shrink-0 max-w-[120px] truncate">
                  {alloc.formNumber}
                </Badge>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={alloc.percentage}
                  onChange={(e) =>
                    onUpdatePercentage(set.id, alloc.formNumber, parseInt(e.target.value) || 0)
                  }
                  className="h-7 w-16 text-xs text-center"
                />
                <span className="text-xs text-muted-foreground">%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  title="Fill remaining"
                  onClick={() => onFillRemaining(set.id, alloc.formNumber)}
                >
                  <ArrowRightToLine className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveAllocation(set.id, alloc.formNumber)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Summary — only when exactly 100% */}
          {isValid && set.allocations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Cost Allocation Summary
                </h4>
                {allocated.map((row) => (
                  <div key={row.formNumber} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {row.formNumber}
                        </Badge>
                        <span className="text-muted-foreground">{row.percentage}%</span>
                      </div>
                      <span className="font-medium">{formatCurrency(row.amount)}</span>
                    </div>
                    <Progress value={row.percentage} className="h-1.5" />
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </>
          )}

          {/* Note when not fully allocated */}
          {!isValid && set.allocations.length > 0 && (
            <p className="text-xs text-muted-foreground italic">
              Allocations must sum to 100% to see the cost summary.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

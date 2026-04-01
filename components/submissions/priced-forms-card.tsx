"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FileText, Search, Trash2, Plus, ChevronDown, X, ClipboardEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmissionForm, SubmissionFormType, SubmissionFormAdjustment } from "@/lib/types";
import { FORMS_CATALOG } from "@/lib/mock-data";

const TYPE_CONFIG: Record<SubmissionFormType, { label: string; className: string }> = {
  policy: { label: "Policy", className: "bg-gray-100 text-gray-700" },
  coverage: { label: "Coverage", className: "bg-blue-100 text-blue-700" },
  endorsement: { label: "Endorsement", className: "bg-purple-100 text-purple-700" },
  exclusion: { label: "Exclusion", className: "bg-red-100 text-red-700" },
  notice: { label: "Notice", className: "bg-amber-100 text-amber-700" },
};

function netAdjustment(adjustments?: SubmissionFormAdjustment[]): number {
  if (!adjustments || adjustments.length === 0) return 0;
  return adjustments.reduce(
    (sum, a) => sum + (a.type === "credit" ? -a.amount : a.amount),
    0,
  );
}

function fmtCurrency(val: number): string {
  const abs = Math.abs(val);
  const formatted = abs.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (val < 0) return `(${formatted})`;
  if (val > 0) return `+${formatted}`;
  return "—";
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

let nextId = 5000;
function uid() {
  return `pf-gen-${nextId++}`;
}

export function PricedFormsCard({
  forms: initialForms,
  readOnly = false,
  onTotalChange,
}: {
  forms: SubmissionForm[];
  readOnly?: boolean;
  onTotalChange?: (total: number) => void;
}) {
  const [forms, setForms] = useState<SubmissionForm[]>(initialForms);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [fillInExpanded, setFillInExpanded] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [newAdj, setNewAdj] = useState<Record<string, { description: string; type: "debit" | "credit"; amount: string }>>({});

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const totalAdj = useMemo(() => {
    return forms.reduce((sum, f) => sum + netAdjustment(f.adjustments), 0);
  }, [forms]);

  // Notify parent of total changes
  useEffect(() => {
    onTotalChange?.(totalAdj);
  }, [totalAdj, onTotalChange]);

  // Only show catalog entries that have adjustments defined or are endorsement/exclusion type (likely to have pricing)
  const existingNumbers = new Set(forms.map((f) => f.formNumber));
  const filtered = searchQuery.trim().length > 0
    ? FORMS_CATALOG.filter(
        (c) =>
          !existingNumbers.has(c.formNumber) &&
          (c.type === "endorsement" || c.type === "exclusion") &&
          (c.formNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.formName.toLowerCase().includes(searchQuery.toLowerCase())),
      ).slice(0, 10)
    : [];

  function addForm(entry: (typeof FORMS_CATALOG)[number]) {
    const newForm: SubmissionForm = {
      id: uid(),
      formNumber: entry.formNumber,
      edition: entry.edition,
      formName: entry.formName,
      type: entry.type,
      category: entry.category,
      adjustments: [],
    };
    setForms((prev) => [...prev, newForm]);
    setSearchQuery("");
    setShowDropdown(false);
  }

  function removeForm(id: string) {
    setForms((prev) => prev.filter((f) => f.id !== id));
    setExpanded((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setFillInExpanded((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function toggleFillIn(id: string) {
    setFillInExpanded((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function addAdjustment(formId: string) {
    const adj = newAdj[formId];
    if (!adj || !adj.description.trim() || !adj.amount) return;
    const amount = parseFloat(adj.amount);
    if (isNaN(amount) || amount <= 0) return;
    const newAdjustment: SubmissionFormAdjustment = {
      id: uid(),
      description: adj.description.trim(),
      type: adj.type,
      amount,
    };
    setForms((prev) =>
      prev.map((f) =>
        f.id === formId ? { ...f, adjustments: [...(f.adjustments || []), newAdjustment] } : f,
      ),
    );
    setNewAdj((prev) => ({ ...prev, [formId]: { description: "", type: "debit", amount: "" } }));
  }

  function removeAdjustment(formId: string, adjId: string) {
    setForms((prev) =>
      prev.map((f) =>
        f.id === formId ? { ...f, adjustments: (f.adjustments || []).filter((a) => a.id !== adjId) } : f,
      ),
    );
  }

  function updateFillIn(formId: string, fillInId: string, value: string) {
    setForms((prev) =>
      prev.map((f) => {
        if (f.id !== formId) return f;
        return { ...f, fillIns: (f.fillIns || []).map((fi) => fi.id === fillInId ? { ...fi, value } : fi) };
      }),
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Priced Forms
          </CardTitle>
          <span className="text-sm text-muted-foreground">{forms.length} forms</span>
        </div>
        {!readOnly && (
          <div ref={searchRef} className="relative mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search priced forms to add (endorsements & exclusions)..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            {showDropdown && filtered.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-64 overflow-y-auto">
                {filtered.map((entry) => {
                  const typeConfig = TYPE_CONFIG[entry.type];
                  return (
                    <button
                      key={entry.formNumber}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent text-sm"
                      onClick={() => addForm(entry)}
                    >
                      <span className="font-mono shrink-0 w-28">{entry.formNumber}</span>
                      <span className="truncate flex-1">{entry.formName}</span>
                      <Badge variant="outline" className={cn(typeConfig.className, "text-xs shrink-0")}>{typeConfig.label}</Badge>
                      <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
            {showDropdown && searchQuery.trim().length > 0 && filtered.length === 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3 text-sm text-muted-foreground">
                No matching forms found.
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No priced forms. Search above to add endorsements or exclusions.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Form Number</TableHead>
                <TableHead>Edition</TableHead>
                <TableHead>Form Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Adj. (Net)</TableHead>
                <TableHead className="w-20 text-center">Form Fill</TableHead>
                {!readOnly && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => {
                const typeConfig = TYPE_CONFIG[form.type];
                const net = netAdjustment(form.adjustments);
                const isExpanded = expanded.has(form.id);
                const isFillInOpen = fillInExpanded.has(form.id);
                const hasFillIns = (form.fillIns?.length ?? 0) > 0;
                const adjState = newAdj[form.id] || { description: "", type: "debit" as const, amount: "" };

                return (
                  <Collapsible key={form.id} open={isExpanded} onOpenChange={() => toggleExpanded(form.id)} asChild>
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer hover:bg-muted/20">
                          <TableCell className="w-8 pr-0">
                            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                          </TableCell>
                          <TableCell className="font-mono text-sm">{form.formNumber}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{form.edition}</TableCell>
                          <TableCell>
                            <div>
                              <span className="text-sm">{form.formName}</span>
                              {form.description && <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(typeConfig.className, "text-xs")}>{typeConfig.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {net !== 0 && (
                              <span className={cn("text-sm font-medium", net > 0 ? "text-red-600" : "text-green-600")}>{fmtCurrency(net)}</span>
                            )}
                            {net === 0 && (form.adjustments?.length ?? 0) === 0 && <span className="text-sm text-muted-foreground">—</span>}
                            {net === 0 && (form.adjustments?.length ?? 0) > 0 && <span className="text-sm text-muted-foreground">$0</span>}
                          </TableCell>
                          <TableCell className="w-20 text-center">
                            {hasFillIns && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn("h-7 px-2 gap-1 text-xs", isFillInOpen ? "text-primary" : "text-muted-foreground hover:text-primary")}
                                onClick={(e) => { e.stopPropagation(); toggleFillIn(form.id); }}
                              >
                                <ClipboardEdit className="h-3.5 w-3.5" />
                                <ChevronDown className={cn("h-3 w-3 transition-transform", isFillInOpen && "rotate-180")} />
                              </Button>
                            )}
                          </TableCell>
                          {!readOnly && (
                            <TableCell className="w-12">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); removeForm(form.id); }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      </CollapsibleTrigger>

                      {/* Form Fill-in section */}
                      {isFillInOpen && hasFillIns && (form.fillIns || []).map((fi) => {
                        const isPct = /percent/i.test(fi.label) || /%/.test(fi.label);
                        return (
                          <TableRow key={fi.id} className="bg-indigo-50/40">
                            <TableCell />
                            <TableCell />
                            <TableCell colSpan={2} className="text-sm">
                              <label className="text-xs text-muted-foreground block mb-1">{fi.label}</label>
                              {readOnly ? (
                                <span className="text-sm font-medium">{fi.value}{isPct && !fi.value.includes("%") ? "%" : ""}</span>
                              ) : (
                                <div className="flex items-center gap-1 max-w-xs">
                                  <Input
                                    type={isPct ? "number" : "text"}
                                    min={isPct ? 0 : undefined}
                                    max={isPct ? 100 : undefined}
                                    value={fi.value.replace(/%$/, "")}
                                    onChange={(e) => updateFillIn(form.id, fi.id, e.target.value)}
                                    className="h-8 text-sm"
                                  />
                                  {isPct && <span className="text-sm font-medium text-muted-foreground shrink-0">%</span>}
                                </div>
                              )}
                            </TableCell>
                            <TableCell />
                            <TableCell />
                            <TableCell />
                            {!readOnly && <TableCell />}
                          </TableRow>
                        );
                      })}

                      <CollapsibleContent asChild>
                        <>
                          {/* Existing adjustments */}
                          {(form.adjustments || []).map((adj) => (
                            <TableRow key={adj.id} className="bg-muted/10">
                              <TableCell />
                              <TableCell />
                              <TableCell colSpan={2} className="text-sm">{adj.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", adj.type === "debit" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200")}>
                                  {adj.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={cn("text-sm font-medium", adj.type === "debit" ? "text-red-600" : "text-green-600")}>
                                  {adj.type === "credit" ? "-" : "+"}${adj.amount.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell />
                              {!readOnly && (
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeAdjustment(form.id, adj.id)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                          {/* Add adjustment row */}
                          {!readOnly && (
                            <TableRow className="bg-muted/10">
                              <TableCell />
                              <TableCell />
                              <TableCell colSpan={2}>
                                <Input
                                  placeholder="Adjustment description..."
                                  className="h-8 text-sm"
                                  value={adjState.description}
                                  onChange={(e) => setNewAdj((prev) => ({ ...prev, [form.id]: { ...adjState, description: e.target.value } }))}
                                />
                              </TableCell>
                              <TableCell>
                                <button
                                  className={cn(
                                    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors cursor-pointer",
                                    adjState.type === "debit" ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
                                  )}
                                  onClick={() => setNewAdj((prev) => ({ ...prev, [form.id]: { ...adjState, type: adjState.type === "debit" ? "credit" : "debit" } }))}
                                >
                                  {adjState.type}
                                </button>
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="$0"
                                  className="h-8 text-sm text-right w-24 ml-auto"
                                  type="number"
                                  min="0"
                                  value={adjState.amount}
                                  onChange={(e) => setNewAdj((prev) => ({ ...prev, [form.id]: { ...adjState, amount: e.target.value } }))}
                                />
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => addAdjustment(form.id)} disabled={!adjState.description.trim() || !adjState.amount}>
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                              {!readOnly && <TableCell />}
                            </TableRow>
                          )}
                        </>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
              <TableRow className="border-t-2">
                <TableCell />
                <TableCell colSpan={4} className="text-right font-medium text-sm">Total Form Adjustments</TableCell>
                <TableCell className="text-right font-bold text-sm">
                  <span className={totalAdj > 0 ? "text-red-600" : totalAdj < 0 ? "text-green-600" : ""}>
                    {totalAdj > 0 ? "+" : ""}{fmt(totalAdj)}
                  </span>
                </TableCell>
                <TableCell />
                {!readOnly && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

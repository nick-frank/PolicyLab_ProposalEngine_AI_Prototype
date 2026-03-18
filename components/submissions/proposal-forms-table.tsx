"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { PortalForm } from "@/lib/types";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const FORM_TYPE_COLORS: Record<string, string> = {
  coverage: "bg-blue-50 text-blue-700",
  endorsement: "bg-purple-50 text-purple-700",
  exclusion: "bg-red-50 text-red-700",
};

export function ProposalFormsTable({ forms }: { forms: PortalForm[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const netImpact = (form: PortalForm) => {
    return form.debitsCredits.reduce((sum, dc) => {
      return sum + (dc.type === "debit" ? dc.amount : -dc.amount);
    }, 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Forms & Adjustments</CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Add Form
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Form #</TableHead>
              <TableHead>Form Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default Adj.</TableHead>
              <TableHead>Custom Adj.</TableHead>
              <TableHead>Net Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => {
              const isExpanded = expandedIds.has(form.id);
              const impact = netImpact(form);

              return (
                <Collapsible key={form.id} asChild open={isExpanded} onOpenChange={() => toggleExpand(form.id)}>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          {form.debitsCredits.length > 0 && (
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{form.formNumber}</TableCell>
                        <TableCell className="text-sm">{form.formName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("text-xs", FORM_TYPE_COLORS[form.type])}>
                            {form.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {form.defaultAdjustment !== 0 ? `${form.defaultAdjustment > 0 ? "+" : ""}${form.defaultAdjustment}%` : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {form.customAdjustment !== 0 ? `${form.customAdjustment > 0 ? "+" : ""}${form.customAdjustment}%` : "—"}
                        </TableCell>
                        <TableCell className={cn("text-sm font-medium", impact > 0 ? "text-red-600" : impact < 0 ? "text-green-600" : "")}>
                          {impact !== 0 ? formatCurrency(impact) : "—"}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    {form.debitsCredits.length > 0 && (
                      <CollapsibleContent asChild>
                        <>
                          {form.debitsCredits.map((dc) => (
                            <TableRow key={dc.id} className="bg-muted/20">
                              <TableCell />
                              <TableCell />
                              <TableCell colSpan={3} className="text-sm text-muted-foreground pl-8">
                                {dc.description}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", dc.type === "debit" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                  {dc.type}
                                </Badge>
                              </TableCell>
                              <TableCell className={cn("text-sm", dc.type === "debit" ? "text-red-600" : "text-green-600")}>
                                {dc.type === "credit" ? "-" : "+"}{formatCurrency(dc.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      </CollapsibleContent>
                    )}
                  </>
                </Collapsible>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

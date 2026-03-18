"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfidenceScore } from "@/components/shared/confidence-score";
import type { PortalStructuredField } from "@/lib/types";
import { ChevronDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export function TabStructuredData({ initialFields }: { initialFields: PortalStructuredField[] }) {
  const [fields, setFields] = useState(initialFields);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["Insured Information", "Operations", "Coverage", "Locations"]));

  const groups = useMemo(() => {
    const map: Record<string, PortalStructuredField[]> = {};
    for (const f of fields) {
      if (!map[f.fieldGroup]) map[f.fieldGroup] = [];
      map[f.fieldGroup].push(f);
    }
    return map;
  }, [fields]);

  const toggleGroup = (group: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleOverride = (id: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, override: value || undefined } : f))
    );
  };

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No structured data available.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groups).map(([group, groupFields]) => (
          <Collapsible key={group} open={openGroups.has(group)} onOpenChange={() => toggleGroup(group)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{group} ({groupFields.length})</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups.has(group) && "rotate-180")} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Extracted Value</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Override</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupFields.map((field) => (
                        <TableRow key={field.id}>
                          <TableCell className="text-sm font-medium">{field.fieldName}</TableCell>
                          <TableCell className="text-sm">{field.extractedValue}</TableCell>
                          <TableCell>
                            <ConfidenceScore score={field.confidence} showBar size="sm" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {field.override !== undefined && (
                                <Pencil className="h-3 w-3 text-amber-500" />
                              )}
                              <Input
                                value={field.override || ""}
                                onChange={(e) => handleOverride(field.id, e.target.value)}
                                placeholder="—"
                                className="w-40 h-8 text-sm"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))
      )}
    </div>
  );
}

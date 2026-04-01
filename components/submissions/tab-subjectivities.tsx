"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ClipboardCheck, ClipboardEdit, Plus, Trash2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubjectivityFillIn {
  id: string;
  label: string;
  value: string;
}

export interface Subjectivity {
  id: string;
  text: string;
  checked: boolean;
  custom: boolean;
  fillIns?: SubjectivityFillIn[];
}

const DEFAULT_SUBJECTIVITIES: Subjectivity[] = [
  { id: "sub-1", text: "Completed, signed, and dated Acord application", checked: true, custom: false },
  { id: "sub-2", text: "Completed, signed, and dated Supplemental application", checked: true, custom: false },
  { id: "sub-3", text: "Signed hard copy, currently valued carrier loss runs evidencing date received", checked: false, custom: false,
    fillIns: [
      { id: "fi-3a", label: "Date received", value: "" },
    ],
  },
  { id: "sub-4", text: "Receipt of five (5) year claims/loss history/listing data as of ___", checked: false, custom: false,
    fillIns: [
      { id: "fi-4a", label: "As of date", value: "" },
    ],
  },
  { id: "sub-5", text: "Copy of executed subcontractor agreement confirming CG limit requirements, indemnification, AI to the insured's favor (both GL/WC), and AI to the insured's favor", checked: false, custom: false,
    fillIns: [
      { id: "fi-5a", label: "CG limit requirement amount", value: "" },
      { id: "fi-5b", label: "Additional insured endorsement form number", value: "" },
    ],
  },
  { id: "sub-6", text: "Completed driver and vehicle listing form per form letter", checked: false, custom: false },
  { id: "sub-7", text: "Product labels, brochures, etc.", checked: false, custom: false },
  { id: "sub-8", text: "Certificates of Insurance for all subcontractors", checked: false, custom: false,
    fillIns: [
      { id: "fi-8a", label: "Minimum required CGL limit", value: "" },
      { id: "fi-8b", label: "Minimum required WC limit", value: "" },
    ],
  },
  { id: "sub-9", text: "Copy of geotechnical report", checked: false, custom: false },
  { id: "sub-10", text: "Insured will comply with all recommendations on the geotechnical report", checked: false, custom: false },
  { id: "sub-11", text: "PRIOR TO BINDING*: Copy of executed subcontractor agreement confirming CG limit requirements, indemnification, AI to the insured's favor (both GL/WC), and acceptance of all subcontracted work", checked: false, custom: false,
    fillIns: [
      { id: "fi-11a", label: "Binding deadline date", value: "" },
      { id: "fi-11b", label: "CG limit requirement amount", value: "" },
    ],
  },
  { id: "sub-12", text: "BINDING: Any injury to subcontractor employees or to residential homeowner/tenant deficiencies will be accepted", checked: false, custom: false },
];

let nextId = 100;

export function TabSubjectivities({
  initialSubjectivities,
  onSubjectivitiesChange,
  readOnly = false,
}: {
  initialSubjectivities?: Subjectivity[];
  onSubjectivitiesChange?: (subjectivities: Subjectivity[]) => void;
  readOnly?: boolean;
}) {
  const [subjectivities, setSubjectivities] = useState<Subjectivity[]>(
    initialSubjectivities ?? DEFAULT_SUBJECTIVITIES,
  );
  const [newText, setNewText] = useState("");
  const [fillInExpanded, setFillInExpanded] = useState<Set<string>>(new Set());

  const update = useCallback(
    (updated: Subjectivity[]) => {
      setSubjectivities(updated);
      onSubjectivitiesChange?.(updated);
    },
    [onSubjectivitiesChange],
  );

  const toggleItem = (id: string) => {
    update(
      subjectivities.map((s) =>
        s.id === id ? { ...s, checked: !s.checked } : s,
      ),
    );
  };

  const toggleFillIn = (id: string) => {
    setFillInExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateFillIn = (subId: string, fillInId: string, value: string) => {
    update(
      subjectivities.map((s) => {
        if (s.id !== subId) return s;
        return {
          ...s,
          fillIns: (s.fillIns || []).map((fi) =>
            fi.id === fillInId ? { ...fi, value } : fi,
          ),
        };
      }),
    );
  };

  const addCustom = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    update([
      ...subjectivities,
      { id: `sub-custom-${++nextId}`, text: trimmed, checked: true, custom: true },
    ]);
    setNewText("");
  };

  const removeCustom = (id: string) => {
    update(subjectivities.filter((s) => s.id !== id));
  };

  const checkedCount = subjectivities.filter((s) => s.checked).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-1">
          <ClipboardCheck className="h-4 w-4" />
          Quote Subjectivities
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {checkedCount} of {subjectivities.length} selected
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Select subjectivities to apply to quote. Any item(s) can be removed.
        </p>

        {/* Subjectivity list */}
        <div className="space-y-2">
          {subjectivities.map((sub) => {
            const hasFillIns = (sub.fillIns?.length ?? 0) > 0;
            const isFillInOpen = fillInExpanded.has(sub.id);

            return (
              <div key={sub.id}>
                <div
                  className={`flex items-start gap-3 rounded-md border px-3 py-2 ${
                    sub.checked ? "bg-background" : "bg-muted/30 opacity-70"
                  } ${hasFillIns && isFillInOpen ? "rounded-b-none border-b-0" : ""}`}
                >
                  <Checkbox
                    checked={sub.checked}
                    onCheckedChange={() => toggleItem(sub.id)}
                    disabled={readOnly}
                    className="mt-0.5"
                  />
                  <span className="text-sm flex-1 leading-relaxed">{sub.text}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasFillIns && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7",
                          isFillInOpen ? "text-primary" : "text-muted-foreground hover:text-primary",
                        )}
                        onClick={() => toggleFillIn(sub.id)}
                        title="Fill-in fields"
                      >
                        <ClipboardEdit className="h-3.5 w-3.5" />
                        <ChevronDown
                          className={cn(
                            "h-3 w-3 transition-transform",
                            isFillInOpen && "rotate-180",
                          )}
                        />
                      </Button>
                    )}
                    {sub.custom && !readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCustom(sub.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Fill-in fields */}
                {hasFillIns && isFillInOpen && (
                  <div className="rounded-b-md border border-t-0 bg-indigo-50/40 px-4 py-3 space-y-3">
                    {(sub.fillIns || []).map((fi) => (
                      <div key={fi.id}>
                        <label className="text-xs text-muted-foreground block mb-1">{fi.label}</label>
                        {readOnly ? (
                          <span className="text-sm font-medium">{fi.value || "—"}</span>
                        ) : (
                          <Input
                            type="text"
                            value={fi.value}
                            onChange={(e) => updateFillIn(sub.id, fi.id, e.target.value)}
                            placeholder={`Enter ${fi.label.toLowerCase()}...`}
                            className="h-8 text-sm max-w-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add custom subjectivity */}
        {!readOnly && (
          <div className="flex gap-2">
            <Input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a custom subjectivity..."
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustom();
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={addCustom}
              disabled={!newText.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

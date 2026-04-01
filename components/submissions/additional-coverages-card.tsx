"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layers, ChevronDown } from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  unselected: "Unselected",
  add: "Add",
  offer_add_on: "Offer Add-on",
};

interface AdditionalCoverageItem {
  id: string;
  description: string;
  forms: string[];
  ratingBasisOptions: string[];
  selectedRatingBasis: string;
  amount: string;
  note?: string;
  action: "unselected" | "add" | "offer_add_on";
}

interface AdditionalCoverageSection {
  id: string;
  title: string;
  items: AdditionalCoverageItem[];
}

const INITIAL_SECTIONS: AdditionalCoverageSection[] = [
  {
    id: "excess",
    title: "Excess",
    items: [
      {
        id: "exc-1",
        description: "Contractor's Job Site Limited Pollution Coverage",
        forms: ["MEGL 1284 05 17"],
        ratingBasisOptions: [
          "$250,000/$250,000",
          "$500,000/$500,000",
          "$1,000,000/$1,000,000",
          "$2,000,000/$2,000,000",
          "$5,000,000/$5,000,000",
        ],
        selectedRatingBasis: "$250,000/$250,000",
        amount: "$4,500",
        note: "3% of class premium subject to a $150 minimum premium",
        action: "unselected",
      },
    ],
  },
  {
    id: "inland-marine",
    title: "Inland Marine",
    items: [
      {
        id: "im-1",
        description: "Contractors Inland Marine Advantage Coverage",
        forms: ["MEIM 5340 02 22", "MEIM 5012 05 11"],
        ratingBasisOptions: [
          "$5,000/$10,000/$5,000",
          "$5,000/$10,000/$10,000",
          "$10,000/$20,000/$10,000",
        ],
        selectedRatingBasis: "$5,000/$10,000/$5,000",
        amount: "$2,750",
        note: "There are two options available to provide limits for contractor's equipment, employee tools/clothing, installation property and miscellaneous property. Prior to selection, please review the limits offered for each option and the associated premium charge.",
        action: "unselected",
      },
    ],
  },
];

export function AdditionalCoveragesCard({ readOnly = false }: { readOnly?: boolean }) {
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    excess: false,
    "inland-marine": false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const updateAction = (sectionId: string, itemId: string, value: AdditionalCoverageItem["action"]) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, action: value } : i)) }
          : s,
      ),
    );
  };

  const updateRatingBasis = (sectionId: string, itemId: string, value: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, selectedRatingBasis: value } : i)) }
          : s,
      ),
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-1">
          <Layers className="h-4 w-4" />
          Additional Coverages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sections.map((section) => {
          const expanded = expandedSections[section.id];
          return (
            <div key={section.id} className="border rounded-lg">
              <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
              {expanded && (
                <div className="px-4 pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Forms</TableHead>
                        <TableHead className="w-52">Rating Basis</TableHead>
                        <TableHead className="w-20 text-center">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.items.map((item) => (
                        <TableRow key={item.id} className={item.action === "unselected" ? "opacity-70" : ""}>
                          <TableCell>
                            {readOnly ? (
                              <span className="text-sm">{ACTION_LABELS[item.action]}</span>
                            ) : (
                              <Select
                                value={item.action}
                                onValueChange={(v) => updateAction(section.id, item.id, v as AdditionalCoverageItem["action"])}
                              >
                                <SelectTrigger className="h-8 text-sm w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unselected">Unselected</SelectItem>
                                  <SelectItem value="add">Add</SelectItem>
                                  <SelectItem value="offer_add_on">Offer Add-on</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.description}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {item.forms.map((form) => (
                                <div key={form} className="text-xs text-muted-foreground font-mono">
                                  {form}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {readOnly ? (
                              <span className="text-sm">{item.selectedRatingBasis}</span>
                            ) : (
                              <Select
                                value={item.selectedRatingBasis}
                                onValueChange={(v) => updateRatingBasis(section.id, item.id, v)}
                              >
                                <SelectTrigger className="h-8 text-sm w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {item.ratingBasisOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {item.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {section.items.some((i) => i.note) && (
                    <div className="mt-3">
                      {section.items
                        .filter((i) => i.note)
                        .map((i) => (
                          <p key={i.id} className="text-xs text-muted-foreground italic leading-relaxed">
                            {i.note}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

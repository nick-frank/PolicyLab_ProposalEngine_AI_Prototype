"use client";

import { useState } from "react";
import { CLAUSE_DELTAS } from "@/lib/mock-data";
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { ClauseDeltaCard } from "@/components/phase2/clause-delta-card";
import { ClauseDeltaTable } from "@/components/phase2/clause-delta-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List } from "lucide-react";
import type { FilterConfig } from "@/lib/types";
import { COVERAGE_TYPES } from "@/lib/constants";

const filters: FilterConfig[] = [
  {
    key: "direction",
    label: "Direction",
    options: [
      { value: "tighter", label: "Kinsale Tighter" },
      { value: "broader", label: "P&C Commercial Broader" },
      { value: "neutral", label: "Neutral" },
    ],
  },
  {
    key: "severity",
    label: "Severity",
    options: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
  {
    key: "mechanism",
    label: "Mechanism",
    options: [
      { value: "exclusion", label: "Exclusion" },
      { value: "condition", label: "Condition" },
      { value: "definition_narrowing", label: "Definition Narrowing" },
      { value: "sublimit", label: "Sublimit" },
      { value: "trigger", label: "Trigger" },
    ],
  },
  {
    key: "coverageType",
    label: "Coverage",
    options: COVERAGE_TYPES.map((ct) => ({ value: ct, label: ct })),
  },
];

export default function ClauseDeltasPage() {
  const [view, setView] = useState<string>("grid");

  const {
    searchTerm,
    onSearchChange,
    activeFilters,
    onFilterChange,
    onClearFilters,
    filtered,
    resultCount,
  } = useFilterState(CLAUSE_DELTAS, ["title", "naicsCode", "naicsDescription", "coverageType"]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clause Deltas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Side-by-side policy language comparison between P&C Commercial and Kinsale
          </p>
        </div>
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v)}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <FilterToolbar
        filters={filters}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        searchPlaceholder="Search clause deltas..."
        resultCount={resultCount}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No clause deltas found"
          description="Try adjusting your search or filter criteria."
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((delta) => (
            <ClauseDeltaCard key={delta.id} delta={delta} />
          ))}
        </div>
      ) : (
        <ClauseDeltaTable deltas={filtered} />
      )}
    </div>
  );
}

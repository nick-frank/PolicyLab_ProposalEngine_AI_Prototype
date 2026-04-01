"use client";

import { SCENARIOS } from "@/lib/mock-data";
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { ScenarioCard } from "@/components/phase2/scenario-card";
import { RegressionTestSummary } from "@/components/phase2/regression-test-summary";
import { EmptyState } from "@/components/shared/empty-state";
import type { FilterConfig } from "@/lib/types";

const filters: FilterConfig[] = [
  {
    key: "coverageType",
    label: "Coverage",
    options: [
      { value: "General Liability", label: "General Liability" },
      { value: "Cyber Liability", label: "Cyber Liability" },
      { value: "Employment Practices", label: "Employment Practices" },
      { value: "Umbrella/Excess", label: "Umbrella/Excess" },
      { value: "Professional Liability", label: "Professional Liability" },
    ],
  },
  {
    key: "regressionStatus",
    label: "Status",
    options: [
      { value: "pass", label: "Pass" },
      { value: "fail", label: "Fail" },
      { value: "warning", label: "Warning" },
    ],
  },
];

export default function ScenarioChecksPage() {
  const {
    searchTerm,
    onSearchChange,
    activeFilters,
    onFilterChange,
    onClearFilters,
    filtered,
    resultCount,
  } = useFilterState(SCENARIOS, ["title", "coverageType", "narrative"]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scenario Checks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Claim vignette analysis comparing P&C Commercial and Kinsale coverage outcomes
        </p>
      </div>

      <RegressionTestSummary scenarios={SCENARIOS} />

      <FilterToolbar
        filters={filters}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        searchPlaceholder="Search scenarios..."
        resultCount={resultCount}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No scenarios found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}

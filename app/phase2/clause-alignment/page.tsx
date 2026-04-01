"use client";

import { ALIGNMENTS } from "@/lib/mock-data";
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { AlignmentMatchCard } from "@/components/phase2/alignment-match-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { FilterConfig } from "@/lib/types";

const filters: FilterConfig[] = [
  {
    key: "matchType",
    label: "Match Type",
    options: [
      { value: "one_to_one", label: "1:1 Match" },
      { value: "one_to_many", label: "1:N Match" },
      { value: "unmatched", label: "Unmatched" },
    ],
  },
];

export default function ClauseAlignmentPage() {
  const {
    searchTerm,
    onSearchChange,
    activeFilters,
    onFilterChange,
    onClearFilters,
    filtered,
    resultCount,
  } = useFilterState(ALIGNMENTS, ["matchType" as keyof (typeof ALIGNMENTS)[0]]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clause Alignment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Mapping between P&C Commercial and Kinsale clause structures using retrieval and reranking
        </p>
      </div>

      <FilterToolbar
        filters={filters}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        searchPlaceholder="Search alignments..."
        resultCount={resultCount}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No alignments found"
          description="Try adjusting your filter criteria."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((alignment) => (
            <AlignmentMatchCard key={alignment.id} alignment={alignment} />
          ))}
        </div>
      )}
    </div>
  );
}

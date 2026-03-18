"use client";
import { useState, useMemo, useCallback } from "react";

/**
 * Manages filter + search state for list views.
 * Returns everything the <FilterToolbar /> component needs,
 * plus a generic `apply` function callers can use to filter any array.
 */
export function useFilterState<T>(items: T[], searchKeys: (keyof T)[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const onFilterChange = useCallback((key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onClearFilters = useCallback(() => {
    setSearchTerm("");
    setActiveFilters({});
  }, []);

  const filtered = useMemo(() => {
    let result = items;

    // Text search across specified keys
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          return typeof val === "string" && val.toLowerCase().includes(lower);
        })
      );
    }

    // Apply dropdown filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const field = (item as Record<string, unknown>)[key];
          return String(field) === value;
        });
      }
    }

    return result;
  }, [items, searchTerm, activeFilters, searchKeys]);

  return {
    searchTerm,
    onSearchChange: setSearchTerm,
    activeFilters,
    onFilterChange,
    onClearFilters,
    filtered,
    resultCount: filtered.length,
  };
}

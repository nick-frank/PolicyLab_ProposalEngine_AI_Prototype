"use client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { FilterConfig } from "@/lib/types";

export function FilterToolbar({ filters, searchTerm, onSearchChange, activeFilters, onFilterChange, onClearFilters, searchPlaceholder = "Search...", resultCount }: {
  filters: FilterConfig[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
  resultCount?: number;
}) {
  const hasActiveFilters = searchTerm || Object.values(activeFilters).some((v) => v && v !== "all");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-64"
      />
      {filters.map((f) => (
        <Select
          key={f.key}
          value={activeFilters[f.key] || "all"}
          onValueChange={(val) => onFilterChange(f.key, val)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {f.label}</SelectItem>
            {f.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      )}
      {resultCount !== undefined && (
        <Badge variant="secondary" className="ml-auto">{resultCount} results</Badge>
      )}
    </div>
  );
}

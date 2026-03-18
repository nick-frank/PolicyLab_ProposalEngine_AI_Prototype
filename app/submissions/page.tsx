"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PORTAL_SUBMISSIONS, PORTAL_PROPOSALS } from "@/lib/mock-data";
import { PORTAL_STATUS_CONFIG } from "@/lib/constants";
import { useFilterState } from "@/hooks/use-filter-state";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatCard } from "@/components/shared/stat-card";
import { PortalStatusBadge } from "@/components/submissions/portal-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { PortalSubmissionStatus, FilterConfig } from "@/lib/types";
import { ClipboardList, FileText, FolderOpen, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_STATUSES: PortalSubmissionStatus[] = [
  "received", "open", "under_review", "proposal_produced", "bound", "declined", "closed",
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

type SortKey = "referenceNumber" | "insuredName" | "status" | "lineOfBusiness" | "premiumIndication" | "proposalCount" | "assignedUnderwriter" | "receivedDate" | "lastUpdated";

const FILTERS: FilterConfig[] = [
  {
    key: "lineOfBusiness",
    label: "Line of Business",
    options: [
      { value: "General Liability", label: "General Liability" },
      { value: "Professional Liability", label: "Professional Liability" },
      { value: "Cyber Liability", label: "Cyber Liability" },
      { value: "Products Liability", label: "Products Liability" },
      { value: "Umbrella/Excess", label: "Umbrella/Excess" },
      { value: "Property", label: "Property" },
    ],
  },
  {
    key: "assignedUnderwriter",
    label: "Underwriter",
    options: [
      { value: "Sarah Chen", label: "Sarah Chen" },
      { value: "Michael Torres", label: "Michael Torres" },
    ],
  },
];

export default function SubmissionsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<PortalSubmissionStatus | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("receivedDate");
  const [sortDesc, setSortDesc] = useState(true);

  const statusFiltered = useMemo(() => {
    if (statusFilter === "all") return PORTAL_SUBMISSIONS;
    return PORTAL_SUBMISSIONS.filter((s) => s.status === statusFilter);
  }, [statusFilter]);

  const {
    searchTerm,
    onSearchChange,
    activeFilters,
    onFilterChange,
    onClearFilters,
    filtered,
    resultCount,
  } = useFilterState(statusFiltered, ["insuredName", "referenceNumber"]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDesc ? bVal - aVal : aVal - bVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDesc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
    return copy;
  }, [filtered, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  // Stats
  const openCount = PORTAL_SUBMISSIONS.filter(
    (s) => s.status === "open" || s.status === "received" || s.status === "under_review"
  ).length;
  const proposalsThisMonth = PORTAL_PROPOSALS.filter(
    (p) => p.createdDate >= "2026-03-01"
  ).length;

  const renderSortHeader = (label: string, sortKeyName: SortKey) => (
    <TableHead
      key={sortKeyName}
      className="cursor-pointer select-none hover:bg-muted/50"
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortKey === sortKeyName ? "opacity-100" : "opacity-30")} />
      </span>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submission Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage submissions from intake through binding
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Submissions"
          value={PORTAL_SUBMISSIONS.length}
          icon={ClipboardList}
        />
        <StatCard
          title="Active (Open/In Review)"
          value={openCount}
          icon={FolderOpen}
        />
        <StatCard
          title="Proposals This Month"
          value={proposalsThisMonth}
          icon={FileText}
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All ({PORTAL_SUBMISSIONS.length})
        </Button>
        {ALL_STATUSES.map((status) => {
          const count = PORTAL_SUBMISSIONS.filter((s) => s.status === status).length;
          return (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {PORTAL_STATUS_CONFIG[status].label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <FilterToolbar
        filters={FILTERS}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        searchPlaceholder="Search by insured name or reference..."
        resultCount={resultCount}
      />

      {/* Data Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortHeader("Reference #", "referenceNumber")}
              {renderSortHeader("Insured Name", "insuredName")}
              {renderSortHeader("Status", "status")}
              {renderSortHeader("Line of Business", "lineOfBusiness")}
              {renderSortHeader("Premium", "premiumIndication")}
              {renderSortHeader("Proposals", "proposalCount")}
              {renderSortHeader("Underwriter", "assignedUnderwriter")}
              {renderSortHeader("Received", "receivedDate")}
              {renderSortHeader("Last Updated", "lastUpdated")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((sub) => (
              <TableRow
                key={sub.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/submissions/${sub.id}`)}
              >
                <TableCell className="font-mono text-sm">{sub.referenceNumber}</TableCell>
                <TableCell className="font-medium">{sub.insuredName}</TableCell>
                <TableCell>
                  <PortalStatusBadge status={sub.status} size="sm" />
                </TableCell>
                <TableCell className="text-sm">{sub.lineOfBusiness}</TableCell>
                <TableCell className="text-sm">{formatCurrency(sub.premiumIndication)}</TableCell>
                <TableCell className="text-sm text-center">{sub.proposalCount}</TableCell>
                <TableCell className="text-sm">{sub.assignedUnderwriter}</TableCell>
                <TableCell className="text-sm">{sub.receivedDate}</TableCell>
                <TableCell className="text-sm">{sub.lastUpdated}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No submissions match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

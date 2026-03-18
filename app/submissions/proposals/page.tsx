"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PORTAL_PROPOSALS, PORTAL_SUBMISSION_MAP } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-700 border-zinc-200",
  pending_approval: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

const ALL_STATUSES = ["draft", "pending_approval", "approved", "declined"] as const;
type ProposalStatus = (typeof ALL_STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  declined: "Declined",
};

type SortKey = "label" | "insuredName" | "status" | "version" | "totalPremium" | "createdDate";

export default function ProposalsListPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdDate");
  const [sortDesc, setSortDesc] = useState(true);

  // Enrich proposals with submission info
  const enriched = useMemo(() => {
    return PORTAL_PROPOSALS.map((p) => {
      const sub = PORTAL_SUBMISSION_MAP[p.submissionId];
      return {
        ...p,
        insuredName: sub?.insuredName ?? "Unknown",
        lineOfBusiness: sub?.lineOfBusiness ?? "",
        referenceNumber: sub?.referenceNumber ?? "",
      };
    });
  }, []);

  const statusFiltered = useMemo(() => {
    if (statusFilter === "all") return enriched;
    return enriched.filter((p) => p.status === statusFilter);
  }, [enriched, statusFilter]);

  const searched = useMemo(() => {
    if (!searchTerm) return statusFiltered;
    const term = searchTerm.toLowerCase();
    return statusFiltered.filter(
      (p) =>
        p.label.toLowerCase().includes(term) ||
        p.insuredName.toLowerCase().includes(term) ||
        p.referenceNumber.toLowerCase().includes(term)
    );
  }, [statusFiltered, searchTerm]);

  const sorted = useMemo(() => {
    const copy = [...searched];
    copy.sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a];
      const bVal = b[sortKey as keyof typeof b];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDesc ? bVal - aVal : aVal - bVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDesc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });
    return copy;
  }, [searched, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  // Stats
  const approvedCount = PORTAL_PROPOSALS.filter((p) => p.status === "approved").length;
  const pendingCount = PORTAL_PROPOSALS.filter((p) => p.status === "pending_approval").length;

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
        <h1 className="text-2xl font-bold">Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All proposals across submissions
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Proposals" value={PORTAL_PROPOSALS.length} icon={FileText} />
        <StatCard title="Approved" value={approvedCount} icon={FileText} />
        <StatCard title="Pending Approval" value={pendingCount} icon={FileText} />
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All ({PORTAL_PROPOSALS.length})
        </Button>
        {ALL_STATUSES.map((status) => {
          const count = PORTAL_PROPOSALS.filter((p) => p.status === status).length;
          return (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {STATUS_LABELS[status]} ({count})
            </Button>
          );
        })}
      </div>

      {/* Search */}
      <Input
        placeholder="Search by proposal name, insured, or reference..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {/* Data Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {renderSortHeader("Proposal", "label")}
              <TableHead>Submission</TableHead>
              {renderSortHeader("Insured", "insuredName")}
              {renderSortHeader("Status", "status")}
              <TableHead>Line of Business</TableHead>
              {renderSortHeader("Version", "version")}
              {renderSortHeader("Premium", "totalPremium")}
              {renderSortHeader("Created", "createdDate")}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/submissions/${p.submissionId}/proposals/${p.id}`)}
              >
                <TableCell className="font-medium">{p.label}</TableCell>
                <TableCell className="text-sm">
                  <Link
                    href={`/submissions/${p.submissionId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {p.referenceNumber}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{p.insuredName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_COLORS[p.status] || ""}>
                    {STATUS_LABELS[p.status] || p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{p.lineOfBusiness}</TableCell>
                <TableCell className="text-sm text-center">v{p.version}</TableCell>
                <TableCell className="text-sm">{formatCurrency(p.totalPremium)}</TableCell>
                <TableCell className="text-sm">{p.createdDate}</TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No proposals match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

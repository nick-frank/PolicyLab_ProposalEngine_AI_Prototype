"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Eye, Trash2, RefreshCw, Search, Filter } from "lucide-react";
import { apiClient, QuoteListResponse } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export default function QuoteHistoryPage() {
  const router = useRouter();
  const showToast = useToast();
  const [quotes, setQuotes] = useState<QuoteListResponse["quotes"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuotes, setTotalQuotes] = useState(0);
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadQuotes();
  }, [currentPage, statusFilter]);

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.listQuotes(
        currentPage,
        20,
        statusFilter === "all" ? undefined : statusFilter,
        searchTerm || undefined
      );

      setQuotes(response.quotes);
      setTotalPages(response.pages);
      setTotalQuotes(response.total);
    } catch (error) {
      console.error("Failed to load quotes:", error);
      // If API is not available, show dummy data for demo
      setQuotes([
        {
          quote_id: "demo-1",
          insured_name: "ABC Construction Co.",
          status: "calculated",
          created_at: new Date().toISOString(),
          pl2_selection: "Contractors",
          territory: "CA-01",
          technical_premium: 125000
        },
        {
          quote_id: "demo-2",
          insured_name: "XYZ Restaurant Group",
          status: "draft",
          created_at: new Date().toISOString(),
          pl2_selection: "General Liability",
          territory: "NY-02",
          technical_premium: 85000
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadQuotes();
  };

  const handleViewQuote = async (quoteId: string) => {
    try {
      // For demo quotes, just navigate with the ID
      if (quoteId.startsWith("demo-")) {
        router.push(`/rating/primary-gl-rater?quote=${quoteId}`);
        return;
      }

      const quote = await apiClient.getQuote(quoteId);
      // Navigate back to rating form with loaded data
      router.push(`/rating/primary-gl-rater?quote=${quoteId}`);
    } catch (error) {
      console.error("Failed to load quote:", error);
      // Navigate anyway to show the quote ID
      router.push(`/rating/primary-gl-rater?quote=${quoteId}`);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (confirm("Are you sure you want to delete this quote?")) {
      try {
        await apiClient.deleteQuote(quoteId);
        showToast('success', 'Quote deleted successfully');
        loadQuotes();
      } catch (error) {
        console.error("Failed to delete quote:", error);
        showToast('error', 'Failed to delete quote. Please try again.');
      }
    }
  };

  const handleDownloadQuote = async (quoteId: string) => {
    try {
      const blob = await apiClient.downloadExcel(quoteId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quote_${quoteId}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Quote exported to Excel successfully');
    } catch (error) {
      console.error("Failed to download quote:", error);
      showToast('error', 'Failed to export quote. Please try again.');
    }
  };

  const handleCompareQuotes = () => {
    if (selectedQuotes.size < 2) {
      alert("Please select at least 2 quotes to compare");
      return;
    }
    if (selectedQuotes.size > 4) {
      alert("Maximum 4 quotes can be compared at once");
      return;
    }

    const quoteIds = Array.from(selectedQuotes).join(",");
    router.push(`/rating/compare?quotes=${quoteIds}`);
  };

  const toggleQuoteSelection = (quoteId: string) => {
    const newSelection = new Set(selectedQuotes);
    if (newSelection.has(quoteId)) {
      newSelection.delete(quoteId);
    } else {
      newSelection.add(quoteId);
    }
    setSelectedQuotes(newSelection);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/rating/primary-gl-rater")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rater
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Quote History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage your saved quotes
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">MARKEL</div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Quotes: {totalQuotes}
          </div>
        </div>
      </div>

      <Card className="p-6">
        {/* Search and Filter Bar */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search by insured name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <select
            className="px-3 py-2 rounded-md border"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="calculated">Calculated</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
          <Button onClick={loadQuotes} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {selectedQuotes.size > 0 && (
            <Button onClick={handleCompareQuotes} variant="default">
              Compare ({selectedQuotes.size})
            </Button>
          )}
        </div>

        {/* Quotes Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQuotes(new Set(quotes.map(q => q.quote_id)));
                      } else {
                        setSelectedQuotes(new Set());
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Quote ID</TableHead>
                <TableHead>Insured Name</TableHead>
                <TableHead>PL2</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    Loading quotes...
                  </TableCell>
                </TableRow>
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No quotes found
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.quote_id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedQuotes.has(quote.quote_id)}
                        onChange={() => toggleQuoteSelection(quote.quote_id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {quote.quote_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {quote.insured_name}
                    </TableCell>
                    <TableCell>{quote.pl2_selection || "-"}</TableCell>
                    <TableCell>{quote.territory || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        quote.status === "calculated" ? "bg-green-100 text-green-800" :
                        quote.status === "draft" ? "bg-gray-100 text-gray-800" :
                        quote.status === "approved" ? "bg-blue-100 text-blue-800" :
                        quote.status === "declined" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {quote.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {quote.technical_premium
                        ? `$${quote.technical_premium.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewQuote(quote.quote_id)}
                          title="View Quote"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadQuote(quote.quote_id)}
                          title="Download Excel"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuote(quote.quote_id)}
                          title="Delete Quote"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
"use client";

import { use } from "react";
import { DOCUMENT_MAP } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { ChunkBoundaryViewer } from "@/components/phase2/chunk-boundary-viewer";
import { OcrConfidenceHeatmap } from "@/components/phase2/ocr-confidence-heatmap";
import { FieldExtractionTable } from "@/components/phase2/field-extraction-table";
import { EmptyState } from "@/components/shared/empty-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ScanLine, Layers, AlertTriangle } from "lucide-react";

export default function DocumentAuditDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const doc = DOCUMENT_MAP[documentId];

  if (!doc) {
    return (
      <EmptyState
        title="Document Not Found"
        description={`No document found with ID "${documentId}".`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/phase2/document-audit">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Document Audit
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{doc.documentName}</h1>
          <Badge
            variant="outline"
            className={doc.insurer === "P&C Commercial" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}
          >
            {doc.insurer}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard title="Pages" value={doc.pageCount} icon={FileText} />
        <StatCard
          title="OCR Confidence"
          value={`${Math.round(doc.ocrConfidence * 100)}%`}
          icon={ScanLine}
        />
        <StatCard title="Chunks" value={doc.chunkCount} icon={Layers} />
        <StatCard
          title="Issues"
          value={doc.issues.length}
          icon={AlertTriangle}
        />
      </div>

      {/* Chunk Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chunk Boundaries</CardTitle>
        </CardHeader>
        <CardContent>
          <ChunkBoundaryViewer chunks={doc.chunkBoundaries} totalPages={doc.pageCount} />
        </CardContent>
      </Card>

      {/* OCR Confidence Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page-Level OCR Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <OcrConfidenceHeatmap pageConfidences={doc.pageConfidences} />
        </CardContent>
      </Card>

      {/* Field Extractions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Extractions</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldExtractionTable extractions={doc.fieldExtractions} />
        </CardContent>
      </Card>

      {/* Issues */}
      {doc.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues ({doc.issues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doc.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md border p-3">
                  <SeverityIndicator severity={issue.severity} variant="dot" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium capitalize">{issue.type.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                    {issue.page && (
                      <p className="text-xs text-muted-foreground">Page {issue.page}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

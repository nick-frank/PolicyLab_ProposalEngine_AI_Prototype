"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import type { DocumentAudit } from "@/lib/types";
import { FileText, AlertTriangle } from "lucide-react";

export function DocumentAuditCard({ doc }: { doc: DocumentAudit }) {
  return (
    <Link href={`/phase2/document-audit/${doc.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold truncate">
              {doc.documentName}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={doc.insurer === "Markel" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}
            >
              {doc.insurer}
            </Badge>
            <span className="text-xs text-muted-foreground">{doc.pageCount} pages</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">OCR Confidence</span>
              <div className="mt-0.5">
                <ConfidenceScore score={doc.ocrConfidence} showBar />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Chunks</span>
              <p className="font-medium mt-0.5">{doc.chunkCount}</p>
            </div>
          </div>
          {doc.issues.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span>{doc.issues.length} issue{doc.issues.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

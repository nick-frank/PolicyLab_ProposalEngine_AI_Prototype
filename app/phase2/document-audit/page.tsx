"use client";

import { DOCUMENTS } from "@/lib/mock-data";
import { DocumentAuditCard } from "@/components/phase2/document-audit-card";

export default function DocumentAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">
          OCR quality, chunk boundaries, and field extraction review for ingested policy documents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENTS.map((doc) => (
          <DocumentAuditCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

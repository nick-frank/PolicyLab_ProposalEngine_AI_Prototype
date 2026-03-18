"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EXTRACTION_STATUS_CONFIG, DOCUMENT_TYPE_CONFIG } from "@/lib/constants";
import type { PortalDocument } from "@/lib/types";
import { Upload, ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function TabDocuments({ documents }: { documents: PortalDocument[] }) {
  const [docs, setDocs] = useState(documents);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleUpload = () => {
    const newDoc: PortalDocument = {
      id: `d-new-${Date.now()}`,
      submissionId: docs[0]?.submissionId || "",
      fileName: `Uploaded_Document_${new Date().toISOString().slice(0, 10)}.pdf`,
      documentType: "supplemental",
      uploadedDate: new Date().toISOString().slice(0, 10),
      fileSize: "1.2 MB",
      extractionStatus: "pending",
    };
    setDocs([newDoc, ...docs]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Documents</CardTitle>
        <Button size="sm" variant="outline" onClick={handleUpload}>
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Extraction</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {docs.map((doc) => {
              const typeConfig = DOCUMENT_TYPE_CONFIG[doc.documentType];
              const extractionConfig = EXTRACTION_STATUS_CONFIG[doc.extractionStatus];
              const isExpanded = expandedId === doc.id;

              return (
                <Collapsible key={doc.id} asChild open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : doc.id)}>
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.fileName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(typeConfig.bg, typeConfig.text, "text-xs")}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{doc.uploadedDate}</TableCell>
                        <TableCell className="text-sm">{doc.fileSize}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(extractionConfig.bg, extractionConfig.text, "text-xs")}>
                            {extractionConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {doc.satoraOutput && (
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                          )}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    {doc.satoraOutput && (
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/30">
                            <div className="py-2 px-4 text-sm">
                              <p className="font-medium text-xs text-muted-foreground mb-1">Satora Extraction Output</p>
                              <p>{doc.satoraOutput}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    )}
                  </>
                </Collapsible>
              );
            })}
            {docs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No documents uploaded.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

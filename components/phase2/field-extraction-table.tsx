"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { FieldExtraction } from "@/lib/types";

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.95) return "text-green-600";
  if (confidence >= 0.85) return "text-amber-600";
  return "text-red-600";
}

export function FieldExtractionTable({
  extractions,
}: {
  extractions: FieldExtraction[];
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field Name</TableHead>
            <TableHead>Extracted Value</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
            <TableHead className="text-right">Source Page</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {extractions.map((field, i) => (
            <TableRow
              key={i}
              className={cn(field.confidence < 0.85 && "bg-red-50/50")}
            >
              <TableCell className="text-sm font-medium">{field.fieldName}</TableCell>
              <TableCell className="text-sm font-mono">{field.extractedValue}</TableCell>
              <TableCell className="text-right">
                <span className={cn("text-sm font-semibold", getConfidenceColor(field.confidence))}>
                  {Math.round(field.confidence * 100)}%
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground">
                p.{field.sourcePage}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

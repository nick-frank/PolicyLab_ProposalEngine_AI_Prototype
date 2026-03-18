"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DASHBOARD_METRICS } from "@/lib/mock-data";
import { Activity, Database, FileText, ScanLine } from "lucide-react";

export function SystemHealth() {
  const { system } = DASHBOARD_METRICS;

  const items = [
    { icon: Activity, label: "Model Version", value: system.modelVersion },
    { icon: Database, label: "Data Freshness", value: system.dataFreshness },
    { icon: FileText, label: "Documents Processed", value: String(system.documentsProcessed) },
    { icon: ScanLine, label: "Avg OCR Confidence", value: `${Math.round(system.avgOcrConfidence * 100)}%` },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

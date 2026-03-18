"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";

type DebugTab = "input" | "output" | "audit";

type AuditEvent = {
  id: string;
  timestamp: string;
  action: string;
  details: string;
};

export default function DebugPage() {
  const params = useParams();
  const quoteId = params.quoteId as string;
  const [activeTab, setActiveTab] = useState<DebugTab>("input");
  const [inputData, setInputData] = useState<any>(null);
  const [outputData, setOutputData] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);

  useEffect(() => {
    loadDebugData();
  }, [quoteId]);

  const loadDebugData = async () => {
    try {
      const quote = await apiClient.getQuote(quoteId);
      setInputData(quote.input_data || quote.input || { quote_id: quoteId });
      setOutputData(quote.output_data || quote.output || null);
      setAuditTrail([
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          action: "quote_loaded",
          details: `Quote ${quoteId} loaded for debugging`,
        },
        {
          id: "evt-2",
          timestamp: new Date().toISOString(),
          action: "debug_view_opened",
          details: "Debug panel accessed",
        },
      ]);
    } catch {
      setInputData({ quote_id: quoteId, error: "Could not load quote data" });
      setOutputData(null);
      setAuditTrail([
        {
          id: "evt-1",
          timestamp: new Date().toISOString(),
          action: "load_failed",
          details: `Failed to load quote ${quoteId}`,
        },
      ]);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="debug-panel">
      <h1 className="text-2xl font-bold">Debug: {quoteId}</h1>

      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === "input" ? "default" : "outline"}
          onClick={() => setActiveTab("input")}
        >
          Input JSON
        </Button>
        <Button
          variant={activeTab === "output" ? "default" : "outline"}
          onClick={() => setActiveTab("output")}
        >
          Output JSON
        </Button>
        <Button
          variant={activeTab === "audit" ? "default" : "outline"}
          onClick={() => setActiveTab("audit")}
        >
          Audit Trail
        </Button>
      </div>

      <Card className="p-6">
        {activeTab === "input" && (
          <div>
            <h3 className="font-semibold mb-4">Input JSON</h3>
            <pre className="text-xs overflow-auto max-h-[600px] bg-gray-50 p-4 rounded">
              {JSON.stringify(inputData, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === "output" && (
          <div>
            <h3 className="font-semibold mb-4">Output JSON</h3>
            {outputData ? (
              <pre className="text-xs overflow-auto max-h-[600px] bg-gray-50 p-4 rounded">
                {JSON.stringify(outputData, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No output data available. Run a calculation first.</p>
            )}
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <h3 className="font-semibold mb-4">Audit Trail</h3>
            <div className="space-y-3">
              {auditTrail.map((event) => (
                <div
                  key={event.id}
                  data-testid="audit-event"
                  className="border rounded p-3 bg-gray-50"
                >
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{event.action}</span>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-sm">{event.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

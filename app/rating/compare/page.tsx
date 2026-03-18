"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComparePage />
    </Suspense>
  );
}

type QuoteData = {
  quote_id: string;
  insured_name?: string;
  pl2_selection?: string;
  territory?: string;
  technical_premium?: number;
  input_data?: any;
  output_data?: any;
};

function ComparePage() {
  const searchParams = useSearchParams();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [comparisonData, setComparisonData] = useState<QuoteData[]>([]);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [scenarios, setScenarios] = useState<{ id: number; value: string }[]>([]);
  const [scenarioResults, setScenarioResults] = useState<any>(null);

  useEffect(() => {
    const quoteIds = searchParams.get("quotes");
    if (quoteIds) {
      const ids = quoteIds.split(",");
      loadQuotes(ids);
    }
  }, [searchParams]);

  const loadQuotes = async (ids: string[]) => {
    const loaded: QuoteData[] = [];
    for (const id of ids) {
      try {
        const quote = await apiClient.getQuote(id);
        loaded.push({
          quote_id: id,
          insured_name: quote.input_data?.exposure_rating?.policy_details?.insured || quote.insured_name || "Unknown",
          pl2_selection: quote.input_data?.exposure_rating?.policy_details?.pl2 || quote.pl2_selection || "-",
          territory: quote.input_data?.exposure_rating?.policy_details?.territory || quote.territory || "-",
          technical_premium: quote.output_data?.calculated_values?.technical_premium_post_emod || quote.technical_premium || 0,
          input_data: quote.input_data,
          output_data: quote.output_data,
        });
      } catch {
        loaded.push({
          quote_id: id,
          insured_name: `Quote ${id.slice(0, 8)}`,
          pl2_selection: "-",
          territory: "-",
          technical_premium: 0,
        });
      }
    }
    setQuotes(loaded);
    setSelectedIds(new Set(loaded.map((q) => q.quote_id)));
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCompare = () => {
    setComparisonData(quotes.filter((q) => selectedIds.has(q.quote_id)));
  };

  const handleAddScenario = () => {
    setScenarios([...scenarios, { id: Date.now(), value: "" }]);
  };

  const handleCalculateScenarios = () => {
    setScenarioResults({
      scenarios: scenarios.map((s) => ({
        input: s.value,
        result: "Calculated",
      })),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Compare Quotes</h1>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Select Quotes to Compare</h3>
        <div className="space-y-2 mb-4">
          {quotes.map((q) => (
            <label key={q.quote_id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.has(q.quote_id)}
                onChange={() => toggleSelection(q.quote_id)}
              />
              <span>{q.insured_name} ({q.quote_id.slice(0, 8)}...)</span>
            </label>
          ))}
        </div>
        <Button onClick={handleCompare}>Compare Selected</Button>
      </Card>

      {comparisonData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Comparison</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                {comparisonData.map((q) => (
                  <TableHead key={q.quote_id}>{q.insured_name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Insured</TableCell>
                {comparisonData.map((q) => (
                  <TableCell key={q.quote_id}>{q.insured_name}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PL2</TableCell>
                {comparisonData.map((q) => (
                  <TableCell key={q.quote_id}>{q.pl2_selection}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Territory</TableCell>
                {comparisonData.map((q) => (
                  <TableCell key={q.quote_id}>{q.territory}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Premium</TableCell>
                {comparisonData.map((q) => (
                  <TableCell key={q.quote_id}>
                    {q.technical_premium ? `$${q.technical_premium.toLocaleString()}` : "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">What-If Analysis</h3>
          <Button onClick={() => setShowWhatIf(!showWhatIf)}>What-If Analysis</Button>
        </div>
        {showWhatIf && (
          <div className="space-y-4">
            <Button onClick={handleAddScenario} variant="outline">
              Add Scenario
            </Button>
            {scenarios.map((s, i) => (
              <div key={s.id} className="flex gap-2 items-center">
                <span className="text-sm">Scenario {i + 1}:</span>
                <Input
                  placeholder="Enter value for scenario"
                  value={s.value}
                  onChange={(e) => {
                    const updated = [...scenarios];
                    updated[i] = { ...updated[i], value: e.target.value };
                    setScenarios(updated);
                  }}
                />
              </div>
            ))}
            {scenarios.length > 0 && (
              <Button onClick={handleCalculateScenarios}>Calculate</Button>
            )}
            {scenarioResults && (
              <div className="scenario-results p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Scenario Results</h4>
                {scenarioResults.scenarios.map((s: any, i: number) => (
                  <div key={i} className="text-sm">
                    Scenario {i + 1}: {s.input} → {s.result}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

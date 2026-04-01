"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingComparison } from "@/lib/types";

const outcomeColors: Record<string, string> = {
  pc_commercial_wins: "#22c55e",
  kinsale_wins: "#ef4444",
  competitive: "#f59e0b",
};

export function PricingScatter({ comparisons }: { comparisons: PricingComparison[] }) {
  const pcCommercialWins = comparisons.filter((c) => c.outcome === "pc_commercial_wins").map((c) => ({
    x: c.tightnessScore,
    y: c.premiumDeltaPercent,
    name: c.insuredName,
  }));
  const kinsaleWins = comparisons.filter((c) => c.outcome === "kinsale_wins").map((c) => ({
    x: c.tightnessScore,
    y: c.premiumDeltaPercent,
    name: c.insuredName,
  }));
  const competitive = comparisons.filter((c) => c.outcome === "competitive").map((c) => ({
    x: c.tightnessScore,
    y: c.premiumDeltaPercent,
    name: c.insuredName,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tightness vs. Premium Delta</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Tightness Score"
              domain={[0, 1]}
              label={{ value: "Tightness Score", position: "bottom", offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Premium Delta %"
              label={{ value: "Premium Delta %", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-md bg-background border p-2 text-sm shadow-sm">
                    <p className="font-medium">{d.name}</p>
                    <p className="text-muted-foreground">Tightness: {d.x.toFixed(2)}</p>
                    <p className="text-muted-foreground">Delta: {d.y.toFixed(1)}%</p>
                  </div>
                );
              }}
            />
            <Legend />
            <Scatter name="P&C Commercial Wins" data={pcCommercialWins} fill={outcomeColors.pc_commercial_wins} />
            <Scatter name="Kinsale Wins" data={kinsaleWins} fill={outcomeColors.kinsale_wins} />
            <Scatter name="Competitive" data={competitive} fill={outcomeColors.competitive} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { PRICING_DATA } from "@/lib/mock-data";
import { PricingScatter } from "@/components/phase2/pricing-scatter";
import { PricingTable } from "@/components/phase2/pricing-table";
import { GapAnalysisPanel } from "@/components/phase2/gap-analysis-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PricingAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing Analysis</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Premium comparison and term-gap opportunity identification
        </p>
      </div>

      <Tabs defaultValue="scatter">
        <TabsList>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="scatter" className="mt-4">
          <PricingScatter comparisons={PRICING_DATA} />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <PricingTable comparisons={PRICING_DATA} />
        </TabsContent>

        <TabsContent value="gaps" className="mt-4">
          <GapAnalysisPanel comparisons={PRICING_DATA} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

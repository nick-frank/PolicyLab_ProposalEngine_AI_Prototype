"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfidenceScore } from "@/components/shared/confidence-score";
import { ProvenanceFooter } from "@/components/shared/provenance-footer";
import type { WorkflowRetrieve } from "@/lib/types";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function WorkflowStageRetrieve({ data }: { data: WorkflowRetrieve }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Tabs defaultValue="similar-insureds">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="similar-insureds">Similar Insureds</TabsTrigger>
            <TabsTrigger value="relevant-losses">Relevant Losses</TabsTrigger>
            <TabsTrigger value="clause-fingerprints">Clause Fingerprints</TabsTrigger>
          </TabsList>

          <TabsContent value="similar-insureds" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>NAICS</TableHead>
                    <TableHead>Similarity</TableHead>
                    <TableHead>Prior Outcome</TableHead>
                    <TableHead className="text-right">Loss Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.similarInsureds.map((si, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{si.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{si.naicsCode}</TableCell>
                      <TableCell><ConfidenceScore score={si.similarityScore} /></TableCell>
                      <TableCell className="text-sm">{si.priorOutcome}</TableCell>
                      <TableCell className="text-right text-sm">{(si.lossRatio * 100).toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="relevant-losses" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Year</TableHead>
                    <TableHead>Relevance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.relevantLosses.map((rl, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm">{rl.description}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(rl.amount)}</TableCell>
                      <TableCell className="text-right text-sm">{rl.year}</TableCell>
                      <TableCell><ConfidenceScore score={rl.relevanceScore} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="clause-fingerprints" className="mt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clause ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Match Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.clauseFingerprints.map((cf, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-mono text-muted-foreground">{cf.clauseId}</TableCell>
                      <TableCell className="text-sm font-medium">{cf.title}</TableCell>
                      <TableCell><ConfidenceScore score={cf.matchScore} showBar /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <ProvenanceFooter provenance={data.provenance} />
      </CardContent>
    </Card>
  );
}

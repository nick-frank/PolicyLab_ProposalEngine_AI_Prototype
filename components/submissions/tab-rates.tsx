"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import type { PortalRate } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function TabRates({ initialRates, readOnly = false }: { initialRates: PortalRate[]; readOnly?: boolean }) {
  const [rates, setRates] = useState(initialRates);
  const [editedCells, setEditedCells] = useState<Set<string>>(new Set());

  const totalPremium = useMemo(
    () => rates.reduce((sum, r) => sum + r.adjustedPremium, 0),
    [rates]
  );

  const handleEdit = (id: string, field: "baseRate" | "exposure" | "lcm", rawValue: string) => {
    const value = parseFloat(rawValue);
    if (isNaN(value)) return;

    setRates((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        updated.manualPremium = updated.baseRate * (updated.exposure / 100);
        updated.adjustedPremium = updated.manualPremium * updated.lcm;
        return updated;
      })
    );
    setEditedCells((prev) => new Set(prev).add(`${id}-${field}`));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Rating Table</CardTitle>
      </CardHeader>
      <CardContent>
        {rates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rates available for this submission.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Territory</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Exposure</TableHead>
                <TableHead>Exposure Base</TableHead>
                <TableHead>Technical Rate</TableHead>
                <TableHead>LCM</TableHead>
                <TableHead>Adjusted Premium</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-mono text-sm">{rate.classCode}</TableCell>
                  <TableCell className="text-sm">{rate.classDescription}</TableCell>
                  <TableCell className="text-sm">{rate.territory}</TableCell>
                  <TableCell>
                    {readOnly ? (
                      <span className="text-sm">{rate.baseRate}</span>
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.baseRate}
                        onChange={(e) => handleEdit(rate.id, "baseRate", e.target.value)}
                        className={cn(
                          "w-24 h-8 text-sm",
                          editedCells.has(`${rate.id}-baseRate`) && "bg-amber-50 border-amber-300"
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      <span className="text-sm">{rate.exposure.toLocaleString()}</span>
                    ) : (
                      <Input
                        type="number"
                        value={rate.exposure}
                        onChange={(e) => handleEdit(rate.id, "exposure", e.target.value)}
                        className={cn(
                          "w-28 h-8 text-sm",
                          editedCells.has(`${rate.id}-exposure`) && "bg-amber-50 border-amber-300"
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{rate.exposureBase}</TableCell>
                  <TableCell className="text-sm">{formatCurrency(rate.manualPremium)}</TableCell>
                  <TableCell>
                    {readOnly ? (
                      <span className="text-sm">{rate.lcm}</span>
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        value={rate.lcm}
                        onChange={(e) => handleEdit(rate.id, "lcm", e.target.value)}
                        className={cn(
                          "w-20 h-8 text-sm",
                          editedCells.has(`${rate.id}-lcm`) && "bg-amber-50 border-amber-300"
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(rate.adjustedPremium)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8} className="text-right font-medium">
                  Total Indicated Premium
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(totalPremium)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

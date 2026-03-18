"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LossRow } from "./types";

const NUM_LOSS_ROWS = 20;

function makeEmptyLossRow(): LossRow {
  return { dateOfLoss: "", groundUpIndemnity: "", groundUpExpense: "" };
}

export function ExperienceModifier() {
  const [evaluationDate, setEvaluationDate] = useState("");
  const [policyYear1, setPolicyYear1] = useState("");
  const [policyYear2, setPolicyYear2] = useState("");
  const [lossRows, setLossRows] = useState<LossRow[]>(
    Array.from({ length: NUM_LOSS_ROWS }, () => makeEmptyLossRow())
  );

  const handleLossFieldChange = (index: number, field: keyof LossRow, value: string) => {
    const newRows = [...lossRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setLossRows(newRows);
  };

  const handleReset = () => {
    setEvaluationDate("");
    setPolicyYear1("");
    setPolicyYear2("");
    setLossRows(Array.from({ length: NUM_LOSS_ROWS }, () => makeEmptyLossRow()));
  };

  const handleClearData = () => {
    setLossRows(Array.from({ length: NUM_LOSS_ROWS }, () => makeEmptyLossRow()));
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Experience Modifier Calculation</h3>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">MARKEL</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <label className="text-sm">Evaluation Date of Loss Run:</label>
          <Input
            type="date"
            className="bg-[#FFF4F2EB]"
            value={evaluationDate}
            onChange={(e) => setEvaluationDate(e.target.value)}
          />
          <Button variant="outline" onClick={handleReset}>Reset</Button>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <label className="text-sm">Earliest policy year for which you know the loss experience:</label>
          <div className="flex gap-2">
            <Input
              className="bg-white"
              placeholder="Year 1"
              value={policyYear1}
              onChange={(e) => setPolicyYear1(e.target.value)}
            />
            <Input
              className="bg-[#FFF4F2EB]"
              placeholder="Year 2"
              value={policyYear2}
              onChange={(e) => setPolicyYear2(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          <label className="text-sm">Experience Modifier:</label>
          <Input defaultValue="1.000" className="bg-white" readOnly />
        </div>
      </div>

      <h4 className="font-semibold mb-4">LOSS DETAIL</h4>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead>Date of Loss</TableHead>
              <TableHead>Ground-Up Indemnity</TableHead>
              <TableHead>Ground-Up Expense</TableHead>
              <TableHead>Ground-Up Total Incurred</TableHead>
              <TableHead>Indemnity Less Deductible</TableHead>
              <TableHead>Includable Losses</TableHead>
              <TableHead>Policy Period</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lossRows.map((row, i) => {
              const indemnity = parseFloat(row.groundUpIndemnity) || 0;
              const expense = parseFloat(row.groundUpExpense) || 0;
              const totalIncurred = indemnity + expense;
              const hasValues = indemnity > 0 || expense > 0;
              return (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      type="date"
                      className="h-8 text-xs bg-[#FFF4F2EB]"
                      value={row.dateOfLoss}
                      onChange={(e) => handleLossFieldChange(i, "dateOfLoss", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs bg-[#FFF4F2EB]"
                      value={row.groundUpIndemnity}
                      onChange={(e) => handleLossFieldChange(i, "groundUpIndemnity", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs bg-[#FFF4F2EB]"
                      value={row.groundUpExpense}
                      onChange={(e) => handleLossFieldChange(i, "groundUpExpense", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 text-xs bg-white"
                      value={hasValues ? totalIncurred.toLocaleString() : ""}
                      readOnly
                    />
                  </TableCell>
                  <TableCell>
                    <Input className="h-8 text-xs bg-white" readOnly />
                  </TableCell>
                  <TableCell>
                    <Input className="h-8 text-xs bg-white" readOnly />
                  </TableCell>
                  <TableCell>
                    <Input className="h-8 text-xs bg-white" readOnly />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex justify-between items-start">
        <div className="bg-zinc-50 p-4 rounded-md text-xs max-w-md space-y-2">
          <p>The intention is that individual losses be entered ground-up. The policy deductible will then be subtracted from the indemnity for the purpose of the experience mod calculation.</p>
          <p>The indemnity loss gets capped at $100K in the experience mod calculation. Therefore, it is important to separate indemnity and expense for large claims.</p>
          <p>If only grouped loss information is available, the entire loss sh. ded. amt can be entered in the ground-up expense column with a loss date equal to the appropriate policy effect date.</p>
        </div>
        <Button variant="outline" onClick={handleClearData}>Clear Data</Button>
      </div>
    </Card>
  );
}

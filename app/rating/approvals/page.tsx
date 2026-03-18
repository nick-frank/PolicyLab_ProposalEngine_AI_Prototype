"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ApprovalItem = {
  id: string;
  quote_id: string;
  insured_name: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
  premium: number;
};

export default function ApprovalsPage() {
  const [approvals] = useState<ApprovalItem[]>([
    {
      id: "appr-1",
      quote_id: "demo-1",
      insured_name: "ABC Construction Co.",
      submitted_by: "John Doe",
      submitted_at: new Date().toISOString(),
      status: "pending",
      premium: 125000,
    },
    {
      id: "appr-2",
      quote_id: "demo-2",
      insured_name: "XYZ Restaurant Group",
      submitted_by: "Jane Smith",
      submitted_at: new Date().toISOString(),
      status: "pending",
      premium: 85000,
    },
  ]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Approval Dashboard</h1>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Pending Approvals</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Insured Name</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.quote_id}</TableCell>
                  <TableCell>{item.insured_name}</TableCell>
                  <TableCell>{item.submitted_by}</TableCell>
                  <TableCell>{new Date(item.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>${item.premium.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="default">Approve</Button>
                      <Button size="sm" variant="outline">Decline</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

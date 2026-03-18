"use client";

import { Phase2Summary } from "@/components/dashboard/phase2-summary";
import { Phase3Summary } from "@/components/dashboard/phase3-summary";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { SystemHealth } from "@/components/dashboard/system-health";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered underwriting intelligence overview
        </p>
      </div>

      <Phase2Summary />
      <Phase3Summary />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <SystemHealth />
      </div>
    </div>
  );
}

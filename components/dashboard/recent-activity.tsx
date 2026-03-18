"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RECENT_ACTIVITIES } from "@/lib/mock-data";
import Link from "next/link";
import { GitCompare, Inbox, FileSearch, FlaskConical } from "lucide-react";
import type { RecentActivity as RecentActivityType } from "@/lib/types";

const iconMap: Record<RecentActivityType["type"], React.ComponentType<{ className?: string }>> = {
  clause_delta: GitCompare,
  submission: Inbox,
  document: FileSearch,
  scenario: FlaskConical,
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[360px]">
          <div className="divide-y">
            {RECENT_ACTIVITIES.map((activity, i) => {
              const Icon = iconMap[activity.type];
              return (
                <Link
                  key={i}
                  href={activity.link}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

"use client";

import { PORTAL_STATUS_CONFIG } from "@/lib/constants";
import type { StatusTimelineEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function StatusTimeline({ entries }: { entries: StatusTimelineEntry[] }) {
  return (
    <div className="relative pl-6 space-y-4">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />

      {entries.map((entry, i) => {
        const config = PORTAL_STATUS_CONFIG[entry.status];
        const isLatest = i === entries.length - 1;
        return (
          <div key={i} className="relative flex gap-3">
            {/* Dot */}
            <div
              className={cn(
                "absolute -left-3.5 top-1.5 h-3 w-3 rounded-full border-2 bg-background",
                isLatest ? "border-primary bg-primary" : "border-muted-foreground/30"
              )}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", config.text)}>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{entry.user}</p>
              {entry.note && (
                <p className="text-sm text-muted-foreground mt-0.5">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

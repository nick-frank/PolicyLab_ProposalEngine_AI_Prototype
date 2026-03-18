"use client";
import { cn } from "@/lib/utils";

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function MetricBar({ segments, total, showLegend = true }: {
  segments: Segment[]; total?: number; showLegend?: boolean;
}) {
  const sum = total ?? segments.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="space-y-2">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={cn("h-full transition-all", seg.color)}
            style={{ width: `${(seg.value / sum) * 100}%` }}
          />
        ))}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {segments.map((seg, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", seg.color)} />
              {seg.label}: {seg.value} ({Math.round((seg.value / sum) * 100)}%)
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

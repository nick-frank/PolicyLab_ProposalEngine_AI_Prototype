"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ChunkBoundary } from "@/lib/types";

const COLORS = [
  "bg-blue-400",
  "bg-green-400",
  "bg-amber-400",
  "bg-purple-400",
  "bg-rose-400",
  "bg-cyan-400",
  "bg-orange-400",
  "bg-teal-400",
  "bg-indigo-400",
  "bg-pink-400",
  "bg-lime-400",
  "bg-sky-400",
];

export function ChunkBoundaryViewer({
  chunks,
  totalPages,
}: {
  chunks: ChunkBoundary[];
  totalPages: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex h-8 w-full overflow-hidden rounded-md border">
        {chunks.map((chunk, i) => {
          const span = chunk.endPage - chunk.startPage + 1;
          const widthPct = (span / totalPages) * 100;
          return (
            <Tooltip key={chunk.chunkId}>
              <TooltipTrigger asChild>
                <div
                  className={`${COLORS[i % COLORS.length]} h-full flex items-center justify-center text-xs font-medium text-white cursor-help border-r border-white/30 last:border-r-0`}
                  style={{ width: `${widthPct}%`, minWidth: widthPct > 4 ? undefined : "16px" }}
                >
                  {widthPct > 8 && `p.${chunk.startPage}-${chunk.endPage}`}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs space-y-0.5">
                  <p className="font-medium">{chunk.sectionTitle}</p>
                  <p>Pages {chunk.startPage}–{chunk.endPage} ({span} pages)</p>
                  <p className="text-muted-foreground">Chunk: {chunk.chunkId}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {chunks.map((chunk, i) => (
          <span key={chunk.chunkId} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-sm ${COLORS[i % COLORS.length]}`} />
            {chunk.sectionTitle}
          </span>
        ))}
      </div>
    </div>
  );
}

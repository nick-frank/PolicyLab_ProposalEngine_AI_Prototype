"use client";

import { cn } from "@/lib/utils";

function getGaugeColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getGradientStop(score: number) {
  // Map 0-100 score to 0-180 degrees for the semicircle
  return (score / 100) * 180;
}

export function AppetiteScoreGauge({
  score,
  label,
}: {
  score: number;
  label?: string;
}) {
  const rotation = getGradientStop(score);
  const color = getGaugeColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* CSS Semicircular Gauge */}
      <div className="relative w-40 h-20 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full border-[12px] border-muted" />
        {/* Colored arc - using conic gradient */}
        <div
          className="absolute bottom-0 left-0 w-40 h-40 rounded-full"
          style={{
            background: `conic-gradient(
              from 180deg,
              #ef4444 0deg,
              #f59e0b 90deg,
              #22c55e 180deg,
              transparent 180deg,
              transparent 360deg
            )`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - 12px), #000 calc(100% - 12px))`,
          }}
        />
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 origin-bottom h-[72px] w-0.5 bg-foreground rounded-full"
          style={{
            transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
            transition: "transform 0.5s ease-out",
          }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3 w-3 rounded-full bg-foreground" />
      </div>
      {/* Score */}
      <div className="text-center -mt-1">
        <p className={cn("text-2xl font-bold", color)}>{score}</p>
        {label && <p className="text-xs text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}

"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TIGHTNESS_COLORS } from "@/lib/constants";
import type { TightnessDirection } from "@/lib/types";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const icons = { tighter: ArrowUp, broader: ArrowDown, neutral: Minus };

export function TightnessBadge({ direction, showIcon = true, size = "default" }: {
  direction: TightnessDirection; showIcon?: boolean; size?: "sm" | "default";
}) {
  const config = TIGHTNESS_COLORS[direction];
  const Icon = icons[direction];
  return (
    <Badge variant="outline" className={cn(config.bg, config.text, config.border, size === "sm" && "text-xs px-1.5 py-0")}>
      {showIcon && <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />}
      {config.label}
    </Badge>
  );
}

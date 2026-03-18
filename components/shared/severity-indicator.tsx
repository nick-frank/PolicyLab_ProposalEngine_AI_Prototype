"use client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEVERITY_COLORS } from "@/lib/constants";
import type { Severity } from "@/lib/types";

export function SeverityIndicator({ severity, variant = "badge" }: {
  severity: Severity; variant?: "dot" | "badge" | "text";
}) {
  const config = SEVERITY_COLORS[severity];
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  if (variant === "dot") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full", config.dot)} />
        <span className={cn("text-sm", config.text)}>{label}</span>
      </span>
    );
  }
  if (variant === "text") {
    return <span className={cn("text-sm font-medium", config.text)}>{label}</span>;
  }
  return (
    <Badge variant="outline" className={cn(config.bg, config.text, "border-transparent")}>
      {label}
    </Badge>
  );
}

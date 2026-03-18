"use client";

import { Badge } from "@/components/ui/badge";
import { PORTAL_STATUS_CONFIG } from "@/lib/constants";
import type { PortalSubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PortalStatusBadge({
  status,
  size = "default",
}: {
  status: PortalSubmissionStatus;
  size?: "sm" | "default";
}) {
  const config = PORTAL_STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        config.bg,
        config.text,
        config.border,
        size === "sm" && "text-xs px-1.5 py-0"
      )}
    >
      {config.label}
    </Badge>
  );
}

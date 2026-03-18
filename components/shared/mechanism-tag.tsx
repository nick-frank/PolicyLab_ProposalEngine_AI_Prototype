"use client";
import { Badge } from "@/components/ui/badge";
import { MECHANISM_CONFIG } from "@/lib/constants";
import type { MechanismType } from "@/lib/types";
import { Ban, AlertCircle, Minimize2, ArrowDown, Zap } from "lucide-react";

const iconMap = { Ban, AlertCircle, Minimize2, ArrowDown, Zap };

export function MechanismTag({ mechanism }: { mechanism: MechanismType }) {
  const config = MECHANISM_CONFIG[mechanism];
  const Icon = iconMap[config.icon as keyof typeof iconMap];
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

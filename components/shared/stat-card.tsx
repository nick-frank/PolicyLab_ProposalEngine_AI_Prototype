import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const trendIcons = { up: ArrowUp, down: ArrowDown, flat: Minus };
const trendColors = { up: "text-green-600", down: "text-red-600", flat: "text-muted-foreground" };

export function StatCard({ title, value, subtitle, trend, icon: Icon }: {
  title: string; value: string | number; subtitle?: string; trend?: "up" | "down" | "flat"; icon?: LucideIcon;
}) {
  const TrendIcon = trend ? trendIcons[trend] : null;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {TrendIcon && <TrendIcon className={cn("h-3 w-3", trend && trendColors[trend])} />}
                {subtitle}
              </p>
            )}
          </div>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
      </CardContent>
    </Card>
  );
}

import { SearchX } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({ title, description, icon: Icon = SearchX }: {
  title: string; description: string; icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
    </div>
  );
}

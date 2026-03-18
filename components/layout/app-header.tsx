"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNav } from "./breadcrumb-nav";

export function AppHeader({ actions }: { actions?: React.ReactNode }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <BreadcrumbNav />
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { PHASE2_NAV } from "@/lib/constants";
import {
  LayoutDashboard,
  GitCompare,
  BarChart3,
  FlaskConical,
  DollarSign,
  Link as LinkIcon,
  FileSearch,
  Search,
  ClipboardList,
  FileText,
  Shield,
  Activity,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitCompare,
  BarChart3,
  FlaskConical,
  DollarSign,
  Link: LinkIcon,
  FileSearch,
  Search,
};

function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appMode = searchParams.get("app"); // "policylab" | "proposals" | null (show all)

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {appMode !== "proposals" && (
        <SidebarGroup>
          <SidebarGroupLabel>PolicyLab</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PHASE2_NAV.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                      <Link href={item.href}>
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {appMode !== "policylab" && (
        <SidebarGroup>
          <SidebarGroupLabel>Submissions &amp; Proposals</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/submissions" || (pathname.startsWith("/submissions/") && !pathname.startsWith("/submissions/proposals"))}>
                  <Link href="/submissions">
                    <ClipboardList className="h-4 w-4" />
                    <span>Submissions</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/submissions/proposals")}>
                  <Link href="/submissions/proposals">
                    <FileText className="h-4 w-4" />
                    <span>Proposals</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </SidebarContent>
  );
}

function SidebarClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Activity className="h-3 w-3 text-green-500" />
      <span>
        {now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        {" "}
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <div className="font-semibold text-sm">P&C Commercial AI</div>
            <div className="text-xs text-muted-foreground">Underwriting Intelligence</div>
          </div>
        </Link>
      </SidebarHeader>

      <Suspense>
        <SidebarNav />
      </Suspense>

      <SidebarFooter className="border-t px-4 py-3">
        <SidebarClock />
      </SidebarFooter>
    </Sidebar>
  );
}

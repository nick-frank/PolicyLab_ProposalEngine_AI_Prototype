"use client";

import { usePathname } from "next/navigation";
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <div className="font-semibold text-sm">Markel AI</div>
            <div className="text-xs text-muted-foreground">Underwriting Intelligence</div>
          </div>
        </Link>
      </SidebarHeader>

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
      </SidebarContent>

      <SidebarFooter className="border-t px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3 w-3 text-green-500" />
          <span>v2.1.0 — claude-opus-4-20250514</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

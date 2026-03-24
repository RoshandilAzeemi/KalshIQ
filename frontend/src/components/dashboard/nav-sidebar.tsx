/** Left navigation sidebar — links and account status. */

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    icon: "◉",
    href: "/",
    active: true,
  },
  {
    title: "Markets",
    icon: "◈",
    href: "/markets",
    active: false,
  },
  {
    title: "Trades",
    icon: "⬡",
    href: "/trades",
    active: false,
  },
  {
    title: "Model Engine",
    icon: "⬢",
    href: "/engine",
    active: false,
  },
  {
    title: "Settings",
    icon: "⚙",
    href: "/settings",
    active: false,
  },
];

export function NavSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">K</span>
          </div>
          <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
            KalshIQ
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={item.active}
                    className="text-xs h-8"
                    tooltip={item.title}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-3" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Quick Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-2 group-data-[collapsible=icon]:hidden">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">API Status</span>
                <span className="text-emerald-400 font-medium">Demo</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Model</span>
                <span className="text-amber-400 font-medium">v0.1-stub</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Pipeline</span>
                <span className="text-emerald-400 font-medium">Active</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1">
            Environment
          </p>
          <p className="text-xs font-medium text-amber-400">
            Demo Mode
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Kalshi Demo API
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

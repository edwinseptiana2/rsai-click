"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "#/components/ui/sidebar";
import { NavMain } from "#/components/nav-main";
import { NavUser } from "#/components/nav-user";
import { User, LayoutDashboard, FileText, Command } from "lucide-react";

export function AppSidebar({
  session,
  ...props
}: { session: any } & React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: session.user.name || "User",
      email: session.user.email || "",
      avatar: session.user.image || "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Pages",
        url: "/admin/pages",
        icon: FileText,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-10 items-center justify-center rounded-sm bg-sidebar-secondary text-sidebar-primary-foreground overflow-hidden">
                  <img
                    src="/rsai-click-new-icon-only.png"
                    alt="RSAI Click"
                    className="size-8 object-contain dark:bg-white dark:rounded-sm"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">RSAI Click</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

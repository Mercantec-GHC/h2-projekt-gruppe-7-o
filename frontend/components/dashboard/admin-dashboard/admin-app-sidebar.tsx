"use client";

import * as React from "react";
import { type Icon } from "@tabler/icons-react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { AdminNavMain } from "./admin-nav-main";
import { BrushCleaning } from "lucide-react";
import { IconBook, IconListCheck, IconReceipt, IconUser, IconInnerShadowTop } from "@tabler/icons-react";
import { useHasAnyRole } from "@/features/auth/stores/sessionStore";

interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  roles?: readonly string[];
}

const navMain: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: IconUser },
  { title: "Alle bookinger", url: "/dashboard/bookings", icon: IconBook, roles: ["Admin", "Receptionist"] },
  { title: "Sager", url: "/dashboard/tickets", icon: IconReceipt, roles: ["Admin", "Receptionist"] },

  // Housekeeping sektion
  { title: "Rengøringsoverblik", url: "/dashboard/housekeeping/overview", icon: BrushCleaning as Icon, roles: ["Admin", "HousekeepingManager", "Receptionist"] },
  { title: "Rengøringsopgaver", url: "/dashboard/housekeeping/tasks", icon: IconListCheck, roles: ["Admin", "HousekeepingManager", "Cleaner"] },
  { title: "Mine Opgaver", url: "/dashboard/tasks/", icon: IconListCheck, roles: ["Admin", "HousekeepingManager", "Cleaner"] },
];

export function AdminAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const hasAnyRole = useHasAnyRole([
    "Admin",
    "Receptionist",
    "HousekeepingManager",
    "Cleaner"
  ]);

  // Filtrer nav items baseret på brugerens roller
  const filteredNavMain = navMain.filter(item => !item.roles || hasAnyRole);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">KabdiKhan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <AdminNavMain items={filteredNavMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

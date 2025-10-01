"use client";

import * as React from "react";
import {
  IconBook,
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconInnerShadowTop,
  IconListCheck,
  IconReceipt,
  IconSettings,
  IconUser,
  type Icon,
} from "@tabler/icons-react";

import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { AdminNavMain } from "./admin-nav-main";
import { IconSpray } from "@tabler/icons-react";
import { DashboardRole } from "@/features/user/domain";
import { useHasAnyRole } from "@/features/auth/stores/sessionStore";
import { BrushCleaning } from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  roles?: readonly DashboardRole[];
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconUser,
    },
    {
      title: "Alle bookinger",
      url: "/dashboard/bookings",
      icon: IconBook,
      roles: ["Admin", "Receptionist"],
    },
    {
      title: "Sager",
      url: "/dashboard/tickets",
      icon: IconReceipt,
      roles: ["Admin", "Receptionist"],
    },
    {
      title: "Rengøring",
      url: "/dashboard/cleaning",
      icon: BrushCleaning,
      roles: ["Admin", "Cleaner", "HousekeepingManager"],
    },
    {
      title: "Mine Opgaver",
      url: "/dashboard/tasks",
      icon: IconListCheck,
      roles: ["Admin", "Cleaner", "HousekeepingManager"],
    },
      {
      title: "Rengøringsoverblik", // Går til Management Dashboard
      url: "/dashboard/housekeeping/overview", 
      icon: BrushCleaning,
      roles: ["Admin", "HousekeepingManager", "Receptionist"], 
    },
    {
      title: "Rengøringsopgaver", // Går til Housekeeper's opgaveliste
      url: "/dashboard/housekeeping/tasks", 
      icon: IconListCheck,
      roles: ["Admin", "HousekeepingManager", "Cleaner"], 
    },
  ] satisfies NavItem[],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [],
};

export function AdminAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const hasAnyRole = useHasAnyRole;

  // Filter navigation items based on user role
  const filteredNavMain = data.navMain.filter((item) => {
    if (!item.roles) return true; // Show items without role restrictions
    return hasAnyRole(item.roles);
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
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
        {/*<NavDocuments items={data.documents} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

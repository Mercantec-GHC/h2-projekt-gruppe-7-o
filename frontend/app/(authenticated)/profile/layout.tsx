import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { ProfileSectionCards } from "@/components/profile-dashboard/profile-section-cards";
import { UserAppSidebar } from "@/components/profile-dashboard/user-app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getMe } from "@/features/users/lib/getMe";
import { useQuery } from "@tanstack/react-query";
import data from "./data.json";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { data: me, isLoading } = useQuery({
  //   queryFn: getMe,
  //   queryKey: ["me"],
  //   // staleTime: Infinity, // We don't need to refetch the user data automatically, instead it is only going to be when we update or mutate the user
  // });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <UserAppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

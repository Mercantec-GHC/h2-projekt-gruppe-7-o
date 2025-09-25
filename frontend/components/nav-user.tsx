"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getUserInitials } from "@/features/user/lib/utilts";
import Link from "next/link";
import { useSessionStore } from "@/features/auth/stores/sessionStore";
import AuthApi from "@/features/auth/api/auth-api";

export function NavUser() {
  const router = useRouter();
  const { logout: sessionLogout, user: sessionUser } = useSessionStore();
  const { isMobile } = useSidebar();
  const mutation = useMutation({
    mutationFn: AuthApi.logout,
    onSuccess: () => {
      sessionLogout();
      router.refresh();
    },
  });

  const UserAvatarFallback =
    sessionUser?.firstName && sessionUser.lastName ? (
      <AvatarFallback className="rounded-lg">
        {getUserInitials(sessionUser.firstName, sessionUser.lastName)}
      </AvatarFallback>
    ) : null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                {UserAvatarFallback}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {sessionUser?.firstName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {sessionUser?.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {UserAvatarFallback}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {sessionUser?.firstName}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {sessionUser?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/profile/account">
                <DropdownMenuItem className="cursor-pointer">
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
              </Link>

              <Link href="profile/billing">
                <DropdownMenuItem className="cursor-pointer">
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => mutation.mutate()}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

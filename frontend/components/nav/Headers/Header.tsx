"use client";
import UnauthenticatedHeader from "./UnauthenticatedHeader";
import AuthenticatedHeader from "./AuthenticatedHeader";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@/features/auth/stores/sessionStore";

export default function Header() {
  const { isAuthenticated } = useSessionStore();
  const pathname = usePathname();
  const Header = isAuthenticated ? AuthenticatedHeader : UnauthenticatedHeader;

  const fixedHeader = pathname === "/";

  if (
    (isAuthenticated && pathname.startsWith("/profile")) ||
    pathname.startsWith("/dashboard")
  ) {
    return null;
  }
  return (
    <header className={cn("z-50 w-full", fixedHeader ? "fixed" : "sticky")}>
      <Header />
    </header>
  );
}

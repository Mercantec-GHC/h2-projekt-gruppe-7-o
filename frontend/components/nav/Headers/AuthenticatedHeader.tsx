"use client";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSessionStore } from "@/features/auth/stores/sessionStore";

const AuthenticatedHeader = () => {
  const { user } = useSessionStore();

  return (
    <nav className="flex items-center justify-between nav-content-container">
      <Link className="font-mono" href="/">
        LOGO HERE
      </Link>

      <Link href="/profile">
        <Avatar className="cursor-pointer">
          <AvatarFallback>
            {user?.firstName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
    </nav>
  );
};

export default AuthenticatedHeader;

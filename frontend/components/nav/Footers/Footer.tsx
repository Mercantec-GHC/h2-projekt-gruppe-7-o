"use client";
// TODO: better way of doing this, where it is also serverside rendered?

import { usePathname } from "next/navigation";
import ProfilePageFooter from "./ProfilePageFooter";
import LandingPageFooter from "./LandingPageFooter";

export function Footer() {
  const path = usePathname();

  if (path.startsWith("/profile") || path.startsWith("/dashboard")) {
    return null;
  }

  return <LandingPageFooter />;
}

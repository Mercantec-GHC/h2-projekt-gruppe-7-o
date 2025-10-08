"use client";

import { usePathname } from "next/navigation";
import LandingPageFooter from "./LandingPageFooter";

export function Footer() {
  const path = usePathname();

  if (path.startsWith("/profile") || path.startsWith("/dashboard")) {
    return null;
  }

  return <LandingPageFooter />;
}

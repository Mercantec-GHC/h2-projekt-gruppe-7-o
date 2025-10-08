"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const UnauthenticatedHeader = () => {
  const { scrollY } = useScroll();

  const pathName = usePathname();

  // Transform scroll position to background opacity
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 1)"],
  );

  // Transform scroll position to padding
  const paddingY = useTransform(scrollY, [0, 100], ["2rem", "1.25rem"]);

  // Transform scroll position to font size
  const fontSize = useTransform(scrollY, [0, 100], ["1rem", "0.875rem"]);

  // Transform scroll position to shadow (only appears after 100px)
  const boxShadow = useTransform(
    scrollY,
    [100, 101],
    [
      "none",
      "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
    ],
  );

  return (
    <motion.nav
      className={cn(
        " top-0 left-0 right-0 z-50 transition-shadow duration-200",
        pathName !== "/" ? "sticky" : "fixed",
      )}
      style={{ backgroundColor, paddingBlock: paddingY, boxShadow }}
    >
      <div className="flex items-center justify-between content-container-x">
        <motion.div style={{ fontSize }}>
          <Link className="font-mono" href="/">
            LOGO HERE
          </Link>
        </motion.div>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    </motion.nav>
  );
};

export default UnauthenticatedHeader;

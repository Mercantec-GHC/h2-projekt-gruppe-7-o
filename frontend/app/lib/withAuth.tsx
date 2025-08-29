"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "./auth";

export function withAuth(Component: React.ComponentType) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated()) router.push("/login");
    }, [router]);

    if (!isAuthenticated()) return null;

    return <Component {...props} />;
  };
}

// app/SessionHydrator.tsx
"use client";
import { useEffect } from "react";
import { useSessionStore } from "@/lib/stores/session";
import { Session } from "../lib/getSession";

export default function SessionHydrator({ session }: { session: Session }) {
  const setSession = useSessionStore((s) => s.setSession);
  const markHydrated = useSessionStore((s) => s.markHydrated);

  useEffect(() => {
    setSession(session);
    markHydrated();
  }, [session, setSession, markHydrated]);

  return null;
}

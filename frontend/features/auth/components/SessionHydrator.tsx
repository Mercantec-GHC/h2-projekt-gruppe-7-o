// app/SessionHydrator.tsx
"use client";
import { useEffect } from "react";
import { useSessionStore } from "../stores/sessionStore";
import { Session } from "../domain";

export default function SessionHydrator({ session }: { session: Session }) {
  const setSession = useSessionStore((s) => s.setSession);
  const markHydrated = useSessionStore((s) => s.markHydrated);

  useEffect(() => {
    setSession(session);
    markHydrated();
  }, [session, setSession, markHydrated]);

  return null;
}

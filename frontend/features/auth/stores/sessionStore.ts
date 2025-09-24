// stores/session.ts (Zustand)
"use client";
import { create } from "zustand";
import type { Session } from "@/features/auth/lib/getSession";
import { User } from "../types/user";

type State = Session & {
  hydrated: boolean;
  setSession: (s: Session) => void;
  logout: () => void;
  // TODO: not sure if we need this, it does not work as intended (preventing flashing on hydration)
  markHydrated: () => void;
};

export const useSessionStore = create<State>((set) => ({
  isAuthenticated: false,
  user: null,
  hydrated: false,
  setSession: (s) => set(s),
  logout: () => set({ isAuthenticated: false, user: null }),
  // TODO: not sure if we need this, it does not work as intended (preventing flashing on hydration)
  markHydrated: () => set({ hydrated: true }),
  fullName: (user: User) => `${user.firstName} ${user.lastName}`,
}));

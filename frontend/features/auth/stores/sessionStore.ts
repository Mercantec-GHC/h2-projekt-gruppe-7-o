// stores/session.ts (Zustand)
"use client";
import { create } from "zustand";
import { Session } from "../domain";
import { User, UserRole } from "@/features/user/domain";
import { CONSTANTS } from "@/lib/constants";

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

// Helpers
export const hasRole = (role: UserRole, userRole?: UserRole) =>
  userRole === role;

export const hasAnyRole = (roles: readonly UserRole[], userRole?: UserRole) =>
  !!userRole && roles.includes(userRole);

// Derived hook selectors
export const useHasRole = (role: UserRole) =>
  useSessionStore((s) => hasRole(role, s.user?.role));

export const useHasAnyRole = (roles: readonly UserRole[]) =>
  useSessionStore((s) => hasAnyRole(roles, s.user?.role));

// Specific roles from the same primitive
export const useIsAdmin = () => useHasRole("Admin");
export const useIsCustomer = () => useHasRole("Customer");
export const useIsReceptionist = () => useHasRole("Receptionist");
export const useIsCleaning = () => useHasRole("Cleaner");
export const useIsHousekeeping = () => useHasRole("HousekeepingManager");


// Dashboard access
export const hasDashboardAccess = (userRole?: UserRole) =>
  hasAnyRole(CONSTANTS.DASHBOARD_ROLES as readonly UserRole[], userRole);

export const useHasDashboardAccess = () =>
  useHasAnyRole(CONSTANTS.DASHBOARD_ROLES as readonly UserRole[]);

// Get current user role
export const useRole = () => useSessionStore((state) => state.user?.role);

import { RoomType } from "@/features/booking/api/dto";
import { UserRole } from "@/features/user/domain";

interface Constants {
  SESSION_COOKIE_NAME: string;
  ROOM_TYPES: RoomType[];
  DASHBOARD_ROLES: readonly Exclude<UserRole, "Customer">[];
  JWT: {
    ROLE_URI: string;
    NAMEID_URI: string;
  };
}

export const CONSTANTS = {
  SESSION_COOKIE_NAME: "session",
  ROOM_TYPES: ["Standard", "Deluxe", "Family", "Suite"],
  DASHBOARD_ROLES: ["Admin", "Cleaner", "Receptionist", "HousekeepingManager"],
  JWT: {
    ROLE_URI: "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
    NAMEID_URI:
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  },
} as const satisfies Constants;

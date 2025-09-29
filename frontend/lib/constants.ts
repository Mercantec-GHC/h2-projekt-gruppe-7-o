import { RoomType } from "@/features/booking/api/dto";
import { UserRole } from "@/features/user/domain";

interface Constants {
  SESSION_COOKIE_NAME: string;
  ROOM_TYPES: readonly RoomType[];
  DASHBOARD_ROLES: readonly Exclude<UserRole, "Customer">[];
}

export const CONSTANTS = {
  SESSION_COOKIE_NAME: "session",
  // This is probably really bad. But it works for now as a centralized place for the types.
  // We use these room type values to loop through the list of selected rooms, (which is an object of records)
  ROOM_TYPES: ["Standard", "Deluxe", "Family", "Suite"],
  DASHBOARD_ROLES: ["Admin", "Cleaning", "Receptionist"],
} as const satisfies Constants;

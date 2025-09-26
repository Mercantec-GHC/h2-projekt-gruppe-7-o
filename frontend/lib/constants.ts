import { RoomType } from "@/features/booking/api/dto";

interface Constants {
  SESSION_COOKIE_NAME: string;
  ROOM_TYPES: RoomType[];
}

export const CONSTANTS: Constants = {
  SESSION_COOKIE_NAME: "session",
  // This is probably really bad. But it works for now as a centralized place for the types.
  // We use these room type values to loop through the list of selected rooms, (which is an object of records)
  ROOM_TYPES: ["Standard", "Deluxe", "Family", "Suite"],
} as const;

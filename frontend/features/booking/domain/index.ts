import { RoomType } from "../api/dto";
import { GuestCount } from "../types/booking";

export interface RoomTypeAvailability {
  type: RoomType;
  availableRoomsCount: number;
}

export interface RoomTypeAvailabilityFormData {
  hotelId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

export interface RoomBookingAddons {
  type: number;
  description: string;
  amount: number;
}

export interface RoomBooking {
  roomType: RoomType;
  adults: number;
  children: number;
  addons: RoomBookingAddons[];
}

export function foundAvailableRooms(availableRooms?: RoomTypeAvailability[]) {
  return availableRooms?.some((room) => room.availableRoomsCount > 0) ?? false;
}

export function getTotalAvailableRoomsCount(
  availableRooms?: RoomTypeAvailability[],
) {
  return (
    availableRooms?.reduce(
      (total, room) => total + room.availableRoomsCount,
      0,
    ) ?? 0
  );
}

export function getTotalGuestsText(guestCount: GuestCount) {
  const totalGuests = guestCount.adults + guestCount.children;
  if (totalGuests === 1) return "1 Guest";
  return `${totalGuests} Guests`;
}

export function getAdultsCountText(adults: number) {
  return `${adults} adult${adults === 1 ? "" : "s"}`;
}

export function getChildrenCountText(children: number) {
  return `${children} child${children === 1 ? "" : "ren"}`;
}

export function getGuestsCountText(guestCount: GuestCount) {
  const adultsText = getAdultsCountText(guestCount.adults);
  const childrenText = getChildrenCountText(guestCount.children);
  return `${adultsText}, ${childrenText}`;
}

export const formatDateRange = (checkInDate?: Date, checkOutDate?: Date) => {
  if (checkInDate && checkOutDate) {
    return `${checkInDate.toLocaleDateString("da-DK")} - ${checkOutDate.toLocaleDateString("da-DK")}`;
  }
  return "Select dates";
};

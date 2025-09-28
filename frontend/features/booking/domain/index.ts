import { RoomType } from "../api/dto";
import { SelectedRoomBookings } from "../bookingStore";

export interface RoomTypeAvailability {
  type: RoomType;
  capacity: number;
  roomDescription: string;
  roomImageUrl: string;
  pricePerNight: number;
  totalPrice: number;
  availableRoomsCount: number;
}

export interface RoomTypeAvailabilityFormData {
  hotelId: string;
  checkInDate: Date;
  checkOutDate: Date;
}

// TODO: Implement RoomBookingAddon - not done in the backend yet
export interface RoomBookingAddon {
  type: number;
  description: string;
  amount: number;
}

export interface CreateBooking {
  hotelId: string;
  checkIn: Date;
  checkOut: Date;
  bookings: SelectedRoomBookings;
}

export interface RoomBooking extends RoomTypeAvailability {
  adults: number;
  children: number;
  addons: RoomBookingAddon[];
}

export interface GuestCount {
  adults: number;
  children: number;
}

export function foundAvailableRooms(availableRooms?: RoomTypeAvailability[]) {
  return availableRooms?.some((room) => room.availableRoomsCount > 0) ?? false;
}

export function getTotalRoomBookingCapacity(roomBookings: RoomBooking[]) {
  return roomBookings.reduce(
    (total, roomBooking) => total + roomBooking.capacity,
    0,
  );
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
  if (totalGuests === 1) return "1 Gæst";
  return `${totalGuests} Gæster`;
}

export function getTotalNightsStayText(nightCount: number) {
  const text = nightCount === 1 ? "nat" : "nætter";
  return `${nightCount} ${text}`;
}

export function getAdultsCountText(adults: number) {
  const text = adults === 1 ? "voksen" : "voksne";
  return `${adults} ${text}`;
}

export function getChildrenCountText(children: number) {
  const text = children === 1 ? "barn" : "børn";
  return `${children} ${text}`;
}

export function getGuestsCountText(guestCount: GuestCount) {
  const adultsText = getAdultsCountText(guestCount.adults);
  const childrenText = getChildrenCountText(guestCount.children);
  return `${adultsText}, ${childrenText}`;
}

export const formatDateRange = (
  checkInDate?: Date | string,
  checkOutDate?: Date | string,
) => {
  if (!checkInDate || !checkOutDate) {
    return null;
  }

  if (typeof checkInDate === "string") {
    checkInDate = new Date(checkInDate);
  }

  if (typeof checkOutDate === "string") {
    checkOutDate = new Date(checkOutDate);
  }

  if (checkInDate && checkOutDate) {
    return `${checkInDate.toLocaleDateString("da-DK")} - ${checkOutDate.toLocaleDateString("da-DK")}`;
  }
};

export const getPriceText = ({
  pricePerNight,
  totalPrice,
}: {
  pricePerNight: number;
  totalPrice: number;
}) => {
  const currency = new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const priceText = `${currency.format(pricePerNight)}/nat`;
  const totalPriceText = currency.format(totalPrice);

  return `${priceText} (${totalPriceText})`;
};

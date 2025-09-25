import { type DateRange } from "react-day-picker";

export interface GuestCount {
  adults: number;
  children: number;
}

export interface BookingSearchParams {
  hotelId: string;
  dateRange: DateRange | undefined;
}

export interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  hotelId: string;
  roomBookings: RoomBooking[];
}

export interface RoomBooking {
  roomType: number;
  adults: number;
  children: number;
  addons: BookingAddons[];
}

export interface BookingAddons {
  type: number;
  description: string;
  amount: number;
}

export const formatDateRange = (
  dateRange: DateRange | undefined,
  locale: string = "da-DK",
): string => {
  if (dateRange?.from && dateRange?.to) {
    return `${dateRange.from.toLocaleDateString(locale)} - ${dateRange.to.toLocaleDateString(locale)}`;
  }
  return "Select dates";
};

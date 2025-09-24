import { type DateRange } from "react-day-picker";

export interface GuestCount {
  adults: number;
  children: number;
}

export interface BookingSearchParams {
  dateRange: DateRange | undefined;
  guests: GuestCount;
}

export interface BookingFormData {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalGuests: number;
  nights: number;
}

export interface RoomAvailability {
  roomId: string;
  roomType: string;
  available: boolean;
  price: number;
  maxOccupancy: number;
}

export interface BookingWidgetProps {
  onSearch?: (data: BookingSearchParams) => void;
  className?: string;
  defaultValues?: Partial<{
    dateRange: DateRange;
    guests: GuestCount;
  }>;
}

export interface BookingState {
  isLoading: boolean;
  error: string | null;
  availableRooms: RoomAvailability[];
  selectedRoom: RoomAvailability | null;
}

// Validation helpers
export const validateBookingData = (data: BookingSearchParams): string[] => {
  const errors: string[] = [];

  if (!data.dateRange?.from || !data.dateRange?.to) {
    errors.push("Please select both check-in and check-out dates");
  }

  if (
    data.dateRange?.from &&
    data.dateRange?.to &&
    data.dateRange.from >= data.dateRange.to
  ) {
    errors.push("Check-out date must be after check-in date");
  }

  if (data.guests.adults < 1) {
    errors.push("At least one adult is required");
  }

  if (data.guests.adults > 10 || data.guests.children > 10) {
    errors.push("Maximum 10 guests per category allowed");
  }

  return errors;
};

export const formatGuestText = (guests: GuestCounts): string => {
  const total = guests.adults + guests.children;
  if (total === 1) return "1 Guest";
  return `${total} Guests`;
};

export const calculateNights = (dateRange: DateRange | undefined): number => {
  if (!dateRange?.from || !dateRange?.to) return 0;

  const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatDateRange = (
  dateRange: DateRange | undefined,
  locale: string = "da-DK",
): string => {
  if (dateRange?.from && dateRange?.to) {
    return `${dateRange.from.toLocaleDateString(locale)} - ${dateRange.to.toLocaleDateString(locale)}`;
  }
  return "Select dates";
};

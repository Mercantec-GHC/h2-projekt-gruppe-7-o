import { type DateRange } from "react-day-picker";

export interface BookingSearchRequest {
  hotelId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  adults: number;
  children: number;
}

export interface BookingSearchResponse {
  rooms: AvailableRoom[];
  checkIn: Date;
  checkOut: Date;
}

export interface RoomType {
  id: string;
  number: string;
  capacity: number;
  pricePerNight: number;
  floor: number;
  description: string;
}

export interface AvailableRoom extends RoomType {
  availableCount: number;
  totalPrice: number; //TODO: This should come from the backend, but it is not;
}

export interface Addons {
  type: number;
  description: string;
  amount: number;
}

export interface BookingReservationRequest {
  roomIds: string[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  addons: Addons[];
  // guestDetails: {
  //   firstName: string;
  //   lastName: string;
  //   email: string;
  //   phone?: string;
  // };
}

export interface BookingReservation {
  id: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  confirmationNumber: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

//TODO: use function from  date-fns or the like?
function toUtcIsoZ(input: string): string {
  const d = new Date(input); // parses the GMT+0200 offset correctly
  return d.toISOString(); // always UTC with 'Z'
}

export const bookingService = {
  // Step 1: Search for available rooms
  async searchAvailableRooms(
    searchParams: BookingSearchRequest,
  ): Promise<BookingSearchResponse> {
    const checkIn = toUtcIsoZ(searchParams.checkIn);
    const checkOut = toUtcIsoZ(searchParams.checkOut);

    const params = new URLSearchParams({
      hotelId: searchParams.hotelId,
      checkIn: checkIn,
      checkOut: checkOut,
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
    });

    const response = await fetch(`${BASE_URL}/rooms/availability?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to search for available rooms");
    }

    return response.json();
  },

  // Step 2: Get details for a specific room type
  async getRoomTypeDetails(roomTypeId: string): Promise<RoomType> {
    const response = await fetch(`${BASE_URL}/rooms/types/${roomTypeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get room type details");
    }

    return response.json();
  },

  // Step 3: Create a reservation
  async createBooking(
    bookingData: BookingReservationRequest,
  ): Promise<BookingReservation> {
    const { checkIn, checkOut } = bookingData;
    const formattedCheckin = toUtcIsoZ(checkIn);
    const formattedCheckout = toUtcIsoZ(checkOut);

    bookingData = {
      ...bookingData,
      checkIn: formattedCheckin,
      checkOut: formattedCheckout,
    };
    const response = await fetch(`${BASE_URL}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error("Failed to create reservation");
    }

    return response.json();
  },

  // Get user's bookings
  async getUserBookings(): Promise<BookingReservation[]> {
    const response = await fetch(`${BASE_URL}/bookings/my-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get user bookings");
    }

    return response.json();
  },

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to cancel booking");
    }
  },
};

// Helper function to convert DateRange to API format
export function formatDateRangeForAPI(dateRange: DateRange | undefined): {
  checkIn: string;
  checkOut: string;
} | null {
  if (!dateRange?.from || !dateRange?.to) {
    return null;
  }

  return {
    checkIn: dateRange.from.toISOString().split("T")[0],
    checkOut: dateRange.to.toISOString().split("T")[0],
  };
}

// Helper function to format search params with hotel
export function formatSearchParams(params: {
  hotelId: string;
  dateRange: DateRange | undefined;
  adults: number;
  children: number;
}): BookingSearchRequest | null {
  const dates = formatDateRangeForAPI(params.dateRange);
  if (!dates || !params.hotelId) {
    return null;
  }

  return {
    hotelId: params.hotelId,
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    adults: params.adults,
    children: params.children,
  };
}

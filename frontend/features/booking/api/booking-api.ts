import { apiClient } from "@/api/client";
import { toUtcIsoZ } from "@/lib/utils";
import {
  BookingDto,
  CreateBookingResponseDto,
  RoomTypesAvailablityRequestDto,
  RoomTypesAvailablityResponseDto,
} from "./dto";
import {
  roomBookingsToBookingDto,
  roomTypeAvailabilityDtoToRoomTypeAvailability,
} from "./transform";
import { CreateBooking } from "../domain";

async function searchAvailableRooms(
  searchParams: RoomTypesAvailablityRequestDto,
) {
  if (
    !searchParams.hotelId ||
    !searchParams.checkIn ||
    !searchParams.checkOut
  ) {
    throw new Error("Hotel ID, check-in, and check-out dates are required");
  }

  const checkIn = toUtcIsoZ(searchParams.checkIn);
  const checkOut = toUtcIsoZ(searchParams.checkOut);

  const params = new URLSearchParams({
    hotelId: searchParams.hotelId,
    checkIn: checkIn,
    checkOut: checkOut,
  });

  try {
    const res = await apiClient.get<RoomTypesAvailablityResponseDto>(
      `/rooms/availability/types?${params}`,
    );
    return roomTypeAvailabilityDtoToRoomTypeAvailability(res.data);
  } catch (error) {
    throw new Error("Failed to search for available rooms");
  }
}

async function createBooking({
  hotelId,
  checkIn,
  checkOut,
  bookings,
}: CreateBooking): Promise<CreateBookingResponseDto> {
  const bookingDataDto = roomBookingsToBookingDto({
    hotelId,
    checkIn,
    checkOut,
    bookings,
  });

  try {
    const res = await apiClient.post<CreateBookingResponseDto>(
      "/bookings",
      bookingDataDto,
    );
    return res.data;

    //TODO: throw the error from the backend here as well, instead of a string literal
  } catch (err) {
    throw new Error("Failed to create reservation");
  }
}

async function getAllBookings() {
  try {
    const res = await apiClient.get<BookingDto[]>(`/bookings`);
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch bookings");
  }
}

async function getBookingById(bookingId: string) {
  try {
    const res = await apiClient.get<BookingDto>(`/bookings/${bookingId}`);
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch booking");
  }
}

async function cancelBooking(bookingId: string) {
  const res = await apiClient.put(`/bookings/cancel/${bookingId}`);
  return res;
}

export default {
  searchAvailableRooms,
  createBooking,
  getAllBookings,
  getBookingById,

  cancelBooking,
};

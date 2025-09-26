import { apiClient } from "@/api/client";
import { toUtcIsoZ } from "@/lib/utils";
import {
  CreateBookingRequestDto,
  CreateBookingResponseDto,
  RoomTypesAvailablityRequestDto,
  RoomTypesAvailablityResponseDto,
} from "./dto";
import {
  roomBookingsToBookingDto,
  roomTypeAvailabilityDtoToRoomTypeAvailability,
} from "./transform";
import { CreateBooking, RoomBooking } from "../domain";
import { SelectedRoomBookings } from "../bookingStore";
import { AxiosResponse } from "axios";

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

export default { searchAvailableRooms, createBooking };

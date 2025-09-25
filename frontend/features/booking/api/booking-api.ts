import { apiClient } from "@/api/client";
import { toUtcIsoZ } from "@/lib/utils";
import {
  RoomTypesAvailablityRequestDto,
  RoomTypesAvailablityResponseDto,
} from "./dto";
import { roomTypeAvailabilityDtoToRoomTypeAvailability } from "./transform";

async function searchAvailableRooms(
  searchParams: RoomTypesAvailablityRequestDto,
) {
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

async function createBooking(
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

  try {
    const res = await apiClient.post<BookingReservation>(
      "/bookings",
      bookingData,
    );
    return res.data;
    //TODO: throw the error from the backend here as well, instead of a string literal
  } catch (err) {
    throw new Error("Failed to create reservation");
  }
}

export default { searchAvailableRooms, createBooking };

import { toUtcIsoZ } from "@/lib/utils";
import { SelectedRoomBookings } from "../bookingStore";
import { CreateBooking, RoomTypeAvailability } from "../domain";
import {
  CreateBookingRequestDto,
  RoomBookingRequestDto,
  RoomTypesAvailablityResponseDto,
} from "./dto";
import { CONSTANTS } from "@/lib/constants";

//TODO: rename these? Maybe we can use a class with static methods, or just wrap it in an object - not sure what to do to make it easier to work with
export function roomTypeAvailabilityDtoToRoomTypeAvailability(
  roomTypeAvailabilityDto: RoomTypesAvailablityResponseDto,
): RoomTypeAvailability[] {
  return roomTypeAvailabilityDto.roomTypeAvailabilities.map(
    (roomTypeAvailability) => ({
      type: roomTypeAvailability.type,
      capacity: roomTypeAvailability.capacity,
      roomDescription: roomTypeAvailability.roomDescription,
      roomImageUrl: roomTypeAvailability.roomImageUrl,
      pricePerNight: roomTypeAvailability.pricePerNight,
      totalPrice: roomTypeAvailability.totalPrice,
      availableRoomsCount: roomTypeAvailability.availableRoomsCount,
    }),
  );
}

//TODO: should we type the input here better? This is the same that comes from the frontend into the booking-api layer.
export function roomBookingsToBookingDto({
  hotelId,
  checkIn,
  checkOut,
  bookings,
}: CreateBooking): CreateBookingRequestDto {
  const formattedCheckin = toUtcIsoZ(checkIn);
  const formattedCheckout = toUtcIsoZ(checkOut);

  const roomBookings = Object.values(bookings).flat();
  const roomBookingsDto: RoomBookingRequestDto[] = roomBookings.map(
    (booking) => {
      return {
        // TODO @Karl @Abdi - vi burde bare sende typen som string måske, det her er giga usikkert....
        roomType: CONSTANTS.ROOM_TYPES.indexOf(booking.type),
        adults: booking.adults,
        children: booking.children,
        addons: booking.addons,
      };
    },
  );

  return {
    hotelId,
    checkIn: formattedCheckin,
    checkOut: formattedCheckout,
    roomBookings: roomBookingsDto,
  };
}

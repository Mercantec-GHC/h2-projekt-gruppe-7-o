import { useQuery } from "@tanstack/react-query";
import { RoomTypesAvailablityRequestDto } from "../api/dto";
import BookingApi from "../api/booking-api";

export function useSearchAvailableRooms(
  searchParams?: RoomTypesAvailablityRequestDto | undefined,
  enabled?: boolean,
) {
  return useQuery({
    // TODO: we need to pass the search params into the queryKey, but then I'm not sure how we call this hook again in the BookingChooseRoom component, without having to pas in all details again.
    queryKey: ["availableRooms"],
    queryFn: () => {
      if (
        !searchParams ||
        !searchParams.checkIn ||
        !searchParams.checkOut ||
        !searchParams.hotelId
      )
        throw new Error("Search params are required");
      return BookingApi.searchAvailableRooms(searchParams);
      // return bookingService.searchAvailableRooms(searchParams);
    },
    staleTime: Infinity,
    enabled,
  });
}

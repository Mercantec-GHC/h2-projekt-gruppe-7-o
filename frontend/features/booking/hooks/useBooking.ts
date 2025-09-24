import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookingReservationRequest,
  BookingSearchRequest,
  bookingService,
} from "../services/bookingService";

export function useSearchAvailableRooms(
  searchParams?: BookingSearchRequest | undefined,
  enabled?: boolean,
) {
  return useQuery({
    // TODO: we need to pass the search params into the queryKey, but then I'm not sure how we call this hook again in the BookingChooseRoom component, without having to pas in all details again.
    queryKey: ["availableRooms"],
    queryFn: () => {
      if (!searchParams) throw new Error("Search params are required");
      return bookingService.searchAvailableRooms(searchParams);
    },
    staleTime: Infinity,
    enabled,
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: (bookingDetails: BookingReservationRequest) => {
      return bookingService.createBooking(bookingDetails);
    },
  });
}


export function useGetAllUserBookings(userId: string) {
  return useQuery({
    queryKey: ["userBookings", userId],
    queryFn: () => {
      return bookingService.getUserBookings(userId);
    },
    staleTime: Infinity,
  });
}

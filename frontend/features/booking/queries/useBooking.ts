import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookingReservationRequest,
  BookingSearchRequest,
  bookingService,
} from "../services/bookingService";

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

import { useMutation, useQueryClient } from "@tanstack/react-query";
import BookingApi from "../api/booking-api";

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      return BookingApi.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
  });
};

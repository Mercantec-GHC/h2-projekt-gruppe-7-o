import { useMutation } from "@tanstack/react-query";
import BookingApi from "../api/booking-api";
import { CreateBooking } from "../domain";

export function useCreateBooking() {
  return useMutation({
    mutationFn: (bookingDetails: CreateBooking) => {
      return BookingApi.createBooking(bookingDetails);
    },
  });
}

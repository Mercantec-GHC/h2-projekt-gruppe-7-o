import { useQuery } from "@tanstack/react-query";
import BookingApi from "../api/booking-api";

// export function useGetAllUserBookings(userId: string) {
//   return useQuery({
//     queryKey: ["userBookings", userId],
//     queryFn: () => {
//       return BookingApi
//     },
//     staleTime: Infinity,
//   });
// }

//TODO: this should only be accessible to receptionists, admins - maybe cleaning staff?
export function useAllBookings() {
  return useQuery({
    queryKey: ["allBookings"],
    queryFn: () => {
      return BookingApi.getAllBookings();
    },
  });
}

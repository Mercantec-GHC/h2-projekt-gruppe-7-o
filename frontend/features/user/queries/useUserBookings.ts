import { useQuery } from "@tanstack/react-query";
import UserApi from "@/features/user/api/user-api";

export const useUserBookings = () => {
  return useQuery({
    queryKey: ["userBookings"],
    queryFn: UserApi.getBookings,
  });
};

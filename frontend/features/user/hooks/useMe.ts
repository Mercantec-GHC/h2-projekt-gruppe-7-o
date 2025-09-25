import { useQuery } from "@tanstack/react-query";
import UserApi from "@/features/user/api/user-api";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: UserApi.getMe,
    staleTime: Infinity,
  });
};

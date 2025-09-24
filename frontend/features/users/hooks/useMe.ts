import { useQuery } from "@tanstack/react-query";
import { getMe } from "../lib/getMe";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: Infinity,
  });
};

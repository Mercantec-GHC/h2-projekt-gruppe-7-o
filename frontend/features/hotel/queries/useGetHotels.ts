"use client";

import { useQuery } from "@tanstack/react-query";
import HotelApi from "../api/hotel-api";

// Query keys for consistent caching
export const hotelKeys = {
  all: ["hotels"],
  list: () => [...hotelKeys.all, "list"],
  detail: (id: string) => [...hotelKeys.all, "detail", id],
};

// Hook for fetching all hotels
export function useHotels() {
  return useQuery({
    queryKey: hotelKeys.list(),
    queryFn: HotelApi.getHotels,
    staleTime: 5 * 60 * 1000, // Hotels don't change often, cache for 5 minutes
  });
}

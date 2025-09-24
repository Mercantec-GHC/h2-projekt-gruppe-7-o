"use client";

import { useQuery } from "@tanstack/react-query";
import { getHotels } from "@/features/hotels/lib/getHotels";
import { type Hotel } from "@/features/hotels/types/Hotel";

// Query keys for consistent caching
export const hotelKeys = {
  all: ["hotels"] as const,
  list: () => [...hotelKeys.all, "list"] as const,
  detail: (id: string) => [...hotelKeys.all, "detail", id] as const,
};

// Hook for fetching all hotels
export function useHotels() {
  return useQuery({
    queryKey: hotelKeys.list(),
    queryFn: getHotels,
    staleTime: 5 * 60 * 1000, // Hotels don't change often, cache for 5 minutes
  });
}

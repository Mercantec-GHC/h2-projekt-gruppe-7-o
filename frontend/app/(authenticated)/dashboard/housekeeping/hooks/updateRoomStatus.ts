"use client";


import { useState, useCallback } from "react";
import { apiClient } from "@/api/client";
import { HousekeepingStatus } from "../types/room";
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";

export const useUpdateRoomStatus = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Opdater status
  const updateStatus = useCallback(async (roomId: string, newStatus: number | HousekeepingStatus) => {
    setIsLoading(true);
    try {
      const res = await apiClient.put(`/rooms/${roomId}/status/${newStatus}`);
      return res.data;
    } catch (err) {
      const errorMessage = (err as any)?.response?.data?.error || (err as Error).message || "Fejl ved opdatering af værelse";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Opdater isPriority flag
  const updatePriority = useCallback(
    async (roomId: string, isPriority: boolean) => {
      setIsLoading(true);
      try {
        const res = await apiClient.put(`/rooms/${roomId}/priority/${isPriority}`);
        return res.data as HousekeepingRoom;
      } catch (err) {
        const errorMessage =
          (err as any)?.response?.data?.error || (err as Error).message || "Fejl ved opdatering af prioritet";
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { updateStatus, updatePriority, isLoading };
};
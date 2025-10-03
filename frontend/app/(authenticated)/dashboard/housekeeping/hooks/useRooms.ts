import { useState, useEffect, useCallback, use } from "react";
import { apiClient } from "@/api/client";
import { Room } from "../types/room";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      setError("Kunne ikke hente værelser.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, isLoading, error, refetch: fetchRooms };
}

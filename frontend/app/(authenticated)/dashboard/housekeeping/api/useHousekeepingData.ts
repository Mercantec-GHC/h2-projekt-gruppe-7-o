import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/api/client";
import {
  dtoToHousekeepingRoom,
  HousekeepingRoom,
} from "./HousekeepingRoomTransform";
import { HousekeepingRoomDto } from "./HousekeepingRoomDto";

const fetchRooms = async (url: string) => {
  try {
    const response = await apiClient.get<HousekeepingRoomDto[]>(url);

    return response.data;
  } catch (error) {
    throw new Error(`Fejl under hentning af data fra ${url}: ${error}`);
  }
};

// --- Til Managers Dashboard Oversigt ---
export const useHousekeepingDashboard = () => {
  const [rooms, setRooms] = useState<HousekeepingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchRooms("/rooms/housekeeping-dashboard");
      const transformedRooms = data.map(dtoToHousekeepingRoom);
      setRooms(transformedRooms);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Automatisk genindlæsning (hver 15. sekund)
    const interval = setInterval(fetchData, 60000);

    return () => clearInterval(interval); // Ryd op ved unmount
  }, [fetchData]);

  const roomsToClean = rooms.filter(
    (r) =>
      r.status === "DirtyCheckout" ||
      r.status === "DirtyStayOver" ||
      r.status === "AwaitingInspection"
  );

  return {
    rooms,
    roomsToClean,
    error,
    isLoading,
    refresh: fetchData, // Manuel genindlæsningsfunktion
  };
};

// --- Til Housekeepers Opgaveliste ---
export const useHousekeeperTasks = (housekeeperId: string) => {
  const [tasks, setTasks] = useState<HousekeepingRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const shouldFetch = !!housekeeperId; // Hent kun hvis ID er tilgængeligt

  const fetchData = useCallback(async () => {
    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const url = `/rooms/housekeeper-tasks/${housekeeperId}`;
      const data = await fetchRooms(url);
      const transformedTasks = data.map(dtoToHousekeepingRoom);
      setTasks(transformedTasks);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [housekeeperId, shouldFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tasks,
    error,
    isLoading,
    refresh: fetchData,
  };
};

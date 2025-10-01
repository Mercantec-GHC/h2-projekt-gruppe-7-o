// frontend/features/houseKeeping/api/useHousekeepingData.ts

import { useState, useEffect, useCallback } from 'react';
// Importer Axios og din apiClient
import { apiClient } from '@/api/client';
import { dtoToHousekeepingRoom, HousekeepingRoom } from './HousekeepingRoomTransform';
import { HousekeepingRoomDto } from './HousekeepingRoomDto';

// API_BASE_URL er ikke nødvendig her, da apiClient allerede har baseURL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; 

// --- Generisk Fetch-funktion opdateret til at bruge apiClient (Axios) ---
// Da apiClient har withCredentials: true, håndteres tokenet automatisk via cookies.
const fetchRooms = async (url: string) => {
    // Bemærk: Axios tager kun stien, da BASE_URL er sat i apiClient
    try {
        // apiClient.get er nemmere end at kalde .request og specificere method: 'GET'
        const response = await apiClient.get<HousekeepingRoomDto[]>(url); 

        // Axios kaster automatisk en fejl, hvis statuskoden er 4xx eller 5xx,
        // så du behøver ikke længere if (!response.ok) checket.
        
        return response.data; // Axios returnerer data i .data property
    } catch (error) {
        // Kast en mere generisk fejl, eller log fejlen fra Axios
        // (f.eks. error.response.status for at se 401/403 fejlen)
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
            const data = await fetchRooms('/rooms/housekeeping-dashboard'); 
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
        
        // Simuler SWR's automatisk genindlæsning (hver 15. sekund)
        const interval = setInterval(fetchData, 15000); 
        
        return () => clearInterval(interval); // Ryd op ved unmount
    }, [fetchData]);

    const roomsToClean = rooms.filter(r => 
        r.status === 'DirtyCheckout' || 
        r.status === 'DirtyStayOver' || 
        r.status === 'AwaitingInspection'
    );

    return {
        rooms,
        roomsToClean,
        error,
        isLoading,
        refresh: fetchData // Manuel genindlæsningsfunktion
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
            // Nu returnerer fetchRooms HousekeepingRoomDto[] direkte
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
        // Starter IKKE interval her, da opgavelister ofte kun opdateres efter handling.
    }, [fetchData]);

    return {
        tasks,
        error,
        isLoading,
        refresh: fetchData 
    };
};
import { useState } from 'react';
import { apiClient } from '@/api/client';
import { isAxiosError } from 'axios';

export const useTaskUpdater = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Status 4 'AwaitingInspection'
    const AWAITING_INSPECTION_STATUS = 4; 

    const updateStatus = async (roomId: string) => {
        setIsLoading(true);
        setError(null);

        const url = `/rooms/${roomId}/status/${AWAITING_INSPECTION_STATUS}`;

        let errorMessage = "Der skete en ukendt fejl under opdatering.";

        try {
            
            await apiClient.post(url); 

            // Axios kaster automatisk en fejl på 4xx/5xx statuskoder,
            // så vi behøver ikke et manuelt !response.ok tjek her.

            // Hvis opdateringen lykkes, returner true
            return true;

        } catch (err) {
            // Håndter fejl fra Axios
            if (isAxiosError(err) && err.response) {
                 // Prøv at hente fejlbeskeden fra backendens svar
                 const backendError = err.response.data as { error?: string };
                 errorMessage = backendError.error || `Fejl ${err.response.status}: Kunne ikke opdatere status for værelse ${roomId}.`;
            } else if (err instanceof Error) {
                 errorMessage = err.message;
            }
            
            setError(errorMessage);
            // Gen-kast fejlen for at lade UI'en/caller'en håndtere den
            throw new Error(errorMessage); 
        } finally {
            setIsLoading(false);
        }
    };

    return { updateStatus, isLoading, error };
};
"use client";

import * as React from 'react';
import { useState, useCallback } from 'react'; 

// Henter Sonner's toast funktion
import { toast } from "sonner"; 

// Opdaterede importstier (antaget korrekt i dit projekt)
import { useHousekeeperTasks } from "../api/useHousekeepingData"
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";

// Sikre imports fra komponenter og ShadCN
import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 

// Ikon Imports
import { IconListCheck } from "@tabler/icons-react";
import { CheckCircle, Hotel, Loader2, RefreshCw, AlertTriangle, Star, Bed, MapPin } from "lucide-react"; // Tilføjede MapPin for Hotel
import { useSessionStore } from "@/features/auth/stores/sessionStore"; 
import { apiClient } from "@/api/client";


// ---------------------------------------------
// Lokal Hook til Status Opdatering (Mutation)
// ---------------------------------------------
const useLocalUpdateRoomStatus = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Status 4 i C# er 'AwaitingInspection'
    const AWAITING_INSPECTION_STATUS = 4; 

    const updateStatus = useCallback(async (roomId: string) => {
        setIsLoading(true);
        try {
            // POST request til backend endpoint
            const res = await apiClient.post(`/rooms/${roomId}/status/${AWAITING_INSPECTION_STATUS}`);
            return res.data; // returnerer opdateret værelse DTO
        } catch (err) {
            const errorMessage = (err as any)?.response?.data?.error || (err as Error).message || 'Fejl ved opdatering af værelse';
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateStatus, isLoading };
};
// ---------------------------------------------


// --- Shadcn-optimeret Komponent til Opgaveelementet (Bruger Sonner) ---
const TaskItem = ({ task, refreshList }: { task: HousekeepingRoom, refreshList: () => void }) => {
    const { updateStatus, isLoading: isUpdating } = useLocalUpdateRoomStatus();
    const [statusError, setStatusError] = useState<string | null>(null);

    const handleComplete = async () => {
        setStatusError(null); 
        
        // Sonner notifikation mens vi venter
        const promise = updateStatus(task.id);

        // Sonner's promise-funktion giver god UX under loading
        toast.promise(promise, {
            loading: `Opdaterer værelse ${task.number}...`,
            success: () => {
                // Opdater listen efter succesfuld opdatering
                refreshList(); 
                return `Værelse ${task.number} er nu klar til inspektion!`;
            },
            error: (err) => {
                const errorMessage = (err as Error).message;
                setStatusError(errorMessage);
                return `Fejl: ${errorMessage}`;
            },
            action: {
                label: 'Luk',
                onClick: () => console.log('lukker notifikation'),
            },
            duration: 5000,
        });
    };

    const isCheckout = task.status === 'DirtyCheckout';
    // Sikrer at displayColor bruges korrekt til border class
    const borderClass = task.displayColor.replace('bg-', 'border-'); 
    const statusLabel = isCheckout ? 'Tjek Ud Rengøring' : task.status === 'DirtyStayOver' ? 'Opholds Service' : task.status;
    const taskType = isCheckout ? 'Fuld Rengøring (DCO)' : 'Daglig Service (DS)';
    
    // Antager at HousekeepingRoom har 'hotelName' og 'floor' properties
    const hotelName = task.hotelName || "Ukendt Hotel"; 
    const roomFloor = task.floor; 

    return (
        <Card 
            className={`
                mb-4 shadow-lg hover:shadow-xl transition-shadow 
                border-l-4 ${borderClass} 
                ${task.isPriority ? 'border-r-4 border-r-yellow-500' : ''}
            `}
        >
            <CardHeader className="p-4 flex flex-row items-start justify-between">
                <div className="flex flex-col">
                    <CardTitle className="text-2xl font-semibold flex items-center">
                        <Hotel className="h-6 w-6 mr-3 text-primary" /> 
                        Værelse {task.number}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                        <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                        {taskType}
                    </CardDescription>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                    {task.isPriority && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm">
                            <Star className="h-4 w-4 mr-1 fill-white" /> PRIORITET
                        </Badge>
                    )}
                    <Badge variant={isCheckout ? 'destructive' : 'secondary'} className="text-xs">
                        {statusLabel}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
                {/* Værelsesdetaljer (Hotel og Etage) */}
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" /> Hotel:
                        </span>
                        <span className="font-semibold text-primary">{hotelName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                            Etage:
                        </span>
                        <span className="font-semibold">{roomFloor}</span>
                    </div>
                </div>

                <Separator className="my-3" />

                {/* Vis fejlmeddelelse med Shadcn Alert */}
                {statusError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Opdatering Fejlede!</AlertTitle>
                        <AlertDescription>{statusError}</AlertDescription>
                    </Alert>
                )}

                <Button 
                    onClick={handleComplete} 
                    disabled={isUpdating}
                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 transition-colors"
                >
                    {isUpdating ? 
                        <>
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Sender Status...
                        </> 
                        : 
                        <>
                            <CheckCircle className="h-6 w-6 mr-2" />
                            Færdiggør (Klar til Inspektion)
                        </>
                    }
                </Button>
            </CardContent>
        </Card>
    );
};


// --- Hovedkomponenten til Opgavelisten ---
export default function HousekeeperTasksPage() {
    // LØSNING: Kalder hooken separat for at undgå at oprette et nyt objekt
    const user = useSessionStore(state => state.user);
    const hydrated = useSessionStore(state => state.hydrated);
    
    const housekeeperId = user?.sub || ''; 
    const { tasks, isLoading, error, refresh } = useHousekeeperTasks(housekeeperId); 

    if (!hydrated || !user) {
        return (
            <DashboardBodyWrapper>
                <div className="flex justify-center items-center h-screen">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="ml-3 text-lg text-muted-foreground">Indlæser bruger...</p>
                </div>
            </DashboardBodyWrapper>
        );
    }

    if (error) {
        return (
            <DashboardBodyWrapper>
                <div className="p-8">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Fejl ved indlæsning af opgaver</AlertTitle>
                        <AlertDescription>Kunne ikke hente opgavelisten. Prøv venligst at synkronisere igen. {error.message}</AlertDescription>
                    </Alert>
                    <Button onClick={() => refresh()} className="mt-4">
                         <RefreshCw className="h-4 w-4 mr-2" /> Synkroniser Nu
                    </Button>
                </div>
            </DashboardBodyWrapper>
        );
    }

    // Loader med Skeleton for bedre UX
    if (isLoading) {
        return (
            <DashboardBodyWrapper>
                <div className="p-8 max-w-xl mx-auto">
                     <h1 className="text-2xl font-bold mb-4">Mine Rengøringsopgaver</h1>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="mb-4">
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ))}
                </div>
            </DashboardBodyWrapper>
        );
    }

    return (
        <DashboardBodyWrapper>
            {/* Div lag for at håndtere padding og begrænse bredden */}
            <div className="p-6 md:p-8"> 
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold flex items-center">
                        <IconListCheck className="h-8 w-8 mr-3 text-primary" /> 
                        Mine Rengøringsopgaver
                    </h1>
                    <Button variant="outline" onClick={() => refresh()} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> 
                        Synkroniser
                    </Button>
                </div>
                
                <Separator className="mb-6" />

                {tasks.length === 0 ? (
                    <div className="text-center p-10 border-dashed border-2 rounded-xl text-muted-foreground bg-green-50/50">
                        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-600" />
                        <p className="text-xl font-semibold text-green-700">Opgavelisten er Tom!</p>
                        <p className="mt-2">Du har fuldført alle tildelte opgaver. Godt arbejde!</p>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto">
                        {tasks.map((task) => (
                            <TaskItem key={task.id} task={task} refreshList={refresh} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardBodyWrapper>
    );
}
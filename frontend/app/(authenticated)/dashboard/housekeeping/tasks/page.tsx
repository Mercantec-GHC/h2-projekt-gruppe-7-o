// page.tsx

"use client";
import * as React from 'react';
import { useState, useCallback } from 'react'; 
import { toast } from "sonner"; 
import { useHousekeeperTasks } from "../api/useHousekeepingData"
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";
import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { IconListCheck } from "@tabler/icons-react";
import { CheckCircle, Hotel, Loader2, RefreshCw, AlertTriangle, Star, Bed, MapPin } from "lucide-react";
import { useSessionStore } from "@/features/auth/stores/sessionStore"; 

import { getStatusConfig, } from "../api/statusConfig"; 
import { useUpdateRoomStatus } from '../hooks/updateRoomStatus';



const TaskItem = ({ task, refreshList }: { task: HousekeepingRoom, refreshList: () => void }) => {

    const { updateStatus, isLoading: isUpdating } = useUpdateRoomStatus(); 
    const [statusError, setStatusError] = useState<string | null>(null);

    const handleComplete = async () => {
        setStatusError(null); 
        
        // Kalder med hook og CleanReady status streng
        const promise = updateStatus(task.id, "CleanReady");

        toast.promise(promise, {
            loading: `Opdaterer værelse ${task.number}...`,
            success: () => {
                refreshList(); 
                return `Værelse ${task.number} er nu markeret som rent og klar!`;
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
    const config = getStatusConfig(task.status);
    const taskType = isCheckout ? 'Fuld Rengøring (DCO)' : task.status === 'DirtyStayOver' ? 'Daglig Service (DS)' : config.label;
    const hotelName = task.hotelName || "Ukendt Hotel"; 
    const roomFloor = task.floor; 

    return (
        <Card 
            className={`
                mb-4 shadow-lg hover:shadow-xl transition-shadow 
                border-l-4 ${config.borderColor} 
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
                    <Badge
                        variant={isCheckout ? 'destructive' : 'secondary'}
                        className={`text-xs ${config.color.split(" ")[0]} text-white`}
                    >
                        {config.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-0">
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
                            Færdiggør (Sæt til CleanReady)
                        </>
                    }
                </Button>
            </CardContent>
        </Card>
    );
};


// --- Hovedkomponenten til Opgavelisten ---
export default function HousekeeperTasksPage() {
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
                        <AlertDescription>Kunne ikke hente opgavelisten. Prøv venligst at synkronisere igen. {error?.message}</AlertDescription>
                    </Alert>
                    <Button onClick={() => refresh()} className="mt-4">
                         <RefreshCw className="h-4 w-4 mr-2" /> Synkroniser Nu
                    </Button>
                </div>
            </DashboardBodyWrapper>
        );
    }

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
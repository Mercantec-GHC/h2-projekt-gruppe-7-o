"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Antager disse stier baseret på din mappestruktur
import { DashboardBodyWrapper } from "@/components/dashboard/DashboardBodyWrapper";
import { useSessionStore } from "@/features/auth/stores/sessionStore"; 

import { Loader2 } from "lucide-react";

// --- ROLLE DEFINITIONER (Flyttet UDENFOR den valgte blok for at undgå gentagelse) ---
// Disse typer skal findes i din '@/features/user/domain' fil.
export type UserRole = "Customer" | "Admin" | "Receptionist" | "HousekeepingManager" | "Cleaner";
export type DashboardRole = Exclude<UserRole, "Customer">;

// Vi definerer konstante rolleværdier for at undgå fejl med 'RoleNames'
// Bemærk: I et rigtigt projekt bør disse komme fra en delt utility fil.
const RoleNames = {
    Admin: "Admin" as UserRole,
    Receptionist: "Receptionist" as UserRole,
    HousekeepingManager: "HousekeepingManager" as UserRole,
    Cleaner: "Cleaner" as UserRole,
};

const { Admin, HousekeepingManager, Receptionist, Cleaner } = RoleNames;

export default function CleaningHubPage() {
    const router = useRouter();
    
    // Henter user og isLoaded status fra session store
    const { user, hydrated } = useSessionStore(state => ({
        user: state.user,
        hydrated: state.hydrated,
    }));
    
    // Antager, at brugerens rolle er gemt i user.role som en streng (DashboardRole)
    const role: DashboardRole | undefined = user?.role as DashboardRole | undefined;

    
    useEffect(() => {
        // Vent indtil sessionen er indlæst, og vi har role-data
        if (!hydrated || !role) return;

        // --- Manager/Receptionist (Oversigt) ---
        if (role === Admin || role === HousekeepingManager || role === Receptionist) {
            // Sender lederen/receptionisten til den detaljerede overbliksside
            router.replace('/dashboard/housekeeping/overview');
            return;
        }

        // --- Cleaner (Opgaveliste) ---
        if (role === Cleaner) {
            // Sender rengøringsassistenten direkte til deres opgaveliste
            router.replace('/dashboard/housekeeping/tasks');
            return;
        }

        // Hvis brugeren er logget ind, men ingen housekeeping-rolle, send til hoveddashboardet.
        router.replace('/dashboard'); 

    }, [hydrated, role, router]);

    // Vis en loading-tilstand, mens omdirigeringen sker
    return (
        <DashboardBodyWrapper>
            <div className="flex flex-col items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="mt-4 text-gray-600">Omdirigerer til det relevante rengøringsdashboard...</p>
            </div>
        </DashboardBodyWrapper>
    );
}

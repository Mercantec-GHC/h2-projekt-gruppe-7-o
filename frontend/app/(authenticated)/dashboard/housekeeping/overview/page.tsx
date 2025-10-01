"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "@/api/client"; // Antager denne sti er korrekt
// Importer de nødvendige Shadcn-komponenter
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Importer Lucide-ikoner for bedre visuel feedback
import { Ban, CheckCircle, Clock, Hotel, Loader2, RefreshCw, AlertTriangle, Star, Bed, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Tilføjer Tooltip for bedre UX
import { IconListCheck } from "@tabler/icons-react";

// Sørg for at tilføje Tooltip-komponenterne, hvis de ikke er der

export type HousekeepingStatus =
  | "CleanReady"
  | "DirtyCheckout"
  | "DirtyStayOver"
  | "AwaitingInspection"
  | "OutOfOrder"
  | "DoNotDisturb";

export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: HousekeepingStatus;
  isPriority: boolean;
  lastStatusUpdateTime: string;
  hotelId: string;
  hotelName?: string;
}

// Hardkodede hotelnavne map (beholdes for funktionalitet)
const hotelNames: Record<string, string> = {
  "1a95a667-6cd2-4f76-912a-5df59e812c47": "KabdiKhan Odense",
  "71f9e1f7-5f99-4d4f-a8ca-736eb8e96642": "KabdiKhan Aalborg",
  "9f5021f2-b3af-4acc-a595-1c64e7c30830": "KabdiKhan København",
  "a568b108-650a-4d6e-9312-61602b233ad6": "KabdiKhan Aarhus",
};

// --- Hjælpefunktioner og Hooks ---

/**
 * Konfigurationsfunktion for statusmærkater.
 * @param status - Værelsets rengøringsstatus.
 */
const getStatusConfig = (status: HousekeepingStatus) => {
  switch (status) {
    case "CleanReady":
      return { label: "Clean – Ready (VC)", color: "bg-green-500 hover:bg-green-600", icon: CheckCircle };
    case "DirtyCheckout":
      return { label: "Dirty – Checkout (DCO)", color: "bg-red-600 hover:bg-red-700", icon: Clock };
    case "DirtyStayOver":
      return { label: "Dirty – Stay Over (DS)", color: "bg-orange-500 hover:bg-orange-600", icon: Clock };
    case "AwaitingInspection":
      return { label: "Awaiting Inspection (CI)", color: "bg-yellow-500 hover:bg-yellow-600", icon: AlertTriangle };
    case "OutOfOrder":
      return { label: "Out of Order (OOO)", color: "bg-gray-600 hover:bg-gray-700", icon: Ban };
    case "DoNotDisturb":
      return { label: "Do Not Disturb (DND)", color: "bg-purple-600 hover:bg-purple-700", icon: Ban };
    default:
      return { label: status, color: "bg-gray-400 hover:bg-gray-500", icon: Bed };
  }
};

/**
 * Beregner sorteringsprioritet baseret på status og prioritet.
 * @param room - Værelsesobjekt.
 */
const getPriority = (room: Room): number => {
  if (room.isPriority) return 0; // Højeste prioritet
  switch (room.status) {
    case "DirtyCheckout":
      return 1;
    case "OutOfOrder":
      return 2;
    case "DirtyStayOver":
      return 3;
    case "AwaitingInspection":
      return 4;
    case "DoNotDisturb":
      return 5;
    case "CleanReady":
      return 6;
    default:
      return 99;
  }
};

// --- Hovedkomponenten ---

export default function HousekeepingOverviewPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Henter værelsesdata fra API'et.
   */
  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/rooms");
      let data: Room[] = res.data;

      // Tilføj hotelName baseret på map
      data = data.map(r => ({
        ...r,
        hotelName: hotelNames[r.hotelId] ?? "Unknown Hotel"
      }));

      setRooms(data);

      const uniqueHotels = Array.from(
        new Map(data.map(r => [r.hotelId, { id: r.hotelId, name: r.hotelName ?? "Unknown Hotel" }])).values()
      );
      setHotels(uniqueHotels);

      // Sæt standardhotel, hvis intet er valgt
      if (!selectedHotel && uniqueHotels.length > 0) {
        setSelectedHotel(uniqueHotels[0].id);
      }
    } catch (err) {
      console.error("Fejl ved hentning af værelser:", err);
      setError("Kunne ikke hente værelsesdata. Prøv igen.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedHotel]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  /**
   * Sorterer og filtrerer værelser baseret på valgt hotel og prioritet.
   */
  const sortedRooms = useMemo(() => {
    return rooms
      .filter(r => !selectedHotel || r.hotelId === selectedHotel)
      .slice()
      .sort((a, b) => {
        const prioA = getPriority(a);
        const prioB = getPriority(b);
        if (prioA !== prioB) return prioA - prioB;
        return a.number.localeCompare(b.number); // Sorter efter værelsesnummer som sekundær sortering
      });
  }, [rooms, selectedHotel]);

  // Statistikker for det valgte hotel
  const hotelStats = useMemo(() => {
    const totalRooms = sortedRooms.length;
    const dirtyRooms = sortedRooms.filter(r => r.status === "DirtyCheckout" || r.status === "DirtyStayOver").length;
    const cleanRooms = sortedRooms.filter(r => r.status === "CleanReady").length;
    const priorityRooms = sortedRooms.filter(r => r.isPriority).length;

    return { totalRooms, dirtyRooms, cleanRooms, priorityRooms };
  }, [sortedRooms]);

  // --- Loader/Fejltilstande ---

  if (isLoading && rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Henter værelsesoversigt...</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 w-full max-w-6xl">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg mx-auto max-w-lg mt-10">
        <AlertTriangle className="h-6 w-6 inline-block mr-2" />
        <p className="font-semibold">{error}</p>
        <Button onClick={fetchRooms} className="mt-4" variant="destructive">
          <RefreshCw className="h-4 w-4 mr-2" /> Prøv igen
        </Button>
      </div>
    );
  }

  // --- Selve UI'en ---

  return (
    <TooltipProvider>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header og Filter */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Hotel className="h-8 w-8 mr-3 text-primary" />
            Rengøringsoversigt
          </h1>
          <div className="flex items-center space-x-4">
            <Button onClick={fetchRooms} variant="outline" size="icon" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger className="w-[200px] md:w-[250px]">
                <SelectValue placeholder="Vælg hotel" />
              </SelectTrigger>
              <SelectContent>
                {hotels.map(h => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <Separator />

        {/* Statistik Kort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Værelser</CardTitle>
              <Bed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hotelStats.totalRooms}</div>
              <p className="text-xs text-muted-foreground">Værelser i alt</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-red-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Til Rengøring (DCO/DS)</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{hotelStats.dirtyRooms}</div>
              <p className="text-xs text-muted-foreground">{((hotelStats.dirtyRooms / hotelStats.totalRooms) * 100 || 0).toFixed(1)}% af totalen</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-green-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rene & Klar (VC)</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{hotelStats.cleanRooms}</div>
              <p className="text-xs text-muted-foreground">Klar til nye gæster</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-yellow-400">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioritetsværelser</CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{hotelStats.priorityRooms}</div>
              <p className="text-xs text-muted-foreground">Skal rengøres først</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Værelsesliste/Grid */}
        {sortedRooms.length === 0 ? (
          <div className="text-center p-10 border-dashed border-2 rounded-lg text-muted-foreground">
            <IconListCheck className="h-10 w-10 mx-auto mb-3" />
            <p>Ingen værelser fundet for det valgte hotel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedRooms.map(room => {
              const statusCfg = getStatusConfig(room.status);
              const Icon = statusCfg.icon;

              return (
                <Card
                  key={room.id}
                  className={`relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 border-l-4 ${statusCfg.color.replace('bg-', 'border-')}`}
                >
                  {/* Status Stribe */}
                  <div className={`absolute top-0 right-0 p-1 rounded-bl-lg text-white ${statusCfg.color}`}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{statusCfg.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl flex items-center justify-between">
                      <span>Værelse {room.number}</span>
                      {room.isPriority && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-2" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Prioritet</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center text-sm">
                      <Bed className="h-3 w-3 mr-1" />
                      {room.type}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Etage:</span>
                      <span className="font-semibold">{room.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={`text-xs ${statusCfg.color.replace('hover:bg', 'bg').replace('-700', '-500')}`}>{statusCfg.label}</Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Opdateret: {new Date(room.lastStatusUpdateTime).toLocaleTimeString("da-DK", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Yderligere import (hvis ikke allerede defineret)
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { IconListCheck } from "@tabler/icons-react"; // hvis denne skal bruges til "Ingen værelser"
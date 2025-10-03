"use client";

import React, { useState, useMemo } from "react";
import { useHousekeepingDashboard } from "../api/useHousekeepingData";
import { HousekeepingRoom, HousekeepingStatusDto } from "../api/HousekeepingRoomTransform";
import { HotelStats } from "../components/HotelStats";
import { RoomGrid } from "../components/RoomGrid";
import { getStatusConfig, statusOptions } from "../api/statusConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function ManagerDashboard() {
  const { rooms, isLoading, error, refresh } = useHousekeepingDashboard();

  // --- STATE TIL FILTER/SORTERING ---
  const [selectedHotel, setSelectedHotel] = useState<string>("all");
  
  // 💡 FIX: Initialiser med ALLE statusser for at undgå, at værelser filtreres fra ved indlæsning.
  const [selectedStatuses, setSelectedStatuses] = useState<HousekeepingStatusDto[]>(statusOptions);
  
  const [sortKey, setSortKey] = useState<"number" | "floor" | "status" | "lastStatusUpdate">("number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Hent unikke hotelnavne
  const uniqueHotels = useMemo(() => {
    const hotelNames = Array.from(new Set(rooms.map((r) => r.hotelName))).sort();
    return ["all", ...hotelNames];
  }, [rooms]);

  // --- FILTRERINGS- OG SORTERINGSLOGIK (Den smartere måde) ---
  const filteredAndSortedRooms = useMemo(() => {
    // 1. Start med en kopi af værelserne
    let result = [...rooms];

    // 2. Filtrer efter Hotel
    if (selectedHotel !== "all") {
      result = result.filter((room) => room.hotelName === selectedHotel);
    }

    // 3. Filtrer efter Status
    // Filtrer kun, hvis der er valgt færre end det samlede antal statusmuligheder.
    // Dette sikrer, at hvis alle statusser er valgt (standard), sker der ingen filtrering.
    const isStatusFilterActive = selectedStatuses.length > 0 && selectedStatuses.length !== statusOptions.length;
    
    if (isStatusFilterActive) {
      result = result.filter((room) => selectedStatuses.includes(room.status));
    }

    // 4. Sorter
    result.sort((a, b) => {
      let valA: any, valB: any;

      if (sortKey === "lastStatusUpdate") {
        valA = a.lastStatusUpdate?.getTime() ?? 0;
        valB = b.lastStatusUpdate?.getTime() ?? 0;
      } else {
        // Sikker adgang til nøglen via type assertion
        valA = a[sortKey as keyof HousekeepingRoom];
        valB = b[sortKey as keyof HousekeepingRoom];
      }

      // Robust streng- og tal-sammenligning
      const comparison = String(valA).localeCompare(String(valB), undefined, { 
        numeric: true, 
        sensitivity: 'base' // Ignorer casing for sammenligning
      });

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [rooms, selectedHotel, selectedStatuses, sortKey, sortDirection]);

  if (isLoading) return <div className="text-center p-6">Henter værelsesoversigt...</div>;
  if (error) return <div className="text-center p-6 text-red-600">Fejl: {error.message}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">  Room overview  </h1>

      {/* 1. Statistik */}
      <HotelStats
        rooms={filteredAndSortedRooms}
        isLoading={isLoading}
        error={null}
      />

      {/* 2. Kontrolpaneler (Filtre/Sortering) */}
      <div className="flex flex-col lg:flex-row gap-6 my-6 p-4 bg-gray-50 rounded-lg">
        {/* Hotel Filter */}
        <div className="w-full lg:w-1/3">
          <label className="text-sm font-medium">Filtrer efter Hotel</label>
          <Select value={selectedHotel} onValueChange={setSelectedHotel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Vælg hotel" />
            </SelectTrigger>
            <SelectContent>
              {uniqueHotels.map((hotel) => (
                <SelectItem key={hotel} value={hotel}>
                  {hotel === "all" ? "Alle Hoteller" : hotel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter (Chips-style) */}
        <div className="w-full lg:w-1/3">
          <label className="text-sm font-medium">Filtrer efter Status</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedStatuses((prev) =>
                    prev.includes(status)
                      ? prev.filter((s) => s !== status)
                      : [...prev, status]
                  )
                }
                className={`px-2 py-1 rounded border text-sm ${
                  selectedStatuses.includes(status)
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
            {/* Ny knap for at Nulstille eller Vælge Alle */}
            <button
                onClick={() => setSelectedStatuses(statusOptions)}
                className="px-2 py-1 rounded border text-sm bg-green-100 hover:bg-green-200"
            >
                Vælg Alle
            </button>
          </div>
        </div>

        {/* Sortering Kontrol */}
        <div className="w-full lg:w-1/3">
          <label className="text-sm font-medium">Sorter efter</label>
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as typeof sortKey)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sortering" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Værelsesnummer</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="lastStatusUpdate">Sidste Opdatering</SelectItem>
              <SelectItem value="floor">Etage</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retning: {sortDirection === "asc" ? "▲ (Stigende)" : "▼ (Faldende)"}
          </button>
        </div>
      </div>

      {/* 3. Værelsesgitter */}
      <RoomGrid rooms={filteredAndSortedRooms} />

      <button
        onClick={refresh}
        className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Genindlæs Data
      </button>
    </div>
  );
}
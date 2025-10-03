"use client";

import { Bed, Clock, CheckCircle, Star, AlertTriangle } from "lucide-react";
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";

interface HotelStatsProps {
  rooms: HousekeepingRoom[]; 
  isLoading: boolean;
  error?: string | null;
}

export const HotelStats: React.FC<HotelStatsProps> = ({ rooms }) => {
  const totalRooms = rooms.length;
  const roomsToClean = rooms.filter(r => 
    r.status === "DirtyCheckout" || 
    r.status === "DirtyStayOver" ||
    r.status === "AwaitingInspection"
  ).length;
  const cleanRooms = rooms.filter(r => r.status === "CleanReady").length;
  const priorityRooms = rooms.filter(r => r.isPriority).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <span>Totale Værelser</span>
          <Bed className="h-5 w-5 text-gray-500" />
        </div>
        <div className="text-2xl font-bold">{totalRooms}</div>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <span>Til Rengøring</span>
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="text-2xl font-bold text-red-600">{roomsToClean}</div>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <span>Rene & Klar</span>
          <CheckCircle className="h-5 w-5 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-green-600">{cleanRooms}</div>
      </div>

      <div className="p-4 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-2">
          <span>Prioritetsværelser</span>
          <Star className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold text-yellow-600">{priorityRooms}</div>
      </div>
    </div>
  );
};
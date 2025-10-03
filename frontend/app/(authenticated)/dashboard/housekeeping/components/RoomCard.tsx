"use client";

import React from "react";
import { HousekeepingRoom } from "../api/HousekeepingRoomTransform";
import { getStatusConfig } from "../api/statusConfig"; 
interface RoomCardProps {
  room: HousekeepingRoom;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const statusCfg = getStatusConfig(room.status);
  
  return (
    <div className="border rounded-lg shadow p-4 flex flex-col justify-between hover:shadow-lg transition">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">Room {room.number}</h3>
        {room.isPriority && (
          <span className="text-yellow-500 font-bold">★</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{room.type}</p>
      <p className="text-sm text-gray-600 mb-2">Floor: {room.floor}</p>
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusCfg.color}`}
      >
        {statusCfg.label}
      </span>
      <p className="text-xs text-gray-500 mt-2">
        Updated:{" "}
        {room.lastStatusUpdate
                ? new Intl.DateTimeFormat("da-DK", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(room.lastStatusUpdate)
                : "Ingen opdatering"}
      </p>
    </div>
  );
};

export default RoomCard;
"use client";

import { useState, useEffect } from "react";
import {
  HousekeepingRoom,
  HousekeepingStatusDto,
} from "../api/HousekeepingRoomTransform";
import { getStatusConfig, statusOptions } from "../api/statusConfig";
import { useUpdateRoomStatus } from "../hooks/updateRoomStatus";
import { Star, Calendar } from "lucide-react";
import { apiClient } from "@/api/client";

interface RoomGridProps {
  rooms: HousekeepingRoom[];
}
interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
}

let fullName = (u: UserOption) => u.firstName + " " + u.lastName;

export const RoomGrid: React.FC<RoomGridProps> = ({ rooms }) => {
  const {
    updateStatus,
    updatePriority,
    isLoading: updating,
  } = useUpdateRoomStatus();

  const [localRooms, setLocalRooms] = useState(rooms);
  // Liste af medarbejdere
  const [users, setUsers] = useState<UserOption[]>([]);

  useEffect(() => setLocalRooms(rooms), [rooms]);

  // --- Hent Housekeeping-users ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get<UserOption[]>(
          "/users/housekeeping-users",
        );
        const options = res.data.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
        }));
        setUsers(options);
      } catch (err) {
        console.error("Fejl ved hentning af brugere:", err);
      }
    };
    fetchUsers();
  }, []);

  // Hvis rooms ændrer sig udefra, sync state
  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  if (rooms.length === 0)
    return (
      <div className="text-center text-gray-500 p-10">
        Ingen værelser fundet.
      </div>
    );

  const handleStatusChange = async (
    roomId: string,
    newStatus: HousekeepingStatusDto,
  ) => {
    // Optimistic update
    setLocalRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: newStatus, lastStatusUpdate: new Date() }
          : r,
      ),
    );

    try {
      await updateStatus(roomId, newStatus);
    } catch (err) {
      console.error(err);
      // Hvis fejl, revert til gammel status
      setLocalRooms(rooms);
      alert("Kunne ikke opdatere status");
    }
  };

  // --- Priority toggle ---
  const handlePriorityToggle = async (roomId: string) => {
    const room = localRooms.find((r) => r.id === roomId);
    if (!room) return;

    const newPriority = !room.isPriority;

    // Optimistisk update
    setLocalRooms((prev) =>
      prev.map((r) =>
        r.id === roomId ? { ...r, isPriority: newPriority } : r,
      ),
    );

    try {
      await updatePriority?.(roomId, newPriority); // Opdater API hvis hook understøtter det
    } catch (err) {
      console.error(err);
      setLocalRooms(rooms); // Revert
      alert("Kunne ikke opdatere prioritet");
    }
  };

  // --- Assign room to user ---
  const handleAssignUser = async (roomId: string, userId: string) => {
    try {
      const res = await apiClient.post<HousekeepingRoom>(
        `/rooms/${roomId}/assign/${userId}`,
      );
      const updatedRoom = res.data;
      setLocalRooms((prev) =>
        prev.map((r) => (r.id === roomId ? updatedRoom : r)),
      );
    } catch (err) {
      console.error(err);
      alert("Kunne ikke assign medarbejder");
    }
  };

  // Mark room as cleaned (reset everything)
  const handleRoomCompleted = async (roomId: string) => {
    const prev = [...localRooms];

    setLocalRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: "CleanReady" as HousekeepingStatusDto,
              isPriority: false,
              assignedHousekeeperId: null, // nulstil assignment
              maintenanceNote: null,
              lastStatusUpdate: new Date(),
            }
          : r,
      ),
    );

    try {
      await apiClient.put(`/rooms/${roomId}/complete`);
    } catch (err) {
      console.error(err);
      setLocalRooms(prev); // rollback hvis fejl
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {localRooms.map((room) => {
        const statusCfg = getStatusConfig(room.status);
        const Icon = statusCfg.icon;

        return (
          <div
            key={room.id}
            className={`relative p-4 rounded shadow ${statusCfg.borderColor.replace(
              "border-l",
              "border-l-4",
            )} hover:shadow-lg transition-shadow`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Room {room.number}
                {room.isPriority && (
                  <Star className="h-5 w-5 text-yellow-500" />
                )}
              </h3>
            </div>

            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Icon className="h-4 w-4" />
              {room.type}
            </div>

            <div className="flex justify-between text-sm mb-1">
              <span>Etage:</span>
              <span className="font-semibold">{room.floor}</span>
            </div>

            {/* Dropdown for status */}
            <select
              value={room.status}
              onChange={(e) =>
                handleStatusChange(
                  room.id,
                  e.target.value as HousekeepingStatusDto,
                )
              }
              disabled={updating}
              className={`mt-1 w-full text-xs font-semibold px-2 py-1 rounded ${statusCfg.color}`}
            >
              {statusOptions.map((status) => {
                const cfg = getStatusConfig(status);
                return (
                  <option
                    key={status}
                    value={status}
                    className={`${cfg.color}`}
                  >
                    {cfg.label}
                  </option>
                );
              })}
            </select>

            {/* Toggle for priority */}
            <div className="flex items-center gap-2 mt-2">
              <label className="text-xs flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={room.isPriority}
                  onChange={() => handlePriorityToggle(room.id)}
                />
                Prioritet
              </label>
            </div>

            {/* Assign user dropdown */}
            <div className="mt-2">
              <label className="text-xs font-semibold">
                Assign medarbejder:
              </label>
              <select
                value={room.assignedHousekeeperId ?? ""}
                onChange={(e) => handleAssignUser(room.id, e.target.value)}
                className="mt-1 w-full text-xs px-2 py-1 rounded border"
              >
                <option value="">Vælg medarbejder</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {fullName(u)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mark as Clean button */}
            <button
              onClick={() => handleRoomCompleted(room.id)}
              className="mt-2 w-full text-xs font-semibold px-2 py-1 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Markér som Clean
            </button>

            <div className="flex items-center text-xs text-gray-500 mt-2 gap-1">
              <Calendar className="h-3 w-3" />
              Opdateret:{" "}
              {room.lastStatusUpdate
                ? new Intl.DateTimeFormat("da-DK", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(room.lastStatusUpdate))
                : "Ingen opdatering"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

import { HousekeepingRoomDto, HousekeepingStatusDto } from "./HousekeepingRoomDto";
import { getStatusConfig } from "./statusConfig" // Brug central konfiguration

export interface HousekeepingRoom {
  hotelId: string;
  type: string;
  isPriority: any;
  id: string;
  number: string;
  hotelName: string; 
  floor: number;
  status: HousekeepingStatusDto;
  isDirty: boolean; // Beregnes nu via statusConfig
  assignedHousekeeperId: string | null;
  maintenanceNote: string | null;
  displayColor: string; // Gemmer kun den primære farve (f.eks. "bg-red-700")
  lastStatusUpdate: Date | null
}

export function dtoToHousekeepingRoom(dto: HousekeepingRoomDto): HousekeepingRoom {
  const config = getStatusConfig(dto.status);

  return {
    hotelId: dto.hotelId,
    type: dto.type,
    isPriority: dto.isPriority,
    id: dto.id,
    number: dto.number,
    hotelName: dto.hotelName,
    floor: dto.floor,  
    status: dto.status,
    isDirty: config.isDirty, // Bruger central logik
    assignedHousekeeperId: dto.assignedHousekeeperId,
    maintenanceNote: dto.maintenanceNote,
    displayColor: config.color.split(" ")[0], // Gemmer kun den primære farve
    lastStatusUpdate: dto.lastStatusUpdateTime
  ? new Date(dto.lastStatusUpdateTime.slice(0, 23) + "Z") 
  : null,
  };
}

export type { HousekeepingStatusDto };
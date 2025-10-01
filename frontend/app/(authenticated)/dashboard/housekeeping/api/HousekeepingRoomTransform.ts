import { HousekeepingRoomDto, HousekeepingStatusDto } from "./HousekeepingRoomDto";

export interface HousekeepingRoom {
  isPriority: any;
  id: string;
  number: string;
  hotelName: string; 
  floor: number;
  status: HousekeepingStatusDto;
  isDirty: boolean;
  assignedHousekeeperId: string | null;
  maintenanceNote: string | null;
  displayColor: string; 
  lastStatusUpdate: Date; 
}

const STATUS_COLOR_MAP: Record<HousekeepingStatusDto, string> = {
  DirtyCheckout: 'bg-red-500',      // BESKIDT
  DirtyStayOver: 'bg-yellow-500',   // BESKIDT
  AwaitingInspection: 'bg-blue-300',// SKAL GØRES RENT / AFVENTER
  CleanReady: 'bg-green-500',       // RENT
  OutOfOrder: 'bg-gray-500',        // SKAL GØRES RENT / VEDLIGEHOLDELSE
  DoNotDisturb: 'bg-purple-400',    // AFVENTER
};

export function dtoToHousekeepingRoom(dto: HousekeepingRoomDto): HousekeepingRoom {
  const isDirty = dto.status === 'DirtyCheckout' || dto.status === 'DirtyStayOver' || dto.status === 'OutOfOrder';

  return {
    isPriority: dto.isPriority,
    id: dto.id,
    number: dto.number,
    hotelName: dto.hotelName,
    floor: dto.floor,  
    status: dto.status,
    isDirty: isDirty,
    assignedHousekeeperId: dto.assignedHousekeeperId,
    maintenanceNote: dto.maintenanceNote,
    displayColor: STATUS_COLOR_MAP[dto.status],
    lastStatusUpdate: new Date(dto.lastStatusUpdateTime), 
  };
}
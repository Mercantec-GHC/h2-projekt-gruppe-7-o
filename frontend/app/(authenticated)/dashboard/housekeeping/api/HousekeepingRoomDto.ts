export type HousekeepingStatusDto = 
  | "CleanReady"      // Rent - Klar (VC)
  | "DirtyCheckout"   // Beskidt - Tjek Ud (DCO)
  | "DirtyStayOver"   // Beskidt - Ophold (DS)
  | "AwaitingInspection" // Rent - Inspektionsklar (CI)
  | "OutOfOrder"      // Ude af Drift (OOO)
  | "DoNotDisturb";   // Forstyr Ikke (DND);

export interface HousekeepingRoomDto {
  id: string;
  number: string;
  floor: number;
  capacity: number;
  hotelName: string;
  status: HousekeepingStatusDto;
  assignedHousekeeperId: string | null;
  maintenanceNote: string | null;
  isPriority: boolean;
  lastStatusUpdateTime: string; 
}
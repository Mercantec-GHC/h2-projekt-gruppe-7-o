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
  lastStatusUpdateTime: Date | null;
  hotelId: string;
  hotelName?: string;
}

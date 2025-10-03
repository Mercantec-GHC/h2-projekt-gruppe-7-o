// statusConfig.ts

import { CheckCircle, Clock, Ban, AlertTriangle, Bed, LucideIcon } from "lucide-react";
import { HousekeepingStatus } from "../types/room"; // Bruger den generiske type

interface StatusConfig {
  label: string;
  color: string;       // Til kort baggrund (f.eks. bg-red-600)
  icon: LucideIcon;
  borderColor: string; // Til TaskItem's venstre kant (f.eks. border-l-red-600)
  isDirty: boolean;    // Til beregning af 'Til Rengøring'
}

export const STATUS_CONFIG: Record<HousekeepingStatus, StatusConfig> = {
  CleanReady: {
    label: "Clean – Ready",
    color: "bg-green-600 text-white",
    icon: CheckCircle,
    borderColor: "border-l-green-600",
    isDirty: false,
  },
  DirtyCheckout: {
    label: "Dirty – Checkout",
    color: "bg-red-700 text-white", // Brug en konsistent mørkere farve
    icon: Clock,
    borderColor: "border-l-red-700",
    isDirty: true,
  },
  DirtyStayOver: {
    label: "Dirty – Stay Over",
    color: "bg-orange-600 text-white",
    icon: Clock,
    borderColor: "border-l-orange-600",
    isDirty: true,
  },
  AwaitingInspection: {
    label: "Awaiting Inspection",
    color: "bg-blue-500 text-white", // Skift fra gul for at undgå prioritet/advarsel
    icon: AlertTriangle,
    borderColor: "border-l-blue-500",
    isDirty: true, // Værelset er stadig 'beskidt', men færdigt.
  },
  OutOfOrder: {
    label: "Out of Order",
    color: "bg-gray-600 text-white",
    icon: Ban,
    borderColor: "border-l-gray-600",
    isDirty: true, // Skal behandles af vedligeholdelse
  },
  DoNotDisturb: {
    label: "Do Not Disturb",
    color: "bg-purple-600 text-white",
    icon: Ban,
    borderColor: "border-l-purple-600",
    isDirty: false,
  },
};

export const getStatusConfig = (status: HousekeepingStatus) => STATUS_CONFIG[status] || { 
    label: status, 
    color: "bg-gray-400 text-white", 
    icon: Bed, 
    borderColor: "border-l-gray-400", 
    isDirty: false 
};

export const statusOptions: HousekeepingStatus[] = [
  "CleanReady",
  "DirtyCheckout",
  "DirtyStayOver",
  "AwaitingInspection",
  "OutOfOrder",
  "DoNotDisturb",
];
// Bruges til dropdown-menuer og lignende
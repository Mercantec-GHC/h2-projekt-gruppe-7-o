import { UserDto } from "@/features/user/api/dto";
import { UserRole } from "@/features/user/domain";

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  assignedToUser?: UserDto;
  createdByUser: UserDto;
  createdAt: string;
  updatedAt: string;
}

export const TicketStatus = {
  Open: "Open",
  InProgress: "In Progress",
  WaitingForCustomer: "Waiting for Customer",
  WaitingForAdmin: "Waiting for Admin",
  Resolved: "Resolved",
  Closed: "Closed",
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const MessageType = {
  User: "User",
  System: "System",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface TicketMessage {
  id: number;
  ticketId: number;
  user: UserDto;
  content: string;
  isInternal: boolean;
  messageType?: MessageType;
  createdAt: string;
  updatedAt: string;
}

export const getTicketStatusColor = (
  status: TicketStatus,
  userRole: UserRole,
) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-yellow-500";
    case "in progress":
      return "bg-blue-500";
    case "waiting for customer":
      return userRole === "Customer" ? "bg-yellow-500" : "bg-purple-400";
    case "waiting for admin":
      return userRole === "Customer" ? "bg-purple-400" : "bg-yellow-500";
    case "resolved":
      return "bg-green-500";
    case "closed":
      return "bg-red-500";
    default:
      return "default";
  }
};

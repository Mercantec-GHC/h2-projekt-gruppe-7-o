import { Ticket, TicketMessage, TicketStatus } from "../domain";

export interface CreateTicketDto {
  title: string;
  description: string;
  statusName?: TicketStatus;
  assignedToUserId?: string;
}

export interface UpdateTicketStatusDto {
  statusName: TicketStatus;
}

export interface AssignTicketDto {
  assignedToUserId?: string;
}

export interface AllTicketsResponseDto {
  tickets: Ticket[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TicketFilters {
  status?: TicketStatus;
  assignedTo?: string;
  myTicketsOnly?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// Messages
// TODO: Split this into separate file?
export interface CreateTicketMessageDto {
  content: string;
  messageType?: string;
  isInternal?: boolean;
}

export interface TicketMessagesResponseDto {
  messages: TicketMessage[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

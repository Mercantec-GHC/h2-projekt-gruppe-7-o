import { apiClient } from "@/api/client";
import {
  AssignTicketDto,
  CreateTicketDto,
  CreateTicketMessageDto,
  TicketFilters,
  TicketMessagesResponseDto,
  AllTicketsResponseDto,
  UpdateTicketStatusDto,
} from "./dto";
import { Ticket, TicketMessage } from "../domain";

async function getTickets(
  filters: TicketFilters = {},
): Promise<AllTicketsResponseDto> {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
  if (filters.myTicketsOnly !== undefined)
    params.append("myTicketsOnly", filters.myTicketsOnly.toString());
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());

  const response = await apiClient.get<AllTicketsResponseDto>(
    `/tickets?${params.toString()}`,
  );
  return response.data;
}

async function getTicket(id: number): Promise<Ticket> {
  const response = await apiClient.get<Ticket>(`/tickets/${id}`);
  return response.data;
}

async function createTicket(dto: CreateTicketDto): Promise<Ticket> {
  const response = await apiClient.post("/tickets", dto);
  return response.data;
}

async function updateTicketStatus(
  id: number,
  dto: UpdateTicketStatusDto,
): Promise<Ticket> {
  const response = await apiClient.put(`/tickets/${id}/status`, dto);
  return response.data;
}

async function assignTicket(id: number, dto: AssignTicketDto): Promise<Ticket> {
  const response = await apiClient.put(`/tickets/${id}/assign`, dto);
  return response.data;
}

async function getTicketStatuses(): Promise<string[]> {
  const response = await apiClient.get("/tickets/statuses");
  return response.data;
}

// TODO: should we split up messages into its own file?
// Messages

async function getMessages(
  ticketId: number,
  page: number = 1,
  pageSize: number = 50,
): Promise<TicketMessagesResponseDto> {
  const response = await apiClient.get(
    `/tickets/${ticketId}/messages?page=${page}&pageSize=${pageSize}`,
  );
  return response.data;
}

async function createMessage(
  ticketId: number,
  dto: CreateTicketMessageDto,
): Promise<TicketMessage> {
  const response = await apiClient.post(`/tickets/${ticketId}/messages`, dto);
  return response.data;
}

async function getMessage(
  ticketId: number,
  messageId: number,
): Promise<TicketMessage> {
  const response = await apiClient.get(
    `/tickets/${ticketId}/messages/${messageId}`,
  );
  return response.data;
}

async function deleteMessage(
  ticketId: number,
  messageId: number,
): Promise<void> {
  await apiClient.delete(`/tickets/${ticketId}/messages/${messageId}`);
}

export default {
  getTickets,
  getTicket,
  createTicket,
  updateTicketStatus,
  assignTicket,
  getTicketStatuses,
  getMessages,
  createMessage,
  getMessage,
  deleteMessage,
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TicketApi from "../api/ticket-api";
import {
  CreateTicketDto,
  TicketFilters,
  UpdateTicketStatusDto,
  AssignTicketDto,
} from "../api/dto";

// Query Keys
export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (filters: TicketFilters) => [...ticketKeys.lists(), filters] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: number) => [...ticketKeys.details(), id] as const,
  statuses: () => ["ticket-statuses"] as const,
};

// Query Hooks
export function useTickets(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: () => TicketApi.getTickets(filters),
  });
}

export function useTicket(id: number) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => TicketApi.getTicket(id),
    enabled: !!id,
  });
}

export function useTicketStatuses() {
  return useQuery({
    queryKey: ticketKeys.statuses(),
    queryFn: () => TicketApi.getTicketStatuses(),
  });
}

// Mutation Hooks
export function useCreateTicket({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketDto) => TicketApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      toast.success("Ticket created successfully!");
      onSuccess?.();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Failed to create ticket:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to create ticket. Please try again.",
      );
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTicketStatusDto }) =>
      TicketApi.updateTicketStatus(id, data),
    onSuccess: (updatedTicket, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
      // queryClient.setQueryData(
      //   ticketKeys.detail(variables.id),
      //   updatedTicket,
      // );
      toast.success("Ticket status updated successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Failed to update ticket status:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to update ticket status. Please try again.",
      );
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      currentUser,
    }: {
      id: number;
      data: AssignTicketDto;
      currentUser?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }) => TicketApi.assignTicket(id, data),
    onSuccess: (updatedTicket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.setQueryData(
        ticketKeys.detail(updatedTicket.id),
        updatedTicket,
      );

      console.log("uppdated ticket", updatedTicket);
      toast.success(
        updatedTicket.assignedToUser
          ? "Sag tildelt til " +
              updatedTicket.assignedToUser.firstName +
              " " +
              updatedTicket.assignedToUser.lastName
          : "Tildeling fjernet!",
      );
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      console.error("Failed to assign ticket:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to assign ticket. Please try again.",
      );
    },
  });
}

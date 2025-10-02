import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TicketApi from "../api/ticket-api";
import { CreateTicketMessageDto } from "../api/dto";
import { ticketKeys } from "./ticket-queries";

// Query Keys
export const messageKeys = {
  all: ["ticket-messages"] as const,
  lists: () => [...messageKeys.all, "list"] as const,
  list: (ticketId: number, page?: number, pageSize?: number) =>
    [...messageKeys.lists(), ticketId, page, pageSize] as const,
  details: () => [...messageKeys.all, "detail"] as const,
  detail: (ticketId: number, messageId: number) =>
    [...messageKeys.details(), ticketId, messageId] as const,
};

// Query Hooks
export function useTicketMessages(
  ticketId: number,
  page: number = 1,
  pageSize: number = 50,
) {
  return useQuery({
    queryKey: messageKeys.list(ticketId, page, pageSize),
    queryFn: () => TicketApi.getMessages(ticketId, page, pageSize),
    enabled: !!ticketId,
  });
}

export function useTicketMessage(ticketId: number, messageId: number) {
  return useQuery({
    queryKey: messageKeys.detail(ticketId, messageId),
    queryFn: () => TicketApi.getMessage(ticketId, messageId),
    enabled: !!ticketId && !!messageId,
  });
}

// Mutation Hooks
export function useCreateTicketMessage(
  ticketId: number,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketMessageDto) =>
      TicketApi.createMessage(ticketId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(ticketId),
      });
      toast.success("Message sent successfully!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Failed to send message:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    },
  });
}

export function useDeleteTicketMessage(
  ticketId: number,
  onSuccess?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) =>
      TicketApi.deleteMessage(ticketId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.lists(),
      });
      toast.success("Message deleted successfully!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Failed to delete message:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete message. Please try again.",
      );
    },
  });
}

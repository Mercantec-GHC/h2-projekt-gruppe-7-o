import { MessageType, TicketStatus } from "../domain";

import {
  TicketSignalRCallbacks,
  TicketSignalRMessage,
  ticketSignalRService,
} from "../ticketSignalRService";
import { useEffect } from "react";
import { messageKeys } from "../queries";
import { TicketMessage } from "../domain";
import { QueryClient } from "@tanstack/react-query";
import { TicketMessagesResponseDto } from "../api/dto";
import { toast } from "sonner";

interface UseInitSignalRProps {
  ticketId: number;
  queryClient: QueryClient;
}

const useInitSignalR = ({ ticketId, queryClient }: UseInitSignalRProps) => {
  useEffect(() => {
    const callbacks: TicketSignalRCallbacks = {
      onNewMessage: (signalRMessage: TicketSignalRMessage) => {
        try {
          // Validate message
          if (!signalRMessage) {
            console.error("Invalid SignalR message:", signalRMessage);
            return;
          }

          // Update React Query cache with the new message
          queryClient.setQueryData(
            messageKeys.list(ticketId, 1, 50),
            (oldData: TicketMessagesResponseDto | undefined) => {
              if (!oldData) return;

              // Try to find existing user info from cached messages
              const existingUser = oldData.messages.find(
                (msg) => msg.user.id === signalRMessage.userId,
              )?.user;

              // Convert SignalR message to our domain format
              const newMessage: TicketMessage = {
                id: signalRMessage.id,
                ticketId: signalRMessage.ticketId,
                user: signalRMessage.user
                  ? {
                      id: signalRMessage.user.id,
                      firstName: signalRMessage.user.firstName,
                      lastName: signalRMessage.user.lastName,
                      email: signalRMessage.user.email,
                      phone: "",
                      roleName: "Customer",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                  : existingUser || {
                      id: signalRMessage.userId,
                      firstName: "Unknown",
                      lastName: "User",
                      email: "",
                      phone: "",
                      roleName: "Customer",
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                content: signalRMessage.content,
                isInternal: signalRMessage.isInternal,
                messageType:
                  signalRMessage.user?.id === "system"
                    ? MessageType.System
                    : MessageType.User,
                createdAt: signalRMessage.createdAt,
                updatedAt: signalRMessage.updatedAt,
              };

              // Check if message already exists to avoid duplicates
              const messageExists = oldData.messages.some(
                (msg: TicketMessage) => msg.id === newMessage.id,
              );

              if (!messageExists) {
                return {
                  ...oldData,
                  messages: [...oldData.messages, newMessage],
                  totalCount: oldData.totalCount + 1,
                };
              }

              return oldData;
            },
          );

          scrollToBottom();
        } catch (error) {
          console.error("Error handling SignalR message:", error);
          toast.error("Error receiving message");
        }
      },

      onUserJoined: (ticketId: number, userName: string, userId: string) => {
        if (String(userId) === String(session.user?.id)) return;

        // Add system message for user joining
        //
        const joinedChatMessageContent = `${userName} har tilsluttet sig til chatten`;

        const joinedMessage: TicketMessage = {
          id: Date.now(), // Temporary ID for system message
          ticketId,
          user: {
            id: "system",
            firstName: "System",
            lastName: "",
            email: "",
            phone: "",
            roleName: "System",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          content: joinedChatMessageContent,
          isInternal: false,
          messageType: MessageType.System,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(
          messageKeys.list(ticketId, 1, 50),
          (oldData: TicketMessagesResponseDto | undefined) => {
            if (!oldData) return { messages: [joinedMessage], totalCount: 1 };

            // Check if similar join message already exists in the last few messages
            // TODO: this logic can be extracted to a helper function
            const recentMessages = oldData.messages.slice(-3);
            const duplicateExists = recentMessages.some(
              (msg) =>
                msg.messageType === MessageType.System &&
                msg.content.includes(joinedChatMessageContent),
            );

            if (duplicateExists) {
              return oldData;
            }

            return {
              ...oldData,
              messages: [...oldData.messages, joinedMessage],
              totalCount: oldData.totalCount + 1,
            };
          },
        );
        scrollToBottom();
      },

      onUserLeft: (ticketId: number, userName: string, userId: string) => {
        if (String(userId) === String(session.user?.id)) return;

        const leftChatMessageContent = `${userName} forlod chatten`;

        // Add system message for user leaving
        const systemMessage: TicketMessage = {
          id: Date.now() + 1, // Temporary ID for system message
          ticketId,
          user: {
            id: "system",
            firstName: "System",
            lastName: "",
            email: "",
            phone: "",
            roleName: "System",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          content: leftChatMessageContent,
          isInternal: false,
          messageType: MessageType.System,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(
          messageKeys.list(ticketId, 1, 50),
          (oldData: TicketMessagesResponseDto | undefined) => {
            if (!oldData) return;

            // Check if similar leave message already exists in the last few messages
            const recentMessages = oldData.messages.slice(-3);
            const duplicateExists = recentMessages.some(
              (msg) =>
                msg.messageType === MessageType.System &&
                msg.content.includes(leftChatMessageContent),
            );

            if (duplicateExists) {
              return oldData;
            }

            return {
              ...oldData,
              messages: [...oldData.messages, systemMessage],
              totalCount: oldData.totalCount + 1,
            };
          },
        );
        scrollToBottom();
      },

      onConnected: () => {
        setIsConnected(true);
      },

      onDisconnected: () => {
        setIsConnected(false);
      },

      onError: (error: string) => {
        toast.error(`Connection error: ${error}`);
      },

      onTicketStatusChanged: (
        ticketId: number,
        newStatus: TicketStatus,
        changedBy: string,
      ) => {
        console.log(`Status changing from ${ticketStatus} to ${newStatus}`);
        setTicketStatus(newStatus);

        // Add system message for status change
        const statusMessage: TicketMessage = {
          id: Date.now() + Math.random(), // Unique temporary ID
          ticketId,
          user: {
            id: "system",
            firstName: "System",
            lastName: "",
            email: "",
            phone: "",
            roleName: "System",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          content: `Status ændret til "${newStatus}" af ${changedBy}`,
          isInternal: false,
          messageType: MessageType.System,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(
          messageKeys.list(ticketId, 1, 50),
          (oldData: MessagesQueryData | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              messages: [...oldData.messages, statusMessage],
              totalCount: oldData.totalCount + 1,
            };
          },
        );

        scrollToBottom();

        // Show toast for status change
        toast.info(`Ticket status ændret til: ${newStatus}`);

        // Invalidate ticket query to update parent component
        queryClient.invalidateQueries({
          queryKey: ticketKeys.detail(ticketId),
        });
      },
    };

    const initializeSignalR = async () => {
      try {
        ticketSignalRService.setCallbacks(callbacks);
        await ticketSignalRService.connect();
        await ticketSignalRService.joinTicketRoom(ticketId);
      } catch (error) {
        console.error("Failed to initialize SignalR:", error);
      }
    };

    initializeSignalR();

    return () => {
      ticketSignalRService.leaveTicketRoom(ticketId);
    };
  }, [ticketId, session.user?.id, queryClient, ticketStatus, isConnected]);
};

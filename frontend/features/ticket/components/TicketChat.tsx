"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Clock, Shield, Loader2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { da } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  ticketSignalRService,
  type TicketSignalRCallbacks,
  type TicketSignalRMessage,
} from "../ticketSignalRService";
import {
  useTicketMessages,
  useCreateTicketMessage,
  messageKeys,
} from "../queries";
import { ticketKeys } from "../queries/ticket-queries";
import { TicketMessage, MessageType, TicketStatus } from "../domain";
import { useSessionStore } from "@/features/auth/stores/sessionStore";

interface TicketChatProps {
  ticketId: number;
  ticket?: {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    assignedToUser?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    createdByUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

interface MessagesQueryData {
  messages: TicketMessage[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function TicketChat({ ticketId, ticket }: TicketChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isInternalMessage, setIsInternalMessage] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string>(
    ticket?.status || "Open",
  );

  // Update status when ticket prop changes
  useEffect(() => {
    if (ticket?.status) {
      setTicketStatus(ticket.status);
    }
  }, [ticket?.status]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const session = useSessionStore();

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    error,
  } = useTicketMessages(ticketId, 1, 50);

  // Send message mutation
  const sendMessageMutation = useCreateTicketMessage(ticketId, () => {
    setNewMessage("");
    scrollToBottom();
  });

  // Initialize SignalR
  useEffect(() => {
    const callbacks: TicketSignalRCallbacks = {
      onNewMessage: (signalRMessage: TicketSignalRMessage) => {
        try {
          // Validate message structure
          if (!signalRMessage) {
            console.error("Invalid SignalR message structure:", signalRMessage);
            return;
          }

          // Update React Query cache with the new message
          queryClient.setQueryData(
            messageKeys.list(ticketId, 1, 50),
            (oldData: MessagesQueryData | undefined) => {
              if (!oldData) return oldData;

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
        const systemMessage: TicketMessage = {
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
          content: `${userName} har sluttet sig til chatten`,
          isInternal: false,
          messageType: MessageType.System,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(
          messageKeys.list(ticketId, 1, 50),
          (oldData: MessagesQueryData | undefined) => {
            if (!oldData) return oldData;

            // Check if similar join message already exists in the last few messages
            const recentMessages = oldData.messages.slice(-3);
            const duplicateExists = recentMessages.some(
              (msg) =>
                msg.messageType === MessageType.System &&
                msg.content.includes(userName) &&
                msg.content.includes("har tilsluttet sig"),
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

      onUserLeft: (ticketId: number, userName: string, userId: string) => {
        if (String(userId) === String(session.user?.id)) return;

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
          content: `${userName} har forladt chatten`,
          isInternal: false,
          messageType: MessageType.System,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(
          messageKeys.list(ticketId, 1, 50),
          (oldData: MessagesQueryData | undefined) => {
            if (!oldData) return oldData;

            // Check if similar leave message already exists in the last few messages
            const recentMessages = oldData.messages.slice(-3);
            const duplicateExists = recentMessages.some(
              (msg) =>
                msg.messageType === MessageType.System &&
                msg.content.includes(userName) &&
                msg.content.includes("har forladt"),
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
        newStatus: string,
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
  }, [ticketId, session.user?.id, queryClient]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesData?.messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = newMessage.trim();

    try {
      if (isConnected) {
        // Send via SignalR for real-time delivery
        await ticketSignalRService.sendMessage(
          ticketId,
          message,
          isInternalMessage,
        );
        setNewMessage("");
        setIsInternalMessage(false);
      } else {
        // Fallback to REST API
        await sendMessageMutation.mutateAsync({
          content: message,
          isInternal: isInternalMessage,
        });
        setIsInternalMessage(false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Try REST API as fallback
      if (isConnected) {
        try {
          await sendMessageMutation.mutateAsync({ content: message });
        } catch {
          toast.error("Failed to send message. Please try again.");
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isMyMessage = (message: TicketMessage) => {
    return message.user.id === session.user?.id;
  };

  const isAdminUser = () => {
    return session.user?.role && session.user.role !== "Customer";
  };

  const isTicketClosed = () => {
    return ticketStatus === "Resolved" || ticketStatus === "Closed";
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = "text-xs select-none";

    if (status === "Resolved" || status === "Closed") {
      return cn(baseClass, "text-red-700 bg-red-100 border-red-300");
    }
    if (status === "Waiting for Customer") {
      return cn(baseClass, "text-orange-700 bg-orange-100 border-orange-300");
    }
    if (status === "Waiting for Admin") {
      return cn(baseClass, "text-blue-700 bg-blue-100 border-blue-300");
    }
    return cn(baseClass, "text-gray-700 bg-gray-100 border-gray-300");
  };

  const messages = messagesData?.messages || [];

  // Debug: Log current status when rendering
  console.log(
    "TicketChat render - current status:",
    ticketStatus,
    "ticket prop status:",
    ticket?.status,
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat
          </CardTitle>
          <div
            className="flex items-center gap-2"
            key={`status-${ticketStatus}`}
          >
            <Badge
              key={`status-badge-${ticketStatus}`}
              variant="outline"
              className={getStatusBadgeClass(ticketStatus)}
            >
              {ticketStatus}
            </Badge>
            <Badge
              variant={isConnected ? "outline" : "secondary"}
              className={cn(
                "text-xs select-none",
                isConnected ? "text-green-900 bg-green-200" : "",
              )}
            >
              {isConnected ? "Tilsluttet" : "Offline"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {/* Messages Area */}
        <ScrollArea className="p-4 h-[600px]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Indlæser beskeder...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-destructive">
              <span>Fejl ved indlæsning af beskeder</span>
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Ingen beskeder endnu</p>
              <p className="text-sm text-center">
                Vi har modtaget din sag. Du kan skrive beskeder her.
              </p>
            </div>
          )}

          <div className="space-y-4 relative">
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = isMyMessage(message);
                const isSystem = message.messageType === MessageType.System;
                const showAvatar =
                  !isSystem &&
                  (index === 0 ||
                    messages[index - 1]?.user.id !== message.user.id);

                // System message rendering
                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center py-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs ${
                          message.content.includes("Status ændret")
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    {showAvatar && !isOwn && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(
                            `${message.user.firstName} ${message.user.lastName}`,
                          )}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!showAvatar && !isOwn && <div className="w-8" />}

                    <div
                      className={`flex-1 max-w-[70%] ${isOwn ? "text-right" : ""}`}
                    >
                      {showAvatar && (
                        <div
                          className={`flex items-center gap-2 mb-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : ""}`}
                        >
                          <span className="font-medium">
                            {message.user.firstName} {message.user.lastName}
                          </span>
                          {message.isInternal && <Shield className="h-3 w-3" />}
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                              locale: da,
                            })}
                          </span>
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-lg ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        } ${
                          message.isInternal
                            ? "border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : ""
                        }`}
                      >
                        {message.isInternal && (
                          <div className="flex items-center gap-1 mb-2 text-xs text-orange-600 dark:text-orange-400">
                            <Shield className="h-3 w-3" />
                            <span>Intern besked</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      {!showAvatar && (
                        <div
                          className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : ""}`}
                        >
                          {format(new Date(message.createdAt), "HH:mm")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        {/* Message Input */}
        <div className="p-4">
          {isTicketClosed() ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">
                  Denne sag er {ticketStatus.toLowerCase()}
                </p>
                <p className="text-xs mt-1">
                  Der kan ikke sendes flere beskeder
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Internal message toggle for admin users */}
              {isAdminUser() && (
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="internal-message"
                    checked={isInternalMessage}
                    onChange={(e) => setIsInternalMessage(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="internal-message"
                    className="text-sm text-muted-foreground"
                  >
                    Intern besked (kun synlig for administratorer)
                  </label>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Skriv din besked..."
                  disabled={sendMessageMutation.isPending || isTicketClosed()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !newMessage.trim() ||
                    sendMessageMutation.isPending ||
                    isTicketClosed()
                  }
                  size="sm"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!isConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Real-time beskeder ikke tilgængelige. Beskeder sendes via
                  fallback.
                </p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

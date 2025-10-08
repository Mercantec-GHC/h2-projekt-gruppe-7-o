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
import { cn } from "@/lib/utils";

import { TicketMessage, MessageType, TicketStatus, Ticket } from "../domain";
import { useSessionStore } from "@/features/auth/stores/sessionStore";
import { useChat } from "../hooks/useChat";

interface TicketChatProps {
  ticketId: number;
  ticket: Ticket;
}

export function TicketChat({ ticketId, ticket }: TicketChatProps) {
  const session = useSessionStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    messagesData,
    isLoading,
    error,
    newMessage,
    setNewMessage,
    sendMessageMutation,
    handleSendMessage,
    isNewMessageInternal,
    setIsNewMessageInternal,
    ticketStatus,
  } = useChat({
    ticketId,
    initialTicketStatus: ticket.status,
    messagesEndRef,
  });

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
                    checked={isNewMessageInternal}
                    onChange={(e) => setIsNewMessageInternal(e.target.checked)}
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
                  disabled={sendMessageMutation?.isPending || isTicketClosed()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !newMessage.trim() ||
                    sendMessageMutation?.isPending ||
                    isTicketClosed()
                  }
                  size="sm"
                >
                  {sendMessageMutation?.isPending ? (
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

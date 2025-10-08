import * as signalR from "@microsoft/signalr";
import { TicketStatus } from "./domain";

export interface TicketSignalRMessage {
  id: number;
  ticketId: number;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TicketSignalRCallbacks = {
  onNewMessage: (message: TicketSignalRMessage) => void;
  onUserJoined: (ticketId: number, userName: string, userId: string) => void;
  onUserLeft: (ticketId: number, userName: string, userId: string) => void;
  onTicketStatusChanged: (
    ticketId: number,
    newStatus: TicketStatus,
    changedBy: string,
  ) => void;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: string) => void;
};

class TicketSignalRService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: TicketSignalRCallbacks = {};
  private isConnecting = false;
  private currentTicketId: number | null = null;
  private joinedUsers = new Set<string>();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/ticketHub`, {
        withCredentials: true,
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Connection events
    this.connection.onclose(() => {
      console.log("SignalR connection closed");
      this.callbacks.onDisconnected?.();
    });

    this.connection.onreconnected(async () => {
      console.log("SignalR reconnected");
      this.callbacks.onConnected?.();
      // Rejoin current ticket room if we were in one
      if (this.currentTicketId) {
        try {
          await this.joinTicketRoom(this.currentTicketId);
        } catch (error) {
          console.error("Failed to rejoin ticket room on reconnect:", error);
        }
      }
    });

    this.connection.on("NewTicketMessage", (message: TicketSignalRMessage) => {
      this.callbacks.onNewMessage?.(message);
    });

    this.connection.on(
      "UserJoinedTicket",
      (ticketId: number, userName: string, userId: string) => {
        // Prevent duplicate join notifications
        const userKey = `${ticketId}-${userId}`;
        if (this.joinedUsers.has(userKey)) {
          return;
        }

        this.joinedUsers.add(userKey);
        this.callbacks.onUserJoined?.(ticketId, userName, userId);
      },
    );

    this.connection.on(
      "UserLeftTicket",
      (ticketId: number, userName: string, userId: string) => {
        // Remove from joined users set
        const userKey = `${ticketId}-${userId}`;
        this.joinedUsers.delete(userKey);
        this.callbacks.onUserLeft?.(ticketId, userName, userId);
      },
    );

    this.connection.on(
      "TicketStatusChanged",
      (ticketId: number, newStatus: string, changedBy: string) => {
        this.callbacks.onTicketStatusChanged?.(ticketId, newStatus, changedBy);
      },
    );

    this.connection.on("Error", (error: string) => {
      this.callbacks.onError?.(error);
    });
  }

  setCallbacks(callbacks: TicketSignalRCallbacks) {
    this.callbacks = callbacks;
  }

  async connect(): Promise<void> {
    if (!this.connection || this.isConnecting) return;

    if (this.connection.state === signalR.HubConnectionState.Connected) {
      this.callbacks.onConnected?.();
      return;
    }

    this.isConnecting = true;

    try {
      await this.connection.start();
      // Wait a bit to ensure connection is fully established
      await new Promise((resolve) => setTimeout(resolve, 100));
      this.callbacks.onConnected?.();
    } catch (error) {
      console.error("Failed to connect to SignalR:", error);
      this.callbacks.onError?.(`Connection failed: ${error}`);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection) return;

    try {
      if (this.currentTicketId) {
        await this.leaveTicketRoom(this.currentTicketId);
      }
      await this.connection.stop();
    } catch (error) {
      console.error("Error disconnecting from SignalR:", error);
    }
  }

  async joinTicketRoom(ticketId: number): Promise<void> {
    // Wait for connection if still connecting
    let attempts = 0;
    while (this.isConnecting && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.isConnected()) {
      console.error("SignalR not connected");
      return;
    }
    // Don't join if already in the same room
    if (this.currentTicketId === ticketId) {
      return;
    }

    try {
      // Leave previous room if we were in a different one
      if (this.currentTicketId && this.currentTicketId !== ticketId) {
        await this.leaveTicketRoom(this.currentTicketId);
      }

      await this.connection!.invoke("JoinTicketRoom", ticketId);
      this.currentTicketId = ticketId;
      console.log(`Successfully joined ticket room ${ticketId}`);
    } catch (error) {
      console.error(`Failed to join ticket room ${ticketId}:`, error);
      // Try again after a delay
      setTimeout(() => {
        if (this.isConnected()) {
          this.joinTicketRoom(ticketId);
        }
      }, 2000);
    }
  }

  async leaveTicketRoom(ticketId: number): Promise<void> {
    if (!this.isConnected()) return;

    try {
      await this.connection!.invoke("LeaveTicketRoom", ticketId);

      const keysToDelete = Array.from(this.joinedUsers).filter((key) =>
        key.startsWith(`${ticketId}-`),
      );
      keysToDelete.forEach((key) => this.joinedUsers.delete(key));
    } catch (error) {
      console.error(`Failed to leave ticket room ${ticketId}:`, error);
    }
  }

  async sendMessage(
    ticketId: number,
    content: string,
    isInternal = false,
  ): Promise<void> {
    if (!this.isConnected()) {
      throw new Error("Not connected to SignalR");
    }

    try {
      await this.connection!.invoke(
        "SendMessageToTicket",
        ticketId,
        content,
        isInternal,
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const ticketSignalRService = new TicketSignalRService();

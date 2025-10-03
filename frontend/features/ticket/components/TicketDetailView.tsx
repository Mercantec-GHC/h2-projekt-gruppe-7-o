"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TicketChat } from "./TicketChat";
import {
  useTicket,
  useTicketStatuses,
  useUpdateTicketStatus,
  useAssignTicket,
  useTicketMessages,
} from "../queries";
import { useSessionStore } from "@/features/auth/stores/sessionStore";
import { getTicketStatusColor, TicketStatus } from "../domain";
import { cn, formatDateToLocaleString } from "@/lib/utils";
import { da } from "date-fns/locale";

interface TicketDetailViewProps {
  ticketId: number;
  isAdmin?: boolean;
  onBack?: () => void;
}

export function TicketDetailView({
  ticketId,
  isAdmin = false,
  onBack,
}: TicketDetailViewProps) {
  // Fetch ticket details using new query hook
  const { data: ticket, isLoading, error, refetch } = useTicket(ticketId);
  const { refetch: refetchMessages } = useTicketMessages(ticketId);

  const refetchTicket = () => {
    refetch();
    refetchMessages();
  };

  const session = useSessionStore();

  // Fetch available statuses using new query hook
  const { data: availableStatuses = [] } = useTicketStatuses();

  // Status change mutation using new query hook
  const statusMutation = useUpdateTicketStatus();

  // Assignment mutation using new query hook
  const assignMutation = useAssignTicket();

  const handleStatusChange = (newStatus: TicketStatus) => {
    if (ticket && newStatus !== ticket.status) {
      statusMutation.mutate({
        id: ticketId,
        data: { statusName: newStatus },
      });
    }
  };

  const handleAssignToMe = () => {
    if (
      !session.user?.id ||
      !session.user?.firstName ||
      !session.user?.lastName ||
      !session.user?.email
    ) {
      return;
    }

    assignMutation.mutate({
      id: ticketId,
      data: { assignedToUserId: session.user.id },
      currentUser: {
        id: session.user.id,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email,
      },
    });
  };

  const handleUnassign = () => {
    assignMutation.mutate({
      id: ticketId,
      data: { assignedToUserId: undefined },
      currentUser:
        session.user &&
        session.user.firstName &&
        session.user.lastName &&
        session.user.email
          ? {
              id: session.user.id,
              firstName: session.user.firstName,
              lastName: session.user.lastName,
              email: session.user.email,
            }
          : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Indlæser detaljer...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">
              Noget gik galt da vi forsøgte at indlæse detaljerne.. Prøv igen
            </p>
            <Button onClick={() => refetch()}>Prøv igen</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbage
            </Button>
          )}
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">#{ticket.id}</h1>
            <p className="text-muted-foreground">{ticket.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetchTicket}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Opdater
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status and Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Status & Tildeling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                {isAdmin ? (
                  <div className="relative">
                    <Select
                      value={ticket.status}
                      onValueChange={handleStatusChange}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger
                        className={cn(
                          getTicketStatusColor(ticket.status, "Admin"),
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {statusMutation.isPending && (
                      <RefreshCw className="h-4 w-4 animate-spin absolute right-8 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    )}
                  </div>
                ) : (
                  <Badge
                    className={getTicketStatusColor(ticket.status, "Customer")}
                  >
                    {ticket.status}
                  </Badge>
                )}
              </div>

              {/* Assignment */}
              {isAdmin && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tidelt
                  </label>
                  <div className="space-y-2">
                    {ticket.assignedToUser ? (
                      <div
                        className={`flex items-center justify-between p-2 bg-muted rounded transition-opacity ${
                          assignMutation.isPending ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          <span className="text-sm">
                            {ticket.assignedToUser.firstName}{" "}
                            {ticket.assignedToUser.lastName}
                          </span>
                          {assignMutation.isPending && (
                            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUnassign}
                          disabled={assignMutation.isPending}
                        >
                          Fjern tildeling
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-between p-2 bg-muted rounded transition-opacity ${
                          assignMutation.isPending ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Ikke tildelt
                          </span>
                          {assignMutation.isPending && (
                            <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAssignToMe}
                          disabled={assignMutation.isPending}
                        >
                          Tildel til dig selv
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ticket Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Sagsinformation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Oprettet: </span>
                  <span>
                    {formatDateToLocaleString(new Date(ticket.createdAt))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Sidst opdateret:
                  </span>
                  <span>
                    {formatDistanceToNow(new Date(ticket.updatedAt), {
                      addSuffix: true,
                      locale: da,
                      includeSeconds: true,
                    })}
                  </span>
                </div>
                {ticket.createdByUser && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Oprettet af:</span>
                    <span>
                      {ticket.createdByUser.firstName}{" "}
                      {ticket.createdByUser.lastName}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Beskrivelse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {ticket.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-2">
          <TicketChat ticketId={ticketId} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}

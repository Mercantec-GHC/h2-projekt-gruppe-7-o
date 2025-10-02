"use client";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Eye, Edit, UserCheck } from "lucide-react";
import { getTicketStatusColor, Ticket } from "../domain";
import { cn } from "@/lib/utils";
import { da } from "date-fns/locale";
import { useSessionStore } from "@/features/auth/stores/sessionStore";

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  isAdmin?: boolean;
  onStatusChange?: (ticketId: number, newStatus: string) => void;
  onAssignTicket?: (ticketId: number, userId?: string) => void;
  onViewTicket?: (ticketId: number) => void;
  availableStatuses: string[];
}

export function TicketList({
  tickets,
  isLoading,
  isAdmin = false,
  onStatusChange,
  onAssignTicket,
  onViewTicket,
  availableStatuses,
}: TicketListProps) {
  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    if (!onStatusChange) return;

    onStatusChange(ticketId, newStatus);
  };

  const session = useSessionStore();

  const handleAssignTicket = async (ticketId: number, userId?: string) => {
    if (!onAssignTicket) return;

    onAssignTicket(ticketId, userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indlæser sager...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Ingen sager fundet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Tildelt til</TableHead>}
              <TableHead>Oprettet</TableHead>
              <TableHead>Sidst opdateret</TableHead>
              <TableHead className="w-[100px]">Handlinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                // onClick={() => onViewTicket?.(ticket.id)}
                key={ticket.id}
                className={cn("cursor-pointer")}
              >
                <TableCell className="font-medium">#{ticket.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                      {ticket.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {session.user?.role && (
                    <Badge
                      className={getTicketStatusColor(
                        ticket.status,
                        session.user?.role,
                      )}
                    >
                      {ticket.status}
                    </Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {ticket.assignedToUser ? (
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        <span className="text-sm">
                          {ticket.assignedToUser.firstName}{" "}
                          {ticket.assignedToUser.lastName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Ikke tildelt
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                    locale: da,
                    includeSeconds: true,
                  })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(ticket.updatedAt), {
                    addSuffix: true,
                    locale: da,
                    includeSeconds: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Åben menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Handlinger</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onViewTicket?.(ticket.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Se detaljer
                      </DropdownMenuItem>

                      {isAdmin && onStatusChange && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Skift status</DropdownMenuLabel>
                          {availableStatuses.map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() =>
                                handleStatusChange(ticket.id, status)
                              }
                              disabled={status === ticket.status}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {status}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}

                      {isAdmin && onAssignTicket && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Tildel</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAssignTicket(ticket.id, "current-user")
                            }
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Tidel til migselv
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleAssignTicket(ticket.id, undefined)
                            }
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Fjern tildeling
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

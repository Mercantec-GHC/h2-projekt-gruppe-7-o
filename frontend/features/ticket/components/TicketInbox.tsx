"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TicketFilters } from "./TicketFilters";
import { TicketList } from "./TicketList";
import { CreateTicketDialog } from "./CreateTicketDialog";
import { TicketFilters as TicketFiltersType } from "../api/dto";

import {
  useTickets,
  useTicketStatuses,
  useUpdateTicketStatus,
  useAssignTicket,
} from "../queries";
import { UserRole } from "@/features/user/domain";

interface TicketInboxProps {
  isAdmin?: boolean;
}

export function TicketInbox({ isAdmin = false }: TicketInboxProps) {
  const router = useRouter();

  const [filters, setFilters] = useState<TicketFiltersType>({
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    pageSize: 10,
  });

  // Fetch tickets using new query hook
  const { data: ticketsData, isLoading, error, refetch } = useTickets(filters);

  // Fetch available statuses using new query hook
  const { data: availableStatuses = [] } = useTicketStatuses();

  // Status change mutation using new query hook
  const statusMutation = useUpdateTicketStatus();

  // Assignment mutation using new query hook
  const assignMutation = useAssignTicket();

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    await statusMutation.mutateAsync({
      id: ticketId,
      data: { statusName: newStatus },
    });
  };

  const handleAssignTicket = async (ticketId: number, userId?: string) => {
    await assignMutation.mutateAsync({
      id: ticketId,
      data: { assignedToUserId: userId },
    });
  };

  const handleViewTicket = (ticketId: number) => {
    if (isAdmin) {
      router.push(`/dashboard/tickets/${ticketId}`);
    } else {
      router.push(`/profile/tickets/${ticketId}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const tickets = ticketsData?.tickets || [];
  const totalPages = ticketsData?.totalPages || 0;
  const currentPage = ticketsData?.page || 1;
  const totalCount = ticketsData?.totalCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "Support Sager" : "Mine Sager"}
          </h1>
          <p className="text-muted-foreground">
            {totalCount > 0 && (
              <>
                Viser {tickets.length} af {totalCount} sager
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Opdater
          </Button>
          <CreateTicketDialog isAdmin={isAdmin} />
        </div>
      </div>

      {/* Filters */}
      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
        isAdmin={isAdmin}
        availableStatuses={availableStatuses}
      />

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive">
                Noget gik galt ved hentning af sager. Prøv venligst igen.
              </p>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-2"
              >
                Prøv igen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ticket List */}
      <TicketList
        tickets={tickets}
        isLoading={isLoading}
        isAdmin={isAdmin}
        onStatusChange={isAdmin ? handleStatusChange : undefined}
        onAssignTicket={isAdmin ? handleAssignTicket : undefined}
        onViewTicket={handleViewTicket}
        availableStatuses={availableStatuses}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Side {currentPage} af {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                >
                  Tilbage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Næste
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats for Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Åbne Sager
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "Open").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Igangværende
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "In Progress").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Venter på svar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {
                  tickets.filter(
                    (t) =>
                      t.status === "Waiting for Customer" ||
                      t.status === "Waiting for Admin",
                  ).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Løste
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">
                {tickets.filter((t) => t.status === "Resolved").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

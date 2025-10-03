"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X } from "lucide-react";
import { TicketFilters as TicketFiltersType } from "./ticketService";

interface TicketFiltersProps {
  filters: TicketFiltersType;
  onFiltersChange: (filters: TicketFiltersType) => void;
  isAdmin?: boolean;
  availableStatuses: string[];
}

export function TicketFilters({
  filters,
  onFiltersChange,
  isAdmin = false,
  availableStatuses,
}: TicketFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof TicketFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filtering
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      pageSize: filters.pageSize || 10,
    });
  };

  const hasActiveFilters = !!(
    filters.status ||
    filters.assignedTo ||
    filters.myTicketsOnly
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-4 w-4" />
            Filtrering og sortering
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Ryd
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8"
            >
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "status",
                    value === "all" ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statusser</SelectItem>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignment Filter (Admin only) */}
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="assigned-filter">Tidel</Label>
                <Select
                  value={filters.assignedTo || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "assignedTo",
                      value === "all" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alle sager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle sager</SelectItem>
                    <SelectItem value="unassigned">Ikke tildete</SelectItem>
                    <SelectItem value="me">Tildelt til mig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sorter efter</Label>
              <Select
                value={filters.sortBy || "createdAt"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "sortBy",
                    value as "createdAt" | "updatedAt" | "title",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Oprettet dato</SelectItem>
                  <SelectItem value="updatedAt">Senest opdateret</SelectItem>
                  <SelectItem value="title">Titel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sort-order">Sortering</Label>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value as "asc" | "desc")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Nyeste først</SelectItem>
                  <SelectItem value="asc">Ældste først</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* My Tickets Only (Admin) */}
          {isAdmin && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="my-tickets"
                  checked={filters.myTicketsOnly || false}
                  onCheckedChange={(checked) =>
                    handleFilterChange("myTicketsOnly", checked)
                  }
                />
                <Label htmlFor="my-tickets" className="text-sm font-normal">
                  Vis kun sager tildelt mig
                </Label>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

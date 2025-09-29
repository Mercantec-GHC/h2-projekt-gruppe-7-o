"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { RefreshCw } from "@/components/animate-ui/icons/refresh-cw";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingDto, BookingStatus } from "@/features/booking/api/dto";
import { BookingStatusBadge } from "@/features/booking/components/BookingStatusBadge";
import {
  formatDateRange,
  getGuestsCountText,
  getTotalNightsStayText,
} from "@/features/booking/domain";
import { useCancelBooking } from "@/features/booking/queries/useCancelBooking";
import { useUserBookings } from "@/features/user/queries/useUserBookings";
import { formatCurrency } from "@/lib/utils";
import {
  differenceInDays,
  differenceInHours,
  formatDistance,
  isPast,
  isFuture,
} from "date-fns";
import { da } from "date-fns/locale";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type FilterType = "all" | "upcoming" | "past";
type StatusFilter = "all" | BookingStatus;
type SortOption = "date" | "price-low" | "price-high";

export default function ProfileMyBookings() {
  const {
    data: bookings,
    dataUpdatedAt,
    refetch: refetchBookings,
  } = useUserBookings();
  const {
    mutateAsync: cancelBooking,
    isSuccess,
    isPending,
    variables,
  } = useCancelBooking();

  // Filter states
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("date");

  const pendingId = isPending ? variables : null;

  const handleCancelBooking = async (bookingId: string) => {
    await cancelBooking(bookingId);
    if (isSuccess) {
      toast.success(`Booking ${bookingId} cancelled successfully`);
    }
  };

  const canCancelBooking = (booking: BookingDto) => {
    if (!booking || booking.status === "Cancelled") return false;
    const now = new Date();
    const checkIn = new Date(booking.checkIn);

    const hoursDifference = differenceInHours(checkIn, now);
    return hoursDifference > 24;
  };

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    const filtered = bookings.filter((booking) => {
      const checkInDate = new Date(booking.checkIn);
      const checkOutDate = new Date(booking.checkOut);

      // Filter by type (upcoming/past)
      if (filterType === "upcoming" && !isFuture(checkInDate)) return false;
      if (filterType === "past" && !isPast(checkOutDate)) return false;

      // Filter by status
      if (statusFilter !== "all" && booking.status !== statusFilter)
        return false;

      return true;
    });

    // Sort bookings
    return filtered.sort((a, b) => {
      const aCheckIn = new Date(a.checkIn);
      const bCheckIn = new Date(b.checkIn);

      if (sortOption === "price-low") {
        return a.totalPrice - b.totalPrice;
      } else if (sortOption === "price-high") {
        return b.totalPrice - a.totalPrice;
      }

      // Date sorting (default behavior based on filter type)
      if (filterType === "upcoming") {
        // Sort upcoming by closest first
        return aCheckIn.getTime() - bCheckIn.getTime();
      } else if (filterType === "past") {
        // Sort past by most recent first
        return bCheckIn.getTime() - aCheckIn.getTime();
      }

      // Default sort by check-in date (newest first)
      return bCheckIn.getTime() - aCheckIn.getTime();
    });
  }, [bookings, filterType, statusFilter, sortOption]);

  const lastUpdated = formatDistance(new Date(dataUpdatedAt), new Date(), {
    addSuffix: true,
    locale: da,
  });

  const clearFilters = () => {
    setFilterType("all");
    setStatusFilter("all");
    setSortOption("date");
  };

  const hasActiveFilters =
    filterType !== "all" || statusFilter !== "all" || sortOption !== "date";

  return (
    <div className="flex flex-col gap-6 p-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mine Bookinger</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <AnimateIcon
            completeOnStop
            persistOnAnimateEnd
            animation="rotate"
            animateOnTap
          >
            <Button
              asChild
              size="icon"
              variant="outline"
              onClick={() => refetchBookings()}
            >
              <RefreshCw />
            </Button>
          </AnimateIcon>
          <p>Sidst opdateret: {lastUpdated}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <div className="space-y-2">
              <Label htmlFor="filter-type">Booking Type</Label>
              <Select
                value={filterType}
                onValueChange={(value: FilterType) => setFilterType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vælg type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle bookinger</SelectItem>
                  <SelectItem value="upcoming">Kommende</SelectItem>
                  <SelectItem value="past">Tidligere</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: StatusFilter) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vælg status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statusser</SelectItem>
                  <SelectItem value="Confirmed">Bekræftet</SelectItem>
                  <SelectItem value="Pending">Afventer</SelectItem>
                  <SelectItem value="Cancelled">Annulleret</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-option">Sortering</Label>
              <Select
                value={sortOption}
                onValueChange={(value: SortOption) => setSortOption(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vælg sortering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Dato</SelectItem>
                  <SelectItem value="price-low">Pris (lav til høj)</SelectItem>
                  <SelectItem value="price-high">Pris (høj til lav)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Viser {filteredBookings.length} af {bookings?.length || 0}{" "}
                bookinger
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Ryd filtre
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Ingen bookinger matcher de valgte filtre."
                  : "Du har ingen bookinger endnu."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent>
                <div className="flex justify-between">
                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-muted-foreground ">
                      {formatDateRange(booking.checkIn, booking.checkOut)} -{" "}
                      <span className="font-medium">
                        (
                        {getTotalNightsStayText(
                          differenceInDays(
                            new Date(booking.checkOut),
                            new Date(booking.checkIn),
                          ),
                        )}
                        )
                      </span>
                    </p>

                    <p className="text-lg text-muted-foreground font-normal">
                      {getGuestsCountText({
                        adults: booking.adults,
                        children: booking.children,
                      })}
                    </p>
                    <p className="text-lg mt-8 font-bold text-foreground">
                      Pris: {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between items-start gap-8">
                    <div className="space-x-3">
                      <BookingStatusBadge status={booking.status} />
                      <Badge variant="secondary">{booking.id}</Badge>
                    </div>
                    {canCancelBooking(booking) && (
                      <Button
                        className="w-fit self-end"
                        variant="destructive"
                        isLoading={isPending && pendingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Annuller booking
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

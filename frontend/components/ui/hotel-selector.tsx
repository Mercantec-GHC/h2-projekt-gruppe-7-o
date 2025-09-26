"use client";

import * as React from "react";
import { MapPinIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBookingActions,
  useBookingStore,
  useSelectedHotel,
} from "@/features/booking/bookingStore";
import { useHotels } from "@/features/hotel/queries/useGetHotels";

interface HotelSelectorProps {
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function HotelSelector({
  placeholder = "Select hotel...",
  className,
  disabled = false,
}: HotelSelectorProps) {
  const { data, isLoading, error } = useHotels();
  const selectedHotel = useSelectedHotel();
  const { setSelectedHotel } = useBookingActions();

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-md bg-destructive/10">
        <span className="text-sm text-destructive">Failed to load hotels</span>
      </div>
    );
  }

  const handleHotelChange = (id: string) => {
    const selectedHotel = data?.find((hotel) => hotel.id === id);
    setSelectedHotel(selectedHotel);
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-42" />;
  }

  return (
    <Select onValueChange={(id) => handleHotelChange(id)} disabled={disabled}>
      <SelectTrigger className={cn(className)}>
        <div className="flex items-center gap-2 h-40 w-42">
          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          {selectedHotel ? (
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium truncate text-left">
                {selectedHotel.name}
              </span>
              <span className="text-xs text-muted-foreground truncate text-left">
                {selectedHotel.city}
              </span>
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </div>
      </SelectTrigger>
      <SelectContent>
        {data?.map((hotel) => (
          <SelectItem key={hotel.id} value={hotel.id} className="py-2">
            <div className="flex flex-col items-start w-full">
              <div className="font-medium">{hotel.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {hotel.city}, {hotel.country}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

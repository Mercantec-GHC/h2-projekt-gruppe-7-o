"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  CalendarIcon,
  ChevronDownIcon,
  UsersIcon,
  MinusIcon,
  PlusIcon,
  BabyIcon,
  AlertCircleIcon,
  XIcon,
  SearchIcon,
  MapPinIcon,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useStepper } from "@/features/booking/components/booking-widget";
import { HotelSelector } from "@/components/ui/hotel-selector";
import { useBookingStore } from "../bookingStore";
import { useSearchAvailableRooms } from "../hooks/useBooking";

export const BookingSearch = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const methods = useStepper();

  const {
    selectedHotel,
    guestCount,
    setCheckInDate,
    setCheckOutDate,
    checkInDate,
    checkOutDate,
    updateAdults,
    updateChildren,
  } = useBookingStore();

  const canSearch =
    !!selectedHotel?.id &&
    !!checkInDate &&
    !!checkOutDate &&
    // Other required fields
    guestCount.adults !== undefined &&
    guestCount.children !== undefined;

  const {
    data,
    refetch: searchForRooms,
    isFetching,
    isError: searchError,
  } = useSearchAvailableRooms(
    {
      hotelId: selectedHotel?.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: guestCount.adults,
      children: guestCount.children,
    },
    false,
  );

  useEffect(() => {
    if (data?.rooms && data?.rooms.length > 0) {
      methods.next();
    }
  }, [data]);

  const getGuestText = () => {
    const totalGuests = guestCount.adults + guestCount.children;
    if (totalGuests === 1) return "1 Guest";
    return `${totalGuests} Guests`;
  };

  const formatDateRange = () => {
    if (checkInDate && checkOutDate) {
      return `${checkInDate.toLocaleDateString("da-DK")} - ${checkOutDate.toLocaleDateString("da-DK")}`;
    }
    return "Select dates";
  };

  // Show validation errors or search errors

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-5" />
          Book Your Stay
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your hotel, dates and number of guests to find available rooms
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hotel Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select Hotel</Label>
          <HotelSelector placeholder="Choose a hotel..." />
        </div>

        <div className="flex items-base gap-4">
          {/* Date Selection */}
          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium">Check-in & Check-out</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal h-12"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatDateRange()}</span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  selected={{ from: checkInDate, to: checkOutDate }}
                  captionLayout="dropdown"
                  onSelect={(range) => {
                    if (range) {
                      setCheckInDate(range.from);
                      setCheckOutDate(range.to);
                    }
                  }}
                  numberOfMonths={2}
                  fromYear={2025}
                  toYear={2027}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Guest Selection */}
          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium">Guests</Label>
            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal h-12"
                >
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{getGuestText()}</span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Select Guests</h4>
                    <p className="text-sm text-muted-foreground">
                      Choose the number of adults and children for your stay.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Adults</p>
                          <p className="text-sm text-muted-foreground">
                            Ages 13+
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateAdults(false)}
                          disabled={guestCount.adults <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center select-none">
                          {guestCount.adults}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateAdults(true)}
                          disabled={guestCount.adults >= 10}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Children */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BabyIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Children</p>
                          <p className="text-sm text-muted-foreground">
                            Ages 0-12
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateChildren(false)}
                          disabled={guestCount.children <= 0}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center select-none">
                          {guestCount.children}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateChildren(true)}
                          disabled={guestCount.children >= 10}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    onClick={() => setIsGuestsOpen(false)}
                    className="w-full"
                    size="sm"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              {guestCount.adults} adult{guestCount.adults !== 1 ? "s" : ""}
              {guestCount.children > 0 &&
                `, ${guestCount.children} child${guestCount.children !== 1 ? "ren" : ""}`}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              Something went wrong while searching for available rooms.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto p-0 h-auto text-destructive hover:text-destructive"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search Results Count */}
        {data?.rooms && data?.rooms.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Found {data?.rooms.length} available room
              {data?.rooms.length !== 1 ? "s" : ""} for your dates!
            </p>
          </div>
        )}

        {data?.rooms && data?.rooms.length === 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              No rooms available for your selected dates and guest count. Try
              different dates or fewer guests.
            </p>
          </div>
        )}

        {/* Search Button */}
        <Button
          className="w-full h-12 text-base font-medium"
          disabled={!canSearch || isFetching}
          onClick={() => searchForRooms()}
        >
          {isFetching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Search Available Rooms
            </div>
          )}
        </Button>

        {/* Booking Summary */}
        {/*{selectedHotelId && dateRange?.from && dateRange?.to && (
          <div className="text-sm text-muted-foreground text-center">
            <span className="inline-flex items-center gap-1">
              <MapPinIcon className="h-3 w-3" />
              {getHotelById(selectedHotelId)?.name}
            </span>
            {" • "}
            {nights} night{nights !== 1 ? "s" : ""} • {getGuestText()}
          </div>
        )}*/}
      </CardContent>
    </Card>
  );
};

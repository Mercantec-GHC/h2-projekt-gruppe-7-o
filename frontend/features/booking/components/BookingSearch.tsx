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
  Moon,
  User,
  DoorOpen,
} from "lucide-react";

import { Calendar } from "@/components/ui/calendar";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { useStepper } from "@/features/booking/components/booking-widget";
import { HotelSelector } from "@/components/ui/hotel-selector";
import {
  useBookingActions,
  useCanSearch,
  useCheckInDate,
  useCheckOutDate,
  useGuestCount,
  useNightsCount,
  useRoomCount,
  useSelectedHotel,
} from "../bookingStore";
import {
  formatDateRange,
  getAdultsCountText,
  getChildrenCountText,
  getGuestsCountText,
  getTotalAvailableRoomsCount,
  getTotalGuestsText,
  getTotalNightsStayText,
} from "../domain";
import { useSearchAvailableRooms } from "../queries/useSearchAvailableRooms";

export const BookingSearch = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const methods = useStepper();

  const selectedHotel = useSelectedHotel();
  const guestCount = useGuestCount();
  const roomCount = useRoomCount();
  const nightCount = useNightsCount();
  const checkInDate = useCheckInDate();
  const checkOutDate = useCheckOutDate();

  const {
    reset,
    updateAdults,
    updateChildren,
    updateRoomAmount,
    setCheckInDate,
    setCheckOutDate,
  } = useBookingActions();

  useEffect(() => {
    // when this component mounts, its means we are at the first screen again, so we can reset the form
    reset();
  }, []);

  const canSearch = useCanSearch();

  const availableRooms = useSearchAvailableRooms(
    {
      hotelId: selectedHotel?.id,
      //TODO: fix this type, it is date when passed to the useSearchAvailableRooms, and is then parsed to a string before the request is sent off
      checkIn: checkInDate,
      checkOut: checkOutDate,
    },
    false,
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-5" />
          Book dit ophold
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Vælg dit hotel, datoer og antal gæster for at finde ledige værelser
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-baseline gap-8">
          {/* Hotel Selection */}
          <div className="space-y-2 h-full">
            <Label className="text-sm font-medium">Vælg hotel</Label>
            <HotelSelector placeholder="Vælg hotel..." />
          </div>
          {/* Date Selection */}
          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium">Check ind & Check ud</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal h-12"
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDateRange(checkInDate, checkOutDate)}
                    </span>
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
            {nightCount && nightCount > 0 && (
              <p className="text-xs text-muted-foreground select-none flex items-baseline-end gap-2">
                <Moon size={14} />
                {getTotalNightsStayText(nightCount)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-base gap-4">
          {/* Guest Selection */}
          <div className="space-y-2 w-96">
            <Label className="text-sm font-medium">Rum</Label>
            <div className="flex items-center gap-3 h-12 px-3 border border-input rounded-md">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-muted-foreground">
                  Antal rum:
                </span>
                <span className="text-sm font-medium">{roomCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => updateRoomAmount("decrement")}
                  disabled={roomCount <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => updateRoomAmount("increment")}
                  disabled={roomCount >= 10}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/*<div className="text-xs text-muted-foreground select-none">
              <p className="flex items-baseline-end gap-1">
                <DoorOpen size={14} />
                {roomCount} rum
              </p>
            </div>*/}
          </div>
          {/* Rooms Selection */}
          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium">Gæster</Label>
            <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal h-12"
                >
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {getTotalGuestsText(guestCount)}
                    </span>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">
                      Vælg antal gæster
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Vælg antallet af voksne og børn for dit ophold.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Voksne</p>
                          <p className="text-sm text-muted-foreground">
                            Alder 13+
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateAdults("decrement")}
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
                          onClick={() => updateAdults("increment")}
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
                          <p className="font-medium">Børn</p>
                          <p className="text-sm text-muted-foreground">
                            Alder 0-12
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
            <div className="text-xs text-muted-foreground select-none flex items-center gap-2">
              <p className="flex items-baseline-end gap-1">
                <User size={14} /> {getAdultsCountText(guestCount.adults)}
              </p>
              <p className="flex items-baseline-end gap-1">
                <BabyIcon size={14} />
                {getChildrenCountText(guestCount.children)}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {availableRooms.error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircleIcon className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              Noget gik galt under søgningen efter ledige rum.
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

        {/* Search Button */}
        <Button
          className="w-full h-12 text-base font-medium"
          disabled={!canSearch || availableRooms.isFetching}
          onClick={async () => {
            const res = await availableRooms.refetch();
            if (res.isSuccess && getTotalAvailableRoomsCount(res.data) > 0) {
              methods.next();
            }
          }}
        >
          {availableRooms.isFetching ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Søger...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Søg efter ledige rum
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

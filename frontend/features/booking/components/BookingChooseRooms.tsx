"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateToLocaleString } from "@/lib/utils";
import { useStepper } from "./booking-widget";
import { DoorOpen, Users } from "lucide-react";
import {
  useBookingActions,
  useCheckInDate,
  useCheckOutDate,
  useGuestCount,
  useNightsCount,
  useSelectedHotel,
  useSelectedRoomBookings,
  useSelectedRoomValidation,
} from "../stores/bookingStore";
import { useSearchAvailableRooms } from "../queries/useSearchAvailableRooms";
import {
  getTotalAvailableRoomsCount,
  getTotalGuestsText,
  getTotalNightsStayText,
} from "../domain";
import { BookingRoomSelectionCard } from "./BookingRoomSelectionCard";
import { BookingSummaryBottomSheet } from "./BookingSummaryBottomSheet";
import { Button } from "@/components/ui/button";

export default function BookingChooseRoom() {
  const methods = useStepper();
  const availableRooms = useSearchAvailableRooms();

  const selectedHotel = useSelectedHotel();
  const guestCount = useGuestCount();
  const checkInDate = useCheckInDate();
  const checkOutDate = useCheckOutDate();
  const nightsCount = useNightsCount();
  const selectedRoomValidation = useSelectedRoomValidation();

  const { reset } = useBookingActions();

  const bookingDetailsText = `${formatDateToLocaleString(checkInDate)} - ${formatDateToLocaleString(checkOutDate)} (${getTotalNightsStayText(nightsCount ?? 0)}) • ${getTotalGuestsText(guestCount)}`;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              Ledige rum
              <Badge variant="secondary">
                {getTotalAvailableRoomsCount(availableRooms.data)} fundet
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                reset();
                methods.prev();
              }}
            >
              Gå tilbage
            </Button>
          </CardTitle>
          <div className="space-y-1">
            {/*TODO: at this point we should always have a hotel, so intead of creating checks over and over like this, how can we assume that we have a selectedHotel in a typesafe way?*/}
            {selectedHotel && (
              <div className="space-y-2 mb-4">
                <p className="text-md font-bold text-primary">
                  Hotel {selectedHotel.name}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedHotel.streetName}, {selectedHotel.streetNumber},{" "}
                  {selectedHotel.city}
                </p>
              </div>
            )}
            <div className="space-y-2 mb-4">
              <p className="text-md font-bold text-primary">Booking Oversigt</p>
              <p className="text-sm font-medium text-muted-foreground">
                {bookingDetailsText}
              </p>
            </div>
            <div
              className={cn(
                "text-muted-foreground flex text-sm items-center gap-1",
                selectedRoomValidation.isValid && "text-green-500",
              )}
            >
              <DoorOpen className="size-4" />
              <p>
                {selectedRoomValidation.totalRoomsSelected} af{" "}
                {selectedRoomValidation.totalRoomsExpected} rum valgt
              </p>
            </div>
            <div
              className={cn(
                "text-muted-foreground flex text-sm items-center gap-1",
                selectedRoomValidation.isValid && "text-green-500",
                selectedRoomValidation.isRoomAmountValid &&
                  !selectedRoomValidation.isCapcityValid &&
                  "text-red-500",
              )}
            >
              <Users className="size-4" />
              <p>
                {Math.min(
                  selectedRoomValidation.totalCapacitySelected,
                  selectedRoomValidation.totalGuests,
                )}{" "}
                af {selectedRoomValidation.totalGuests} gæster tildelt
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableRooms.data?.map((availableRoomType, index) => (
            <BookingRoomSelectionCard
              key={index}
              availableRoomType={availableRoomType}
            />
          ))}
        </CardContent>
      </Card>
      <BookingSummaryBottomSheet />
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessionStore } from "@/features/auth/stores/sessionStore";
import useAuthModalStore from "@/features/auth/stores/authModalStore";
import { useStepper } from "./booking-widget";
import {
  CalendarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CreditCardIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingStore } from "../bookingStore";
import { differenceInDays } from "date-fns";
import { useCreateBooking } from "../hooks/useBooking";
import Link from "next/link";

export default function BookingSummary() {
  const {
    selectedHotel,
    totalGuests,
    checkInDate,
    guestCount,
    checkOutDate,
    selectedRoom,
  } = useBookingStore();
  const { isAuthenticated } = useSessionStore();
  const { openModal } = useAuthModalStore();
  const methods = useStepper();

  const formatDateRange = () => {
    if (checkInDate && checkOutDate) {
      return `${checkInDate.toLocaleDateString("da-DK")} - ${checkOutDate.toLocaleDateString("da-DK")}`;
    }
    return "Select dates";
  };

  const getGuestText = () => {
    if (totalGuests === 1) return "1 Guest";
    return `${totalGuests} Guests`;
  };

  const {
    data,
    mutate: createBooking,
    isError,
    error,
    isSuccess,
    isPending,
  } = useCreateBooking();

  const handleBooking = () => {
    if (!isAuthenticated) {
      openModal();
    } else {
      createBooking({
        roomIds: [selectedRoom.id],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults: guestCount.adults,
        children: guestCount.children,
        totalGuests,
        addons: [],
      });
    }
  };

  //TODO: refactor this, we have to assume that this is not null at this point...
  const totalNights =
    (checkOutDate &&
      checkInDate &&
      differenceInDays(checkOutDate, checkInDate)) ??
    0;

  // TODO: the totalPrice should come from the backend
  const totalPrice =
    selectedRoom?.pricePerNight && selectedRoom?.pricePerNight * totalNights;

  // Show confirmation if reservation was successful
  if (isSuccess) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-6 w-6" />
            Booking Confirmed!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">
              {/*TODO: get confirmation number from backend */}
              {/*Confirmation Number: {data.confirmationNumber}*/}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Hotel:</span>
                <span className="font-medium">{selectedHotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Room:</span>
                <span className="font-medium">
                  {selectedRoom?.number}, {selectedRoom?.floor}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Dates:</span>
                <span className="font-medium">{formatDateRange()}</span>
              </div>
              <div className="flex justify-between">
                <span>Guests:</span>
                <span className="font-medium">{getGuestText()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-medium">${selectedRoom?.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/profile/bookings">
              <Button className="flex-1">View My Bookings</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Booking Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Review your booking details before confirming
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Details */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Hotel:</span>
            <div className="text-right">
              {selectedHotel && (
                <>
                  <span className="font-medium">{selectedHotel?.name}</span>

                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedHotel?.streetName}, {selectedHotel?.streetNumber},{" "}
                    {selectedHotel?.city}, {selectedHotel?.country}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-muted-foreground">Room:</span>
            <div className="text-right">
              <span className="font-medium">No. {selectedRoom?.number}</span>
              {selectedRoom?.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  Floor: {selectedRoom?.floor}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              Dates:
            </span>
            <span className="font-medium">{formatDateRange()}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <UsersIcon className="h-4 w-4" />
              Guests:
            </span>
            <span className="font-medium">{getGuestText()}</span>
          </div>

          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <ClockIcon className="h-4 w-4" />
              Duration:
            </span>
            <span className="font-medium">
              {totalNights} night{totalNights !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {/* Price Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium">Price Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>
                Room rate ({totalNights}{" "}
                {totalNights === 1 ? "night" : "nights"})
              </span>
              <span>
                ${selectedRoom?.pricePerNight.toFixed(2) || 0} × {totalNights}
              </span>
            </div>
            {/* Add taxes, fees here if needed */}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${totalPrice?.toFixed(2)}</span>
          </div>
        </div>
        {isError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Something went wrong</AlertDescription>
          </Alert>
        )}
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to complete your booking.
            </AlertDescription>
          </Alert>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => methods.prev()}
            // disabled={isCreatingReservation}
            className="flex-1"
          >
            Back to Rooms
          </Button>

          <Button
            size="lg"
            onClick={handleBooking}
            disabled={!selectedRoom || isPending}
            className="flex-1"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Booking...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                Book Now - ${totalPrice?.toFixed(2)}
              </div>
            )}
          </Button>
        </div>
        {/* Booking Policies */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• Free cancellation up to 24 hours before check-in</p>
          <p>• Payment will be processed upon confirmation</p>
          <p>• Check-in: 3:00 PM | Check-out: 11:00 AM</p>
        </div>
      </CardContent>
    </Card>
  );
}

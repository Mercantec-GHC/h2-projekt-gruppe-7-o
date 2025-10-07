"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSessionStore } from "@/features/auth/stores/sessionStore";
import useAuthModalStore from "@/features/auth/stores/authModalStore";
import { useStepper } from "./booking-widget";
import { CheckCircleIcon, AlertCircleIcon, CreditCardIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  useBookingBreakdown,
  useCheckInDate,
  useCheckOutDate,
  useGetTotalBookingPrice,
  useSelectedHotel,
  useSelectedRoomBookings,
} from "../stores/bookingStore";
import { cn, formatCurrency } from "@/lib/utils";
import { useCreateBooking } from "../queries/useCreateBooking";
import { toast } from "sonner";
import { BookingDetails } from "./BookingDetails";

export default function BookingConfirmation() {
  const selectedHotel = useSelectedHotel();
  const checkInDate = useCheckInDate();
  const checkOutDate = useCheckOutDate();
  const totalPrice = useGetTotalBookingPrice();
  const selectedRooms = useSelectedRoomBookings();

  const { isAuthenticated } = useSessionStore();
  const { openModal } = useAuthModalStore();
  const methods = useStepper();

  const {
    mutateAsync,
    isError,

    isSuccess,
    isPending,
  } = useCreateBooking();

  const handleBooking = async () => {
    if (!isAuthenticated) {
      openModal();
    } else {
      // TODO: we should probably handle this better.
      if (!selectedHotel?.id || !checkInDate || !checkOutDate) {
        toast.error("Noget gik galt");
        return;
      }
      try {
        const res = await mutateAsync({
          hotelId: selectedHotel?.id,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bookings: selectedRooms,
        });
      } catch (err) {
        // If using Axios:
        const axiosErr = err as import("axios").AxiosError<any>;
        const status = axiosErr.response?.status;

        console.log(JSON.stringify(err));
        if (status === 401) {
          openModal(); // unauthorized, ask to login
          return;
        }
      }
    }
  };

  // TODO: add animation!
  if (isSuccess) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-6 w-6" />
            Booking bekræftet!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BookingDetails />
          <div className="flex gap-3 justify-end mt-12">
            <Link href="/profile/bookings">
              <Button className="flex-1">Mine bookinger</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary">Booking Oversigt</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gennemgå dine bookingoplysninger, før du bekræfter
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Details */}
        <BookingDetails />

        {isError && (
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>Noget gik galt...</AlertDescription>
          </Alert>
        )}
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              Du skal være logget ind for at fuldføre din booking.
            </AlertDescription>
          </Alert>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => methods.prev()}
            disabled={isPending}
            className="flex-1"
          >
            Gå tilbage
          </Button>

          <Button
            size="lg"
            onClick={handleBooking}
            disabled={!selectedRooms || isPending}
            className="flex-1"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Booker...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
                {formatCurrency(totalPrice)}
              </div>
            )}
          </Button>
        </div>
        {/* Booking Policies */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• Gratis afbestilling op til 24 timer før indtjekning</p>
          <p>• Betaling vil blive behandlet ved bekræftelse</p>
          <p>• Check-in: 14:00 | Check-out: 11:00</p>
        </div>
      </CardContent>
    </Card>
  );
}

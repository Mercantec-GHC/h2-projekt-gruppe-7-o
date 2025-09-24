"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStepper } from "./booking-widget";
import { CheckIcon, UsersIcon, BedIcon } from "lucide-react";
import { type AvailableRoom } from "@/features/booking/services/bookingService";
import { useSearchAvailableRooms } from "../hooks/useBooking";
import { useBookingStore } from "../bookingStore";
import { differenceInDays } from "date-fns";

export default function BookingChooseRoom() {
  const methods = useStepper();

  const {
    selectedHotel,
    totalGuests,
    checkInDate,
    checkOutDate,
    selectedRoom,
    setSelectedRoom,
  } = useBookingStore();
  const { data } = useSearchAvailableRooms();

  const nights = differenceInDays(
    checkOutDate ?? new Date(),
    checkInDate ?? new Date(),
  );

  const formatPricePerNight = (price: number) => price.toFixed(2);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Available Rooms
          <Badge variant="secondary">{data?.rooms.length} found</Badge>
        </CardTitle>
        <div className="space-y-1">
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
          <p className="text-sm text-muted-foreground">
            {checkInDate?.toLocaleDateString("da-DK")} -{" "}
            {checkOutDate?.toLocaleDateString("da-DK")} • {totalGuests}{" "}
            {totalGuests === 1 ? "guest" : "guests"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.rooms.map((room) => (
          <div
            key={room.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedRoom?.id === room.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-primary/50 hover:shadow-sm"
            }`}
            onClick={() => setSelectedRoom(room)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{room.name}</h3>
                  {selectedRoom?.id === room.id && (
                    <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full">
                      <CheckIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {room.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {room.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-4 w-4" />
                    <span>Max {room.capacity} guests</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BedIcon className="h-4 w-4" />
                    <span>{room.availableCount} available</span>
                  </div>
                </div>

                {/* Amenities */}
                {/*{room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.amenities.slice(0, 4).map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 4 && (
                      <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs">
                        +{room.amenities.length - 4} more
                      </span>
                    )}
                  </div>
                )}*/}
              </div>

              <div className="text-right ml-4">
                <div className="text-2xl font-bold">${room.totalPrice}</div>
                <div className="text-sm text-muted-foreground">
                  for {nights} {nights === 1 ? "night" : "nights"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${formatPricePerNight(room.pricePerNight)} per night
                </div>
              </div>
            </div>

            {/* Selected room details */}
            {selectedRoom?.id === room.id && (
              <div className="mt-4 pt-4 border-t bg-muted/30 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>
                      Room rate ({nights} {nights === 1 ? "night" : "nights"})
                    </span>
                    <span>
                      ${formatPricePerNight(room.pricePerNight)} × {nights}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    {/*TODO: the totalPrice should probably come from the backend*/}
                    <span>${(room.pricePerNight * nights).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/*{data?.rooms?.length > 0 && (
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => methods.prev()}
              className="flex-1"
            >
              Back to Search
            </Button>
            <Button
              size="lg"
              disabled={!selectedRoom}
              onClick={() => {
                if (!selectedRoom) return;
                methods.next();
              }}
              className="flex-1"
            >
              {selectedRoom
                ? `Continue with ${selectedRoom.name}`
                : "Select a Room"}
            </Button>
          </div>
        )}*/}
      </CardContent>
    </Card>
  );
}

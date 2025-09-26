"use client";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStepper } from "./booking-widget";
import { BabyIcon, BedIcon, Users, User } from "lucide-react";
import {
  useBookingActions,
  useBookingValidation,
  useGuestCount,
  useSelectedHotel,
  useSelectedRoomBookings,
  useSelectedRoomValidation,
  useTotalSelectedRooms,
} from "../bookingStore";
import { toast } from "sonner";
import { CONSTANTS } from "@/lib/constants";
import { Counter } from "@/components/Counter";

export function BookingAssignGuestsToRooms() {
  const methods = useStepper();
  const selectedHotel = useSelectedHotel();
  const totalSelectedRooms = useTotalSelectedRooms();
  const guestCount = useGuestCount();
  const selectedRoomBookings = useSelectedRoomBookings();

  const roomValidation = useSelectedRoomValidation();
  const bookingValidation = useBookingValidation();
  const { updateRoomGuests } = useBookingActions();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tildel gæster til rum{" "}
            </div>
            <Button variant="outline" onClick={() => methods.prev()}>
              Gå tilbage
            </Button>
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
            <div className="space-y-2 mb-4">
              <p className="text-md font-bold text-primary">Booking Details</p>
              <p className="text-sm font-medium text-muted-foreground">
                {/*{bookingDetailsText}*/}
              </p>
            </div>
            <div className="space-y-2 ">
              <p
                className={cn(
                  "font-bold text-muted-foreground flex gap-2 items-center",
                  bookingValidation.isAllAdultsAssigned &&
                    bookingValidation.isAllChildrenAssigned
                    ? "text-green-600"
                    : "text-yellow-500",
                )}
              >
                <User size={20} />
                {bookingValidation.totalGuestsAssigned} af{" "}
                {bookingValidation.totalGuests} gæster tildelt
              </p>
            </div>

            <div className="space-y-2 ">
              <p
                className={cn(
                  "text-sm font-medium text-muted-foreground flex gap-2 items-center",
                  bookingValidation.isAllAdultsAssigned ? "text-green-500" : "",
                )}
              >
                <User size={14} />
                {bookingValidation.adultsAssigned} af {bookingValidation.adults}{" "}
                voksne tildelt
              </p>
            </div>
            <div className="space-y-2 mb-4">
              <p
                className={cn(
                  "text-sm font-medium text-muted-foreground flex gap-2 items-center",
                  bookingValidation.isAllChildrenAssigned
                    ? "text-green-500"
                    : "",
                )}
              >
                <BabyIcon size={14} />
                {bookingValidation.childrenAssigned} af{" "}
                {bookingValidation.children} børn tildelt
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {totalSelectedRooms === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Ingen rum valgt. Gå tilbage og vælg rum.</p>
              <Button
                variant="outline"
                onClick={() => methods.prev()}
                className="mt-4"
              >
                Gå tilbage
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {CONSTANTS.ROOM_TYPES.map((roomType) => (
                <div key={roomType} className="flex flex-col gap-3">
                  {selectedRoomBookings[roomType].length > 0 && (
                    <p className=" font-bold font-mono">
                      {roomType} ({selectedRoomBookings[roomType].length})
                    </p>
                  )}
                  {selectedRoomBookings[roomType].map((room, roomIndex) => {
                    const currentGuestsInRoom = room.adults + room.children;
                    return (
                      <motion.div
                        key={`${roomType}-${roomIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: roomIndex * 0.1 }}
                      >
                        <Card>
                          <CardContent>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {room.type}{" "}
                                  <span className="text-muted-foreground font-normal text-sm">
                                    ({roomIndex + 1} af{" "}
                                    {selectedRoomBookings[roomType].length})
                                  </span>
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <BedIcon className="size-4" />
                                    <span>Max {room.capacity} gæster</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="size-4" />
                                    <span>{currentGuestsInRoom} tildelt</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                {/* Adults */}
                                <Counter
                                  label="Voksne"
                                  value={room.adults}
                                  decrementDisabled={room.adults <= 1}
                                  onDecrement={() =>
                                    updateRoomGuests(
                                      room.type,
                                      roomIndex,
                                      "adults",
                                      "decrement",
                                    )
                                  }
                                  onIncrement={() =>
                                    updateRoomGuests(
                                      room.type,
                                      roomIndex,
                                      "adults",
                                      "increment",
                                    )
                                  }
                                  incrementDisabled={
                                    currentGuestsInRoom >= room.capacity ||
                                    bookingValidation.isAllAdultsAssigned
                                  }
                                />
                                {guestCount.children > 0 && (
                                  <Counter
                                    label="Børn"
                                    value={room.children}
                                    decrementDisabled={room.children === 0}
                                    onDecrement={() =>
                                      updateRoomGuests(
                                        room.type,
                                        roomIndex,
                                        "children",
                                        "decrement",
                                      )
                                    }
                                    incrementDisabled={
                                      currentGuestsInRoom >= room.capacity ||
                                      bookingValidation.isAllChildrenAssigned
                                    }
                                    onIncrement={() =>
                                      updateRoomGuests(
                                        room.type,
                                        roomIndex,
                                        "children",
                                        "increment",
                                      )
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <Button
            size="lg"
            disabled={!bookingValidation.canBook}
            onClick={() => methods.next()}
          >
            Gå til bekræftelse
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

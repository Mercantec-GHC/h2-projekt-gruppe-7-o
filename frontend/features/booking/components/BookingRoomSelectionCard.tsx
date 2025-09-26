import { cn } from "@/lib/utils";
import {
  useBookingActions,
  useSelectedRoomBookings,
  useSelectedRoomValidation,
} from "../bookingStore";
import { RoomType } from "../api/dto";
import { getPriceText, RoomTypeAvailability } from "../domain";
import { BedIcon, MinusIcon, PlusIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
interface BookingRoomSelectionCardProps {
  availableRoomType: RoomTypeAvailability;
}

export const BookingRoomSelectionCard = ({
  availableRoomType,
}: BookingRoomSelectionCardProps) => {
  const selectedRoomBookings = useSelectedRoomBookings();
  const selectedRoomValidation = useSelectedRoomValidation();

  const { addRoom, removeRoom } = useBookingActions();

  return (
    <>
      <div
        className={cn(
          `p-4 border rounded-lg cursor-pointer transition-all duration-200`,
          selectedRoomBookings[availableRoomType.type].length > 0
            ? "border-black"
            : "",

          selectedRoomBookings[availableRoomType.type].length > 0 &&
            selectedRoomValidation.isValid &&
            "border-green-500",

          selectedRoomValidation.isRoomAmountValid &&
            !selectedRoomValidation.isCapcityValid &&
            "border-red-500",

          selectedRoomBookings[availableRoomType.type].length === 0 &&
            selectedRoomValidation.isValid
            ? "bg-muted opacity-30"
            : "",
        )}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b">
              <h3 className="font-semibold text-lg">
                {availableRoomType.type}
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="size-6 p-0 cursor-pointer"
                  onClick={() => removeRoom(availableRoomType.type)}
                  disabled={
                    selectedRoomBookings[availableRoomType.type].length === 0
                  }
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-4 text-center select-none">
                  {selectedRoomBookings[availableRoomType.type].length}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="size-6 p-0"
                  onClick={() =>
                    addRoom({
                      ...availableRoomType,
                      children: 0,
                      adults: 0,
                      addons: [],
                    })
                  }
                  disabled={
                    selectedRoomValidation.totalRoomsSelected >=
                    selectedRoomValidation.totalRoomsExpected
                  }
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {availableRoomType.roomDescription && (
              <p className="text-xs text-muted-foreground mb-3">
                {availableRoomType.roomDescription}
              </p>
            )}

            <div className="space-y-2 text-xs text-muted-foreground mb-3">
              <div className="flex flex-wrap gap-4 ">
                <div className="flex items-center gap-1">
                  <BedIcon className="size-4" />
                  <span className="">
                    {availableRoomType.availableRoomsCount} tilgængelige
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span className="">
                    {availableRoomType.capacity} personer
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/*<IconMoneybag className="size-4" />*/}
                <span className="">
                  Pris: {""}
                  {getPriceText({
                    pricePerNight: availableRoomType.pricePerNight,
                    totalPrice: availableRoomType.totalPrice,
                  })}
                </span>
              </div>
            </div>
          </div>
          {/*Display image when we get a correct one from the backend*/}
          {/*<img
        src={availableRoomType.roomImageUrl}
        alt={availableRoomType.type}
        className="w-full h-48 object-cover rounded-md"
      />*/}
        </div>
      </div>
    </>
  );
};

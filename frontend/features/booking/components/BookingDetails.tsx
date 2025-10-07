import { cn, formatCurrency } from "@/lib/utils";
import { UsersIcon } from "lucide-react";
import {
  useSelectedHotel,
  useCheckInDate,
  useCheckOutDate,
  useGuestCount,
  useBookingBreakdown,
} from "../stores/bookingStore";
import {
  formatDateRange,
  getTotalGuestsText,
  getAdultsCountText,
  getChildrenCountText,
  getTotalNightsStayText,
} from "../domain";

export const BookingDetails = () => {
  const selectedHotel = useSelectedHotel();
  const checkInDate = useCheckInDate();
  const checkOutDate = useCheckOutDate();
  const guestCount = useGuestCount();

  const bookingBreakdown = useBookingBreakdown();

  return (
    <>
      <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
        <div className="">
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
        <p className="font-medium">
          {formatDateRange(checkInDate, checkOutDate)}
        </p>

        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          <div className="font-medium flex items-baseline gap-1">
            <p> {getTotalGuestsText(guestCount)} </p>
            <div className="text-xs text-muted-foreground ">
              (<span className="">{getAdultsCountText(guestCount.adults)}</span>
              {guestCount.children > 0 && (
                <>
                  {" "}
                  <span>{getChildrenCountText(guestCount.children)}</span>
                </>
              )}
              )
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 rounded-md border p-4 mb-8">
        <div className="space-y-4 text-sm">
          {bookingBreakdown.rooms.map((room, index) => (
            <div
              key={room.type}
              className={cn(
                "flex justify-between p-2 rounded-md",
                index % 2 === 0 ? "bg-white" : "bg-muted",
              )}
            >
              <h3 className="font-mono font-semibold">
                {room.amountOfBookings} x {room.type} x{" "}
                {getTotalNightsStayText(bookingBreakdown.nights)}
              </h3>
              <span className="flex items-center gap-2">
                {room.amountOfBookings} x {formatCurrency(room.pricePerNight)} ×{" "}
                {""}
                {getTotalNightsStayText(bookingBreakdown.nights)}
              </span>
              <span className="italic font-mono">
                {formatCurrency(room.totalPrice)}
              </span>
            </div>
          ))}
          {/* Add taxes, fees here if needed */}
        </div>
      </div>
      <div className="flex justify-between self-end font-mono text-lg font-bold">
        <h4 className="">Total</h4>
        <span className="underline">
          {formatCurrency(bookingBreakdown.total)}
        </span>
      </div>
    </>
  );
};

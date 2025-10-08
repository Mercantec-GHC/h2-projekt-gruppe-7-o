import { AnimatePresence, motion } from "motion/react";
import {
  useBookingActions,
  useGetTotalBookingPrice,
  useNightsCount,
  useSelectedRoomBookings,
  useSelectedRoomValidation,
} from "../stores/bookingStore";
import { useSearchAvailableRooms } from "../queries/useSearchAvailableRooms";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStepper } from "./booking-widget";

export const BookingSummaryBottomSheet = () => {
  const selectedRoomValidation = useSelectedRoomValidation();
  const selectedRoomBookings = useSelectedRoomBookings();
  const availableRooms = useSearchAvailableRooms();
  const totalBookingPrice = useGetTotalBookingPrice();
  const { reset } = useBookingActions();

  const methods = useStepper();

  //TODO: THIS IS SHIT, WE NEED TO REFACTOR THIS, LOOK AT THE NESTING LMAO
  return (
    <div className="">
      <AnimatePresence>
        {selectedRoomValidation.totalRoomsSelected > 0 && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed shadow-2xl bottom-0 left-0 z-50 w-screen border-t bg-white py-12"
          >
            <div className="max-w-4xl flex flex-col mx-auto px-4 py-2">
              {(availableRooms.data ?? [])
                .filter(
                  (room) => (selectedRoomBookings[room.type] ?? []).length > 0,
                )
                .map((room) => (
                  <div key={room.type}>
                    <h3 className="font-semibold font-mono mb-2">
                      {room.type} x {selectedRoomBookings[room.type].length}
                    </h3>
                  </div>
                ))}
              <div className="flex justify-between items-baseline">
                <p className="font-semibold font-mono mt-12">
                  Total:{" "}
                  <span className="underline">
                    {formatCurrency(totalBookingPrice)}
                  </span>
                </p>
                <div className="space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset();
                      methods.prev();
                    }}
                  >
                    Gå tilbage
                  </Button>

                  <Button
                    onClick={() => methods.next()}
                    disabled={!selectedRoomValidation.isValid}
                  >
                    Gå til fordeling
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

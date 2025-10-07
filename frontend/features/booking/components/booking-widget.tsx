"use client";
import { motion } from "framer-motion";

import * as React from "react";
import { defineStepper } from "@/components/stepper";
import { BookingSearch } from "@/features/booking/components/BookingSearch";
import BookingChooseRoom from "./BookingChooseRooms";
import { BookingAssignGuestsToRooms } from "./BookingAssignGuestsToRooms";
import BookingConfirmation from "./BookingConfirmation";

interface BookingWidgetEnhancedProps {
  className?: string;
}

export const { Stepper, useStepper } = defineStepper(
  { id: "step-1", title: "Find Rum" },
  { id: "step-2", title: "Vælg Rum" },
  { id: "step-3", title: "Tildel Rum" },
  { id: "step-4", title: "Bekræft Booking" },
);

export default function BookingWidget({
  className = "",
}: BookingWidgetEnhancedProps) {
  return (
    <div className={`w-full ${className}`}>
      <Stepper.Provider className="space-y-8">
        {({ methods }) => (
          <motion.div
            animate={{
              opacity: 1,
              top: methods.current.id !== "step-1" ? -20 : "auto",
            }}
            initial={{ opacity: 0 }}
            style={{
              position: methods.current.id !== "step-1" ? "relative" : "static",
            }}
          >
            <Stepper.Navigation className="mb-8">
              {methods.all.map((step) => (
                <Stepper.Step key={step.id} of={step.id}>
                  <Stepper.Title>{step.title}</Stepper.Title>
                </Stepper.Step>
              ))}
            </Stepper.Navigation>
            {methods.switch({
              // "step-1": (step) => <BookingConfirmation />,
              "step-1": (step) => <BookingSearch />,
              "step-2": (step) => <BookingChooseRoom />,
              "step-3": (step) => <BookingAssignGuestsToRooms />,
              "step-4": (step) => <BookingConfirmation />,
            })}
          </motion.div>
        )}
      </Stepper.Provider>
    </div>
  );
}

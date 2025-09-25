"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { defineStepper } from "@/components/stepper";
import { BookingSearch } from "@/features/booking/components/BookingSearch";
import BookingChooseRoom from "./BookingChooseRooms";
import BookingSummary from "./BookingSummary";

interface BookingWidgetEnhancedProps {
  className?: string;
}

export const { Stepper, useStepper } = defineStepper(
  { id: "step-1", title: "Search Hotels" },
  { id: "step-2", title: "Choose Room" },
  { id: "step-3", title: "Confirm Booking" },
);

export default function BookingWidget({
  className = "",
}: BookingWidgetEnhancedProps) {
  return (
    <div className={`space-y-6 w-full ${className}`}>
      <Stepper.Provider className="space-y-8">
        {({ methods }) => (
          <>
            <Stepper.Navigation>
              {methods.all.map((step) => (
                <Stepper.Step
                  key={step.id}
                  of={step.id}
                  // onClick={() => methods.goTo(step.id)}
                >
                  <Stepper.Title>{step.title}</Stepper.Title>
                </Stepper.Step>
              ))}
            </Stepper.Navigation>
            {methods.switch({
              "step-1": (step) => <BookingSearch />,
              "step-2": (step) => <BookingChooseRoom />,
              "step-3": (step) => <BookingSummary />,
            })}
            <Stepper.Controls>
              {!methods.isLast && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={methods.prev}
                  disabled={methods.isFirst}
                >
                  Previous
                </Button>
              )}
              <Button onClick={methods.isLast ? methods.reset : methods.next}>
                {methods.isLast ? "Reset" : "Next"}
              </Button>
            </Stepper.Controls>
          </>
        )}
      </Stepper.Provider>
    </div>
  );
}

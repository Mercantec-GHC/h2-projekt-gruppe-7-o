import { Testimonial7 } from "@/components/shadcnblocks/testimonails/Testimonial7";
import { RoomAvailability } from "@/features/booking/types/booking";
import BookingWidget from "@/features/booking/components/booking-widget";
import { HotelCards } from "@/features/hotel/components/HotelCards";

export default function HomePage() {
  // TODO: get user from session
  //

  return (
    <div>
      <div className="content-container">
        <div className="mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-9xl font-bold font-mono text-center text-foreground mt-24 sm:mt-40">
            KABDIKHAN
          </h1>
          <h2 className="text-sm sm:text-xl text-center font-mono text-muted-foreground mb-8">
            BEST SOMALI HOTEL IN THE WORLD
          </h2>
        </div>
        <div className="flex items-center mx-auto max-w-4xl justify-center mb-12">
          <BookingWidget />
        </div>
      </div>

      <HotelCards />
      <Testimonial7 />
    </div>
  );
}

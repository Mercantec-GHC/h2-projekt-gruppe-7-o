import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import HotelApi from "../api/hotel-api";
import { Hotel } from "../domain";

const HotelCard = ({ hotel }: { hotel: Hotel }) => {
  const background =
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-gDmVqxZt1hg-unsplash.jpg";

  return (
    <Link
      href={`/hotels/${hotel.id}`}
      style={{ backgroundImage: `url(${background})` }}
      className="before:content-[] relative min-h-auto w-full overflow-hidden rounded-[.5rem] bg-black/80 bg-cover bg-center bg-no-repeat p-5 transition-all duration-300 before:absolute before:top-0 before:left-0 before:z-10 before:block before:size-full before:bg-black/50 before:transition-all before:duration-300 hover:before:bg-black/30 sm:aspect-square md:aspect-auto md:min-h-[30rem] md:max-w-[30rem]"
    >
      <div className="relative z-20 flex size-full flex-col justify-between gap-20 md:gap-16">
        <p className="text-2xl leading-[1.2] font-normal text-white md:text-3xl">
          {hotel.name}
        </p>
        <div className="flex w-full flex-col gap-8">
          <div className="flex gap-8 text-white"></div>
          <Button variant="outline" size="sm" className="w-fit">
            Visit Hotel
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

const HotelCards = async () => {
  const hotels = await HotelApi.getHotels();
  return (
    <section className="content-container">
      <div className="mb-16">
        <h2 className="text-foreground font-mono font-bold text-6xl mb-8 text-center">
          OUR HOTELS
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-4xl mx-auto font-mono">
          We have a wide range of hotels to choose from. Our hotels are located
          in the heart Mogadishu, providing you with the best possible
          experience.
        </p>
      </div>
      <div className="">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hotels?.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { HotelCards };

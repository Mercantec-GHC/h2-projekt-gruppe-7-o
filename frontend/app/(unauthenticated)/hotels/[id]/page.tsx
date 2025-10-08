import BackButton from "@/components/utils/BackButton";
import HotelApi from "@/features/hotel/api/hotel-api";

export async function generateStaticParams() {
  const hotels = await HotelApi.getHotels();
  return hotels.map((hotel) => ({ id: hotel.id }));
}

export default async function HotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hotel = await HotelApi.getHotel(id);

  const background =
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-gDmVqxZt1hg-unsplash.jpg";

  return (
    <section className="">
      <div className="content-container space-y-8">
        <BackButton icon={true} />
        <div
          style={{
            backgroundImage: `url(${background})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="relative w-full flex items-center justify-center h-96 object-center object-cover rounded-lg"
        >
          <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
          <h1 className="relative z-10 text-6xl text-white font-bold font-mono">
            {hotel.name.toUpperCase()}
          </h1>
        </div>
      </div>
    </section>
  );
}

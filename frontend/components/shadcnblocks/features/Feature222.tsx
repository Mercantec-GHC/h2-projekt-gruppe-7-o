"use client";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type stat = {
  number: string;
  text: string;
};

interface CardData {
  title: string;
  link: string;
  background: string;
  stats: Array<stat>;
}

const LIST: Array<CardData> = [
  {
    title: "Hotel Sabuzi",
    link: "#",
    background:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-gDmVqxZt1hg-unsplash.jpg",
    stats: [
      {
        number: "2011",
        text: "Urban elegance with authentic Somali flavors.",
      },
    ],
  },
  {
    title: "Hotel Qoraxle",
    link: "#",
    background:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-o9F8dRoSucM-unsplash.jpg",
    stats: [
      {
        number: "2016",
        text: "Sunrise views and modern Somali comfort.",
      },
    ],
  },
  {
    title: "Hotel Xeebta",
    link: "#",
    background:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/photos/simone-hutsch-K1W9OjEgacI-unsplash.jpg",
    stats: [
      {
        number: "2023",
        text: "Seaside serenity with local hospitality.",
      },
    ],
  },
];

const Card = ({ link, background, title, stats }: CardData) => {
  return (
    <a
      href={link}
      style={{ backgroundImage: `url(${background})` }}
      className="before:content-[] relative min-h-auto w-full overflow-hidden rounded-[.5rem] bg-black/80 bg-cover bg-center bg-no-repeat p-5 transition-all duration-300 before:absolute before:top-0 before:left-0 before:z-10 before:block before:size-full before:bg-black/50 before:transition-all before:duration-300 hover:before:bg-black/30 sm:aspect-square md:aspect-auto md:min-h-[30rem] md:max-w-[30rem]"
    >
      <div className="relative z-20 flex size-full flex-col justify-between gap-20 md:gap-16">
        <div className="text-2xl leading-[1.2] font-normal text-white md:text-3xl">
          {title}
        </div>
        <div className="flex w-full flex-col gap-8">
          <div className="flex gap-8 text-white">
            {stats.map((item, i) => (
              <div key={`${title}-${i}`} className="flex flex-col gap-1">
                <div className="text-[1.15rem] md:text-xl">{item.number}</div>
                <div className="text-sm opacity-80">{item.text}</div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-fit">
            Visit Hotel
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </a>
  );
};

const Feature222 = () => {
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
          {LIST.map((item, i) => (
            <Card key={`feature-222-${i}`} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature222 };

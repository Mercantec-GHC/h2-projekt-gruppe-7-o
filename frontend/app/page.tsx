import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { Testimonial7 } from "@/components/shadcnblocks/testimonails/Testimonial7";
import { Feature222 } from "@/components/shadcnblocks/features/Feature222";

export default async function HomePage() {
  // TODO: get user from session
  return (
    <div>
      <div className="content-container">
        <div className="mb-8 sm:mb-24">
          <h1 className="text-3xl sm:text-9xl font-bold font-mono text-center text-foreground mt-24 sm:mt-40">
            KABDIKHAN
          </h1>
          <h2 className="text-sm sm:text-xl text-center font-mono text-muted-foreground">
            BEST SOMALI HOTEL IN THE WORLD
          </h2>
        </div>
        {/* <Carousel className="hidden md:block w-full max-w-5xl mx-auto"> */}
        {/*   <CarouselContent className="-ml-1"> */}
        {/*     {Array.from({ length: 5 }).map((_, index) => ( */}
        {/*       <CarouselItem */}
        {/*         key={index} */}
        {/*         className="pl-1 md:basis-1/2 lg:basis-1/3" */}
        {/*       > */}
        {/*         <div className="p-1"> */}
        {/*           <div className=" border w-full min-h-96 rounded-md bg-white"> */}
        {/*             <img */}
        {/*               src={`https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} */}
        {/*               className="w-full h-60 object-cover rounded-t-md cursor-pointer peer" */}
        {/*             /> */}
        {/*             <h3 className="text-xl p-4 pb-2 font-bold cursor-pointer peer-hover:underline hover:underline"> */}
        {/*               <Link href={`/room/${index + 1}`}>Room {index + 1}</Link> */}
        {/*             </h3> */}
        {/*             <div className="px-4 pb-4"> */}
        {/*               <p className="text-gray-500 text-sm"> */}
        {/*                 Lorem ipsum dolor sit amet, consectetur adipiscing elit. */}
        {/*                 Sed quis nisl euismod, aliquam nisi ac, ultrices nisi. */}
        {/*                 Sed quis nisl euismod, aliquam nisi ac, ultrices nisi. */}
        {/*               </p> */}
        {/*             </div> */}
        {/*           </div> */}
        {/**/}
        {/*         </div> */}
        {/*       </CarouselItem> */}
        {/*     ))} */}
        {/*   </CarouselContent> */}
        {/*   <CarouselPrevious /> */}
        {/*   <CarouselNext /> */}
        {/* </Carousel> */}
        <div
          className="md:hidden grid grid-cols-[repeat(auto-fit,_minmax(255px,_1fr))]
      gap-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              className="shadow-xl border w-full min-h-96 rounded-md"
              key={i}
            >
              <img
                src={`https://plus.unsplash.com/premium_photo-1676823553207-758c7a66e9bb?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`}
                alt={`Picture ${i + 1}`}
                className="w-full h-60 object-cover rounded-t-md cursor-pointer"
              />
              <div className="p-4">
                <h3 className="text-xl font-bold cursor-pointer mb-3">
                  <Link href={`/hotels/${i + 1}`}>Room {i + 1}</Link>
                </h3>
                <p className="text-gray-500 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  quis nisl euismod, aliquam nisi ac, ultrices nisi. Sed quis
                  nisl euismod, aliquam nisi ac, ultrices nisi.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Feature222 />
      <Testimonial7 />

      {/* <ScrollVelocity */}
      {/*   texts={["KABDIKHAN", "HOTEL SOMALIA"]} */}
      {/*   velocity={30} */}
      {/*   className="custom-scroll-text text-blue-400/20 blur-xs" */}
      {/* /> */}
    </div>
  );
}

import ScrollVelocity from "@/components/react-bits/ScrollVelocity";
import Link from "next/link";

export default function LandingPageFooter() {
return (        
   <footer className=" mt-auto">
    <ScrollVelocity
      texts={["KABDIKHAN KABDIKHAN", "HOTEL SOMALIA"]}
      velocity={30}
      className="custom-scroll-text opacity-10"
    />

    {/* TODO: if we are on home page, just scroll top the top of the page instead */}
    <nav className="bg-primary h-20 flex items-center justify-center w-full">
      <Link href="/">
        <h4 className="text-white font-mono font-bold">KabdiKhan</h4>
      </Link>
    </nav>
  </footer>
)    
}
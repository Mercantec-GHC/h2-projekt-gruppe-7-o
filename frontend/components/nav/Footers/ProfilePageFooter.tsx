import Link from "next/link";

export default function ProfilePageFooter() {
  return (
    <footer className="mt-auto">
      {/* TODO: if we are on home page, just scroll top the top of the page instead */}
      <nav className="bg-primary h-20 flex items-center justify-center w-full">
        <Link href="/">
          <h4 className="text-white font-mono font-bold">KabdiKhan</h4>
        </Link>
      </nav>
    </footer>
  );
}

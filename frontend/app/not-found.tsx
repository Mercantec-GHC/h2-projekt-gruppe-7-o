"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NotFoundPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="flex items-center justify-center mt-52">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">404</h1>
        <p className="text-center text-gray-500 text-sm">
          Sorry, we couldn't find the page you are looking for.
        </p>
        <Link href={from?.includes("/dashboard") ? from : "/"}>
          <h4 className="text-center text-gray-500 text-sm">
            Go back to the home page
          </h4>
        </Link>
      </div>
    </div>
  );
}

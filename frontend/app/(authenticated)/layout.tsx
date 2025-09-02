import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// TODO: IS THIS ENOUGH, OR WE NEED THE MIDDLEWARE AS WELL? (SEEMS LIKE WE NEED MIDDLEWARE)
// DO WE NEVEN NEED THIS IF WE HAVE THE MIDDLEWARE?
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;

  // TODO: verify JWT (server runtime can use your preferred lib)
  if (!token) {
    redirect("/login"); // or use current path via headers
  }

  return <>{children}</>;
}

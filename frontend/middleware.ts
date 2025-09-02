import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get("token");
  //TODO: Verify the JWT's validity

  if (!cookie) {
    console.log("redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// All paths except the ones below will be protected by the middleware
export const config = {
  matcher: ["/((?!_next/|_vercel/|.*\\..*|login/?$|register/?$|$).*)"],
};

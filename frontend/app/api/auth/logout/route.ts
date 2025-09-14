// app/api/logout/route.ts
import { CONSTANTS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST() {
  // 1) Call your ASP.NET Core logout endpoint (optional)
  // If your backend invalidates refresh tokens or keeps a server session,
  // do it here. If your backend is stateless and only issues JWTs, you can skip this.
  try {
    await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
      method: "POST",
      // If your ASP.NET Core logout requires auth, forward headers here.
      // Since we’re on the server, you can read the cookie if needed via next/headers.
      // For a pure stateless JWT flow, many backends don’t require a logout call.
    });
  } catch {
    // Swallow errors to keep logout resilient
  }

  // 2) Clear the cookie on the client
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CONSTANTS.SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}

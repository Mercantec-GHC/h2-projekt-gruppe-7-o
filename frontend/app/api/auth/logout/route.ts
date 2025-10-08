// app/api/logout/route.ts
import { apiClient } from "@/api/client";
import { CONSTANTS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await apiClient.post("/auth/logout");
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

import { apiFetch } from "@/lib/utilities/apiFetch";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // throw new Error("Not implemented");
  const { email, password } = await req.json();

  const apiRes = await apiFetch(`/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    // If your API requires same-origin cookies for CSRF, you might add credentials, but most JWT flows don't:
    // credentials: "include",
  });

  if (!apiRes.ok) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: apiRes.status },
    );
  }

  const token = await apiRes.text();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}

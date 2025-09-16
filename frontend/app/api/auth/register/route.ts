import { CONSTANTS } from "@/lib/constants";
import { apiFetch } from "@/lib/utilities/apiFetch";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // throw new Error("Not implemented");
  const { firstName, lastName, email, password, confirmPassword } =
    await req.json();

  const apiRes = await apiFetch(`/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    }),
  });

  if (!apiRes.ok) {
    // TODO: error handling here, should come from the backend
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: apiRes.status },
    );
  }

  const token = await apiRes.text();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CONSTANTS.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res;
}

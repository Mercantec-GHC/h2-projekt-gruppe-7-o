import { apiClient } from "@/api/client";
import { CONSTANTS } from "@/lib/constants";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { firstName, lastName, email, password, confirmPassword } =
    await req.json();

  try {
    const apiRes = await apiClient.post(`/auth/register`, {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    });

    const token = apiRes.data;
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CONSTANTS.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;
    // TODO: how do we type this error?
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const axiosError = err as {
        response: { data?: { message?: string }; status: number };
      };
      // Non-2xx response from server
      return NextResponse.json(
        { error: axiosError.response.data?.message ?? "Something went wrong" },
        { status: axiosError.response.status },
      );
    }

    // Network error / timeout / no response
    return NextResponse.json({ error: "Network error" }, { status: 502 });
  }
}

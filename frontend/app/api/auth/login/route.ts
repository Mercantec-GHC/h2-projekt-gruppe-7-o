import { apiClient } from "@/api/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const apiRes = await apiClient.post("/auth/login", {
      email: email,
      password: password,
    });

    const token = apiRes.data.token;

    const res = NextResponse.json({ ok: true });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;

    //TODO: how do we type this properly?
  } catch (err: any) {
    return NextResponse.json(
      { error: err.response.data?.message ?? "Something went wrong" },
      { status: err.response.status },
    );
  }
}

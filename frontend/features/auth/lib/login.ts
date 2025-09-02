import { apiFetch } from "@/lib/utilities/apiFetch";
import { cookies } from "next/headers";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  error?: string;
}

export async function login({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> {
  const res = await apiFetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (res.ok) {
    const token: string = await res.json();

    const cookieStore = await cookies();

    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return { success: true };
  } else {
    return { success: false, error: "Invalid email or password" };
  }
}

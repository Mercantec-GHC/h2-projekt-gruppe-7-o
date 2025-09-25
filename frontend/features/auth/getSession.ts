import { verifyJWT } from "@/api/jwt";
import { cookies } from "next/headers";
import { Session } from "./domain";

export async function getSession(): Promise<Session> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return { isAuthenticated: false, user: null };

  try {
    const payload = await verifyJWT(token);

    return {
      isAuthenticated: true,
      user: {
        sub: payload?.sub,
        email: payload?.email,
        firstName: payload?.firstName,
        lastName: payload?.lastName,
        role: payload?.role,
      },
      exp: payload?.raw?.exp,
    };
  } catch {
    // Invalid/expired signature or claims
    return { isAuthenticated: false, user: null };
  }
}

import { verifyJWT } from "@/api/jwt";
import { cookies } from "next/headers";
import { Session } from "./domain";

export async function getSession(): Promise<Session> {
  const token = (await cookies()).get("session")?.value;
  if (!token) return { isAuthenticated: false, user: null };

  const payload = await verifyJWT(token);

  if (!payload) {
    return { isAuthenticated: false, user: null };
  }

  return {
    isAuthenticated: true,
    user: {
      sub: payload.sub,
      id: payload.sub,
      email: payload?.email,
      firstName: payload?.firstName,
      lastName: payload?.lastName,
      role: payload?.role,
    },
    exp: payload?.raw?.exp,
  };
  // Invalid/expired signature or claims
}

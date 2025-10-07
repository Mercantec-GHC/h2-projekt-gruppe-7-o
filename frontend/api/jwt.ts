import { UserRole } from "@/features/user/domain";
import { CONSTANTS } from "@/lib/constants";
import { jwtVerify } from "jose";

export async function importHS256KeyFromUtf8(secret: string) {
  const bytes = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

type DotNetPayload = {
  sub?: string;
  email?: string;
  [CONSTANTS.JWT.ROLE_URI]?: string;
  [CONSTANTS.JWT.NAMEID_URI]?: string;
};

export function normalizeDotNetClaims(p: Record<string, unknown>) {
  const roleClaim = (p as DotNetPayload)[CONSTANTS.JWT.ROLE_URI];
  const userId = p.sub ?? (p as DotNetPayload)[CONSTANTS.JWT.NAMEID_URI];

  return {
    sub: userId,
    email: p.email as string | undefined,
    firstName: p.firstName as string | undefined,
    lastName: p.lastName as string | undefined,
    role: roleClaim as UserRole | undefined,
    raw: p,
  };
}

export type NormalizedTokenPayload = {
  sub?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  raw?: {
    aud: string;
    iss: string;
    exp: number;
    iat: number;
    nbf: number;
  };
};

export function hasDashboardRole(roleClaim: NormalizedTokenPayload["role"]) {
  if (!roleClaim) return false;
  return (CONSTANTS.DASHBOARD_ROLES as readonly UserRole[]).includes(roleClaim);
}

export async function verifyJWT(token?: string) {
  if (!token) return null;
  const SECRET = await importHS256KeyFromUtf8(process.env.JWT_SECRET!);

  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    return normalizeDotNetClaims(payload);
  } catch {
    return null;
  }
}

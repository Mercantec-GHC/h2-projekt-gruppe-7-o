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

export async function importHS256KeyFromBase64(b64: string) {
  const binary =
    typeof atob === "function"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
  return crypto.subtle.importKey(
    "raw",
    bytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
}

const ROLE_URI = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAMEID_URI =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

type DotNetPayload = {
  sub?: string;
  email?: string;
  [ROLE_URI]?: string;
  [NAMEID_URI]?: string;
  // ...rest of JWT fields
};

export function normalizeDotNetClaims(p: Record<string, unknown>) {
  const roleClaim = (p as DotNetPayload)[ROLE_URI];
  const userId = p.sub ?? (p as DotNetPayload)[NAMEID_URI];

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
  // TODO: DI instead?
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

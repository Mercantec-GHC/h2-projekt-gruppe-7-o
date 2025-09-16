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

export function normalizeDotNetClaims(p: Record<string, any>) {
  const roleClaim = (p as DotNetPayload)[ROLE_URI];
  const userId = p.sub ?? (p as DotNetPayload)[NAMEID_URI];

  return {
    sub: userId,
    email: p.email as string | undefined,
    firstName: p.firstName as string | undefined,
    lastName: p.lastName as string | undefined,
    role: roleClaim,
    raw: p,
  };
}

export type NormalizedTokenPayload = {
  sub?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string; // support single or multiple roles
  raw?: {
    aud: string;
    iss: string;
    exp: number;
    iat: number;
    nbf: number;
  };
};

const DASHBOARD_ALLOWED_ROLES = ["Admin", "Cleaning", "Receptionist", "Customer"];

export function hasDashboardRole(roleClaim: NormalizedTokenPayload["roles"]) {
  if (!roleClaim) return false;
  if (Array.isArray(roleClaim)) {
    return roleClaim.some((r) => DASHBOARD_ALLOWED_ROLES.includes(r));
  }
  return DASHBOARD_ALLOWED_ROLES.includes(roleClaim);
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
  } catch (e) {
    return null;
  }
}

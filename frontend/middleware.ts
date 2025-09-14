// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { CONSTANTS } from "./lib/constants";
import { hasDashboardRole, verifyJWT } from "./lib/utilities/jwtKey";

// Allowed dashboard roles
const PROTECTED_ROUTES = ["/profile"];
const AUTH_ROUTES = ["/login", "/register", "/dashboard/login"];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const token = req.cookies.get(CONSTANTS.SESSION_COOKIE_NAME)?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  const isDashboard = pathname.startsWith("/dashboard");
  const isGeneralProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // allows us to protected all dashboard routes except the login route
  const isDashboardProtected = isDashboard && pathname !== "/dashboard/login";

  // Validate token if present, to ensure it's valid and not expired
  const session = await verifyJWT(token);

  // utility function to redirect to a page and clear the session cookie (can this be moved out of the middleware?)
  const redirectWithCookieClear = (to: string) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    url.searchParams.set(
      "from",
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""),
    );
    const response = NextResponse.redirect(url);
    response.cookies.set({
      name: CONSTANTS.SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 0,
    });
    return response;
  };

  // utility function to redirect to a page, can this be moved out of the middleware?
  const redirect = (to: string) => {
    const url = req.nextUrl.clone();
    url.pathname = to;
    const response = NextResponse.redirect(url);
    return response;
  };

  // Trying to visit all protected routes, except dashboard (without being authenticated)
  if (isGeneralProtected && !session) {
    return redirectWithCookieClear("/login");
  }

  // Dashboard protection (auth + allowed role)
  if (isDashboardProtected) {
    if (!session) {
      return redirectWithCookieClear("/dashboard/login");
    }
    if (!hasDashboardRole(session?.roles)) {
      //TODO: this is a bit tricky - what if a user is already logged in as a customer, but now they want to access the dashboard (since they are working at the company)
      // With the below, you can basically not be logged in as a user and also as an employee at the same time.
      return redirect("/dashboard/login");
    }
  }

  // TODO: this is a bit tricky - what if a user is already logged in as a customer, but now they want to access the dashboard (since they are working at the company)
  // With the below, you can basically not be logged in as a user and also try to login as an employee at the same time.
  if (isAuthRoute && session) {
    if (hasDashboardRole(session?.roles) && pathname === "/dashboard/login") {
      return NextResponse.redirect("/dashboard");
    } else {
      return redirect("/profile");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

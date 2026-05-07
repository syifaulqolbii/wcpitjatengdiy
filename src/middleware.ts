import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

const MAIN_ROUTES = ["/dashboard", "/predictions", "/leaderboard", "/profile"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin"];

type AuthSession = {
  user?: {
    role?: string | null;
  };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isMainRoute = MAIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // We fetch the session from Better Auth via the API route
  // Next.js middleware runs on Edge, so we use betterFetch directly
  const { data: session } = await betterFetch<AuthSession>(
    "/api/auth/get-session",
    {
      baseURL: process.env.BETTER_AUTH_INTERNAL_URL ?? request.nextUrl.origin,
      headers: {
        // Pass the cookie so Better Auth knows who we are
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  const isLoggedIn = !!session;
  // Based on the schema, role is stored in user object (customized)
  const isAdmin = isLoggedIn && session?.user?.role === "admin";

  // Landing page: logged-in users should continue to the app.
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 1. Auth routes (login/register): if already logged in, go to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Main routes: must be logged in
  if (isMainRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Admin routes: must be logged in AND have 'admin' role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

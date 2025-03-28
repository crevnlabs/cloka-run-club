import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware running for path:", pathname);

  // Protect admin routes except the login page
  if (pathname.startsWith("/admin") && !pathname.includes("/admin/login")) {
    console.log("Checking auth for admin route");

    // Check if the user is authenticated
    const adminAuthCookie = request.cookies.get("cloka_admin_auth");
    console.log("Admin auth cookie exists:", !!adminAuthCookie);

    if (!adminAuthCookie || !adminAuthCookie.value) {
      console.log("Admin authentication failed, redirecting to login");
      // Redirect to login page if not authenticated
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Protect user-only routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/my-events")) {
    console.log("Checking auth for user route");

    // Check if the user is authenticated
    const authCookie = request.cookies.get("cloka_auth");
    console.log("User auth cookie exists:", !!authCookie);

    // If not authenticated, redirect to login
    if (!authCookie || !authCookie.value) {
      console.log("User authentication failed, redirecting to auth page");
      const url = new URL("/auth", request.url);
      // Add the original URL as a redirect parameter
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    console.log("User authentication successful");
  }

  // Redirect old login and signup pages to the new combined auth page
  if (pathname === "/login" || pathname === "/signup") {
    console.log("Redirecting from old auth page to new combined auth page");
    const url = new URL("/auth", request.url);

    // Preserve any query parameters
    const searchParams = new URL(request.url).searchParams;
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Set the initial mode based on the original path
    if (pathname === "/signup") {
      url.searchParams.set("mode", "signup");
    }

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/my-events/:path*",
    "/login",
    "/signup",
  ],
};

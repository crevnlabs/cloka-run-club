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
    const authToken = request.cookies.get("cloka_admin_auth");
    console.log("Admin auth token exists:", !!authToken);

    const expectedToken =
      process.env.ADMIN_AUTH_TOKEN || "default_admin_token_for_auth";
    console.log("Expected token exists:", !!expectedToken);

    // For security, only log the first few characters
    if (authToken) {
      console.log("Token prefix:", authToken.value.substring(0, 3) + "...");
    }

    // Check if the token exists and matches the expected value
    if (!authToken || authToken.value !== expectedToken) {
      console.log("Authentication failed, redirecting to login");
      // Redirect to login page if not authenticated
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }

    console.log("Admin authentication successful");
  }

  // Protect user-only routes
  if (pathname.startsWith("/profile") || pathname.startsWith("/my-events")) {
    console.log("Checking auth for user route");

    // Check if the user is authenticated
    const authCookie = request.cookies.get("cloka_auth");
    console.log("User auth cookie exists:", !!authCookie);

    // If not authenticated, redirect to login
    if (!authCookie || !authCookie.value) {
      console.log("User authentication failed, redirecting to login");
      const url = new URL("/login", request.url);
      // Add the original URL as a redirect parameter
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    console.log("User authentication successful");
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};

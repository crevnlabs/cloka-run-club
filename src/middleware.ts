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
    console.log("Auth token exists:", !!authToken);

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

    console.log("Authentication successful");
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*"],
};

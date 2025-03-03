import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Check if the user is authenticated
export async function isAuthenticated() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("cloka_admin_auth");

  // Check if the token exists and matches the expected value
  return authToken?.value === process.env.ADMIN_AUTH_TOKEN;
}

// Set authentication cookie
export async function setAuthCookie(password: string): Promise<boolean> {
  // Check if the password matches the environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    // Set a cookie with the auth token
    const cookieStore = await cookies();
    cookieStore.set(
      "cloka_admin_auth",
      process.env.ADMIN_AUTH_TOKEN || "default_token",
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      }
    );
    return true;
  }
  return false;
}

// Middleware to protect routes
export async function protectRoute(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("cloka_admin_auth");

  // Check if the token exists and matches the expected value
  if (authToken?.value !== process.env.ADMIN_AUTH_TOKEN) {
    // Redirect to login page if not authenticated
    const url = new URL("/admin/login", request.url);
    return NextResponse.redirect(url);
  }

  return null; // Continue to the protected route
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    console.log("Login attempt received");

    if (!password) {
      console.log("Password is missing");
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    // Check if the password is correct
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    console.log("Admin password exists:", !!adminPassword);
    console.log("Admin token exists:", !!adminToken);

    if (password === adminPassword) {
      console.log("Password is correct, setting cookie");

      // Create a response
      const response = NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );

      // Set the cookie with a hardcoded token if env var is missing
      const tokenValue = adminToken || "default_admin_token_for_auth";
      console.log("Using token:", tokenValue.substring(0, 3) + "...");

      response.cookies.set({
        name: "cloka_admin_auth",
        value: tokenValue,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        sameSite: "lax",
      });

      return response;
    } else {
      console.log("Password is incorrect");
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error during login:", error);

    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

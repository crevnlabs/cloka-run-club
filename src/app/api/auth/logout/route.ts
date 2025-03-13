import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create a response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set({
      name: "cloka_auth",
      value: "",
      httpOnly: true,
      expires: new Date(0), // Expire immediately
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}

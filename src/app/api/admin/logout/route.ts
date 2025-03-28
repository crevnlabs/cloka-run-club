import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create a response that clears the admin auth cookie
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear the admin auth cookie
    response.cookies.delete("cloka_admin_auth");

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during logout" },
      { status: 500 }
    );
  }
}

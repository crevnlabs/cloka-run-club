import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the admin auth cookie
    const adminAuthCookie = request.cookies.get("cloka_admin_auth");

    if (!adminAuthCookie || !adminAuthCookie.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the user and verify admin role
    const user = await User.findById(adminAuthCookie.value).select("-password");

    if (!user) {
      // Clear the invalid cookie
      const response = NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
      response.cookies.delete("cloka_admin_auth");
      return response;
    }

    if (user.role !== "admin") {
      // Clear the cookie if user is not an admin
      const response = NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
      response.cookies.delete("cloka_admin_auth");
      return response;
    }

    return NextResponse.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

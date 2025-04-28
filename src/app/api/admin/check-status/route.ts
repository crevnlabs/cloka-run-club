import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the user auth cookie
    const authCookie = request.cookies.get("cloka_auth");

    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Find the user and verify admin role
    const user = await User.findById(authCookie.value).select("-password");

    if (!user) {
      // Clear the invalid cookie
      const response = NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
      response.cookies.set({
        name: "cloka_auth",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    if (user.role !== "admin" && user.role !== "super-admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
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

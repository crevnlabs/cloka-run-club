import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { userId, superadminPassword } = await request.json();

    // Authenticate and check admin
    const authCookie = request.cookies.get("cloka_auth");
    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const adminUser = await User.findById(authCookie.value);
    if (!adminUser || adminUser.role !== "super-admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Verify superadmin password
    if (
      !process.env.ADMIN_PASSWORD ||
      superadminPassword !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid superadmin password" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Find and update the user
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already an admin
    if (user.role === "admin" || user.role === "super-admin") {
      return NextResponse.json(
        { success: false, message: "User is already an admin" },
        { status: 400 }
      );
    }

    // Update user role to admin
    user.role = "admin";
    await user.save();

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return NextResponse.json(
      { success: false, message: "Failed to promote user to admin" },
      { status: 500 }
    );
  }
}

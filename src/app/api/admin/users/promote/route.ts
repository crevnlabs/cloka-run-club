import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { userId, superadminPassword } = await request.json();

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
    if (user.role === "admin") {
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

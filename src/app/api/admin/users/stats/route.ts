import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// GET: Get user statistics
export async function GET(request: NextRequest) {
  // Authenticate and check admin
  const authCookie = request.cookies.get("cloka_auth");
  if (!authCookie || !authCookie.value) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const adminUser = await User.findById(authCookie.value);
  if (
    !adminUser ||
    (adminUser.role !== "admin" && adminUser.role !== "super-admin")
  ) {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    // Connect to the database
    await dbConnect();

    // Get total count
    const total = await User.countDocuments();

    // Get gender counts
    const maleCount = await User.countDocuments({ gender: "male" });
    const femaleCount = await User.countDocuments({ gender: "female" });
    const otherCount = await User.countDocuments({ gender: "other" });

    // Count users with null or undefined gender
    const unknownCount = await User.countDocuments({
      $or: [{ gender: null }, { gender: { $exists: false } }],
    });

    return NextResponse.json({
      success: true,
      stats: {
        gender: {
          male: maleCount,
          female: femaleCount,
          other: otherCount,
          unknown: unknownCount,
          total: total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

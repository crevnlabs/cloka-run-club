import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Get total count of all users
    const totalCount = await User.countDocuments();

    return NextResponse.json(
      {
        count: totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching registration count:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch registration count" },
      { status: 500 }
    );
  }
}

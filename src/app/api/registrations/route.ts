import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Get all registrations sorted with approved ones first, then by createdAt
    const registrations = await Registration.aggregate([
      {
        $sort: {
          // Sort by approved status (true values first) and then by createdAt descending
          approved: -1, // -1 puts true values first, then false, then null
          createdAt: -1, // Most recent first
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: registrations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching all registrations:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

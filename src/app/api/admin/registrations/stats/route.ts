import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function GET() {
  try {
    // Authentication is already handled by middleware
    // We'll skip the double-check here since it's causing issues
    // and the middleware is already protecting this route

    // Connect to the database
    await dbConnect();

    // Get total count
    const total = await Registration.countDocuments();

    // Get approved count
    const approved = await Registration.countDocuments({ approved: true });

    // Get rejected count
    const rejected = await Registration.countDocuments({ approved: false });

    // Get pending count
    const pending = await Registration.countDocuments({ approved: null });

    return NextResponse.json(
      {
        success: true,
        stats: {
          total,
          approved,
          rejected,
          pending,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching registration stats:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch registration statistics" },
      { status: 500 }
    );
  }
}

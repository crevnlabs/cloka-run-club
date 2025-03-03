import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Get all registrations without pagination
    const registrations = await Registration.find({}).sort({ createdAt: -1 });

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

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse request body
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json(
        { success: false, message: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Update the registration
    const registration = await UserEvent.findByIdAndUpdate(
      registrationId,
      {
        checkedIn: true,
        checkedInAt: new Date(),
      },
      { new: true }
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
      message: "Check-in successful",
    });
  } catch (error) {
    console.error("Error checking in registration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check in registration" },
      { status: 500 }
    );
  }
}

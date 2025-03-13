import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get request body
    const body = await request.json();
    const { registrationId, approved } = body;

    // Validate required fields
    if (!registrationId) {
      return NextResponse.json(
        { success: false, message: "Registration ID is required" },
        { status: 400 }
      );
    }

    if (approved === undefined || approved === null) {
      return NextResponse.json(
        { success: false, message: "Approval status is required" },
        { status: 400 }
      );
    }

    // Find and update the registration
    const userEvent = await UserEvent.findByIdAndUpdate(
      registrationId,
      { approved },
      { new: true } // Return the updated document
    );

    if (!userEvent) {
      return NextResponse.json(
        { success: false, message: "Event registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Event registration ${
          approved ? "approved" : "rejected"
        } successfully`,
        userEvent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating event registration:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update event registration" },
      { status: 500 }
    );
  }
}

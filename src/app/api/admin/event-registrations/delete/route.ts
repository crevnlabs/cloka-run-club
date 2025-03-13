import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get request body
    const body = await request.json();
    const { registrationId } = body;

    // Validate required fields
    if (!registrationId) {
      return NextResponse.json(
        { success: false, message: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the registration
    const userEvent = await UserEvent.findByIdAndDelete(registrationId);

    if (!userEvent) {
      return NextResponse.json(
        { success: false, message: "Event registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Event registration deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event registration:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete event registration" },
      { status: 500 }
    );
  }
}

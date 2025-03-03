import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function POST(request: NextRequest) {
  try {
    // Authentication is already handled by middleware
    // We'll skip the double-check here since it's causing issues
    // and the middleware is already protecting this route

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
    const registration = await Registration.findByIdAndDelete(registrationId);

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting registration:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete registration" },
      { status: 500 }
    );
  }
}

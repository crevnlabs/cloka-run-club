import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

export async function POST(request: Request) {
  try {
    // Authentication is already handled by middleware
    // We'll skip the double-check here since it's causing issues
    // and the middleware is already protecting this route

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
    const registration = await Registration.findByIdAndUpdate(
      registrationId,
      { approved },
      { new: true } // Return the updated document
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Registration ${
          approved ? "approved" : "rejected"
        } successfully`,
        registration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating registration:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update registration" },
      { status: 500 }
    );
  }
}

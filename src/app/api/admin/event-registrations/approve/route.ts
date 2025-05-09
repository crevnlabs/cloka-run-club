import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
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

    // Allow approved to be true, false, or null (pending)
    if (approved === undefined) {
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

    const statusMsg =
      approved === true
        ? "approved"
        : approved === false
        ? "rejected"
        : "set to pending";

    return NextResponse.json(
      {
        success: true,
        message: `Event registration ${statusMsg} successfully`,
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

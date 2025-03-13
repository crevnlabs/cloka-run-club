import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the auth cookie
    const authCookie = request.cookies.get("cloka_auth");

    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = authCookie.value;

    // Get request body
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Find the registration
    const userEvent = await UserEvent.findOne({ userId, eventId });

    if (!userEvent) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    // Delete the registration
    await UserEvent.deleteOne({ _id: userEvent._id });

    return NextResponse.json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling registration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while cancelling registration",
      },
      { status: 500 }
    );
  }
}

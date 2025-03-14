import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import User from "@/models/User";
import Event from "@/models/Event";

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

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { eventId, token } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Check-in token is required" },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Validate the token
    let tokenData;
    try {
      tokenData = atob(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return NextResponse.json(
        { success: false, message: "Invalid token format" },
        { status: 400 }
      );
    }

    // Parse the token data
    const [tokenEventId, timestampStr] = tokenData.split(":");
    const timestamp = parseInt(timestampStr, 10);

    // Validate the token
    if (tokenEventId !== eventId) {
      return NextResponse.json(
        { success: false, message: "Token does not match event" },
        { status: 400 }
      );
    }

    // Check if the token has expired (5 minutes)
    const now = Date.now();
    const tokenAge = now - timestamp;
    const maxTokenAge = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (tokenAge > maxTokenAge) {
      return NextResponse.json(
        {
          success: false,
          message: "Token has expired, please scan the QR code again",
        },
        { status: 400 }
      );
    }

    // Check if user is registered for this event
    const userEvent = await UserEvent.findOne({
      userId,
      eventId,
    });

    if (!userEvent) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not registered for this event",
        },
        { status: 400 }
      );
    }

    // Check if user is approved for this event
    if (userEvent.approved !== true) {
      return NextResponse.json(
        {
          success: false,
          message: "Your registration for this event has not been approved",
        },
        { status: 400 }
      );
    }

    // Check if user is already checked in
    if (userEvent.checkedIn) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already checked in for this event",
        },
        { status: 400 }
      );
    }

    // Update user event to mark as checked in
    userEvent.checkedIn = true;
    userEvent.checkedInAt = new Date();
    await userEvent.save();

    return NextResponse.json(
      {
        success: true,
        message: "Successfully checked in for event",
        userEvent: {
          _id: userEvent._id,
          eventId: userEvent.eventId,
          approved: userEvent.approved,
          checkedIn: userEvent.checkedIn,
          checkedInAt: userEvent.checkedInAt,
          createdAt: userEvent.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking in for event:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during check-in" },
      { status: 500 }
    );
  }
}

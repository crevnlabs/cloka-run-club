import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get request body
    const body = await request.json();
    const { eventId, token } = body;

    if (!eventId || !token) {
      return NextResponse.json(
        { success: false, message: "Event ID and token are required" },
        { status: 400 }
      );
    }

    // Validate that the event ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { success: false, message: "Invalid event ID format" },
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

    // Decode the token
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

    // Token is valid
    return NextResponse.json(
      {
        success: true,
        message: "Token is valid",
        eventId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating token:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during token validation" },
      { status: 500 }
    );
  }
}

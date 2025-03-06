import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";
import Registration from "@/models/Registration";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse the request body
    const { eventId, secret, instagramUsername } = await request.json();

    // Validate required fields
    if (!eventId || !secret || !instagramUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Event ID, secret, and Instagram username are required",
        },
        { status: 400 }
      );
    }

    // Find the event
    const event = await Event.findById(eventId);

    // Check if event exists
    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Check if the Instagram username is in any approved registration
    const approvedRegistration = await Registration.findOne({
      instagramUsername: instagramUsername,
      approved: true,
    });

    // Verify the secret first
    if (event.secret.toLowerCase() !== secret.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid secret. Please check and try again.",
        },
        { status: 403 }
      );
    }

    // Verify the Instagram username is in any approved registration
    if (!approvedRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Instagram username. Please check and try again.",
        },
        { status: 403 }
      );
    }

    // If we get here, either the secret is valid or the user has an approved registration
    // Determine if the exactLocation is a Google Maps link or just text
    const exactLocation = event.exactLocation || event.location;
    const isGoogleMapsLink =
      exactLocation &&
      (exactLocation.includes("maps.google.com") ||
        exactLocation.includes("goo.gl/maps") ||
        exactLocation.includes("maps.app.goo.gl"));

    return NextResponse.json(
      {
        success: true,
        message: approvedRegistration
          ? "Verified through your approved registration"
          : "Secret verified successfully",
        exactLocation,
        isGoogleMapsLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying event secret:", error);

    return NextResponse.json(
      { success: false, message: "Failed to verify event secret" },
      { status: 500 }
    );
  }
}

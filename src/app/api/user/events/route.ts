import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
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

    // Find all user events for this user
    const userEvents = await UserEvent.find({ userId }).sort({ createdAt: -1 });

    if (!userEvents || userEvents.length === 0) {
      return NextResponse.json({ success: true, events: [] });
    }

    // Get all event IDs
    const eventIds = userEvents.map((userEvent) => userEvent.eventId);

    // Fetch the actual events
    const events = await Event.find({ _id: { $in: eventIds } });

    // Combine event data with approval status
    const eventsWithStatus = events.map((event) => {
      const userEvent = userEvents.find(
        (ue) => ue.eventId.toString() === event._id.toString()
      );

      return {
        _id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        exactLocation: event.exactLocation,
        postApprovalMessage: event.postApprovalMessage,
        approved: userEvent ? userEvent.approved : null,
      };
    });

    return NextResponse.json({
      success: true,
      events: eventsWithStatus,
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

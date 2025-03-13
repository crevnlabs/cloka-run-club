import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET(request: Request) {
  try {
    // Connect to the database
    await dbConnect();

    // Get the URL and check for query parameters
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    let events;

    if (showAll) {
      // Fetch all events
      events = await Event.find({}).sort({ date: 1 });
    } else {
      // Fetch upcoming events (events with date >= today)
      events = await Event.find({
        date: { $gte: new Date() },
      }).sort({ date: 1 });
    }

    return NextResponse.json(
      {
        success: true,
        events,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching events:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

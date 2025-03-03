import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch upcoming events (events with date >= today)
    const events = await Event.find({
      date: { $gte: new Date() },
    }).sort({ date: 1 });

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

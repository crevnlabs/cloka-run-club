import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");

    // Build query
    const query: Record<string, mongoose.Types.ObjectId | null | boolean> = {};
    if (eventId) {
      query.eventId = new mongoose.Types.ObjectId(eventId);
    }

    // Count total registrations
    const total = await UserEvent.countDocuments(query);

    // Count approved registrations
    const approved = await UserEvent.countDocuments({
      ...query,
      approved: true,
    });

    // Count rejected registrations
    const rejected = await UserEvent.countDocuments({
      ...query,
      approved: false,
    });

    // Count pending registrations
    const pending = await UserEvent.countDocuments({
      ...query,
      approved: null,
    });

    // Get unique event count
    const uniqueEvents = await UserEvent.distinct("eventId", {});
    const eventsCount = uniqueEvents.length;

    // Get unique user count
    const uniqueUsers = await UserEvent.distinct("userId", {});
    const usersCount = uniqueUsers.length;

    return NextResponse.json({
      total,
      approved,
      rejected,
      pending,
      eventsCount,
      usersCount,
    });
  } catch (error) {
    console.error("Error fetching event registration stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event registration stats" },
      { status: 500 }
    );
  }
}

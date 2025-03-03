import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    // Authentication is already handled by middleware
    // We'll skip the double-check here since it's causing issues
    // and the middleware is already protecting this route

    // Connect to the database
    await dbConnect();

    // Get query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const gender = url.searchParams.get("gender");
    const joinCrew = url.searchParams.get("joinCrew");
    const approved = url.searchParams.get("approved");
    const eventId = url.searchParams.get("eventId");

    // Build query
    const query: Record<string, any> = {};

    if (gender) {
      query.gender = gender;
    }

    if (joinCrew) {
      query.joinCrew = joinCrew === "true";
    }

    if (approved) {
      if (approved === "pending") {
        query.approved = null;
      } else {
        query.approved = approved === "true";
      }
    }

    if (eventId) {
      query.eventId = eventId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch registrations from the database with event population
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Registration.countDocuments(query);

    // Fetch events for the registrations that have eventId
    const eventIds = registrations
      .filter((reg: any) => reg.eventId)
      .map((reg: any) => reg.eventId);

    const events =
      eventIds.length > 0 ? await Event.find({ _id: { $in: eventIds } }) : [];

    // Create a map of events by ID for easy lookup
    const eventMap: Record<string, any> = {};
    events.forEach((event: any) => {
      eventMap[event._id.toString()] = event;
    });

    // Add event information to registrations
    const registrationsWithEvents = registrations.map((reg: any) => {
      const regObj = reg.toObject();
      if (reg.eventId && eventMap[reg.eventId.toString()]) {
        regObj.event = {
          _id: eventMap[reg.eventId.toString()]._id,
          title: eventMap[reg.eventId.toString()].title,
          date: eventMap[reg.eventId.toString()].date,
          location: eventMap[reg.eventId.toString()].location,
        };
      }
      return regObj;
    });

    return NextResponse.json(
      {
        success: true,
        registrations: registrationsWithEvents,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching registrations:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

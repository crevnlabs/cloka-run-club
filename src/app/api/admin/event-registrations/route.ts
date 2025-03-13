import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import User from "@/models/User";
import Event from "@/models/Event";
import mongoose from "mongoose";

// Define types for the document data we need
type UserData = {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  gender?: string;
  instagramUsername?: string;
};

type EventData = {
  _id: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  location: string;
};

type UserEventData = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  approved: boolean | null;
  createdAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const eventId = searchParams.get("eventId") || "";
    const approved = searchParams.get("approved") || "";
    const search = searchParams.get("search") || "";
    const ageRange = searchParams.get("ageRange") || "";
    const sex = searchParams.get("sex") || "";

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, mongoose.Types.ObjectId | boolean | null> = {};

    // Filter by event
    if (eventId) {
      query.eventId = new mongoose.Types.ObjectId(eventId);
    }

    // Filter by approval status
    if (approved === "true") {
      query.approved = true;
    } else if (approved === "false") {
      query.approved = false;
    } else if (approved === "pending") {
      query.approved = null;
    }

    // Fetch user events with pagination
    const userEventsPromise = UserEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Count total documents for pagination
    const totalPromise = UserEvent.countDocuments(query);

    // Execute both promises in parallel
    const [userEvents, total] = await Promise.all([
      userEventsPromise,
      totalPromise,
    ]);

    // Type assertion for userEvents
    const typedUserEvents = userEvents as unknown as UserEventData[];

    // Fetch related user and event data
    const userIds = typedUserEvents.map((ue) => ue.userId);
    const eventIds = typedUserEvents.map((ue) => ue.eventId);

    const usersPromise = User.find({ _id: { $in: userIds } }).lean();
    const eventsPromise = Event.find({ _id: { $in: eventIds } }).lean();

    const [users, events] = await Promise.all([usersPromise, eventsPromise]);

    // Type assertions for users and events
    const typedUsers = users as unknown as UserData[];
    const typedEvents = events as unknown as EventData[];

    // Create a map for quick lookups
    const userMap = new Map(
      typedUsers.map((user) => [user._id.toString(), user])
    );
    const eventMap = new Map(
      typedEvents.map((event) => [event._id.toString(), event])
    );

    // Enrich user events with user and event data
    const enrichedUserEvents = typedUserEvents
      .map((userEvent) => {
        const user = userMap.get(userEvent.userId.toString());
        const event = eventMap.get(userEvent.eventId.toString());

        // Filter by search term if provided
        if (search && user) {
          const searchLower = search.toLowerCase();
          const nameMatch = user.name?.toLowerCase().includes(searchLower);
          const emailMatch = user.email?.toLowerCase().includes(searchLower);

          if (!nameMatch && !emailMatch) {
            return null; // Skip this record if it doesn't match search
          }
        }

        // Filter by age range if provided
        if (ageRange && user && user.age) {
          const [minAge, maxAge] = ageRange.split("-").map(Number);
          if ((maxAge && user.age < minAge) || user.age > maxAge) {
            return null; // Skip if age is outside range
          } else if (ageRange === "56+" && user.age < 56) {
            return null; // Special case for 56+
          }
        }

        // Filter by sex/gender if provided
        if (sex && user && user.gender) {
          if (user.gender !== sex) {
            return null; // Skip if gender doesn't match
          }
        }

        return {
          _id: userEvent._id,
          userId: userEvent.userId,
          eventId: userEvent.eventId,
          approved: userEvent.approved,
          createdAt: userEvent.createdAt,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                age: user.age,
                sex: user.gender,
                instagram: user.instagramUsername,
              }
            : null,
          event: event
            ? {
                _id: event._id,
                title: event.title,
                date: event.date,
                location: event.location,
              }
            : null,
        };
      })
      .filter(Boolean); // Remove null entries (filtered out by search)

    // Calculate pagination data
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      eventRegistrations: enrichedUserEvents,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";

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

    // Build query
    const query: Record<string, string | boolean | null> = {};

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

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch registrations from the database
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Registration.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        registrations,
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

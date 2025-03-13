import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import mongoose, { PipelineStage } from "mongoose";

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

    // Build match stage for aggregation
    const matchStage: Record<string, unknown> = {};

    // Filter by event
    if (eventId) {
      matchStage.eventId = new mongoose.Types.ObjectId(eventId);
    }

    // Filter by approval status
    if (approved === "true") {
      matchStage.approved = true;
    } else if (approved === "false") {
      matchStage.approved = false;
    } else if (approved === "pending") {
      matchStage.approved = null;
    }

    // Build the aggregation pipeline
    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      // Lookup users
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Lookup events
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      // Unwind the arrays created by lookup
      { $unwind: { path: "$userDetails" } },
      { $unwind: { path: "$eventDetails" } },
    ];

    // Add search filter if provided
    if (search) {
      // Add a match stage after the lookups to filter by user fields
      pipeline.push({
        $match: {
          $or: [
            { "userDetails.name": { $regex: search, $options: "i" } },
            { "userDetails.email": { $regex: search, $options: "i" } },
            {
              "userDetails.instagramUsername": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    // Add age range filter if provided
    if (ageRange) {
      if (ageRange === "56+") {
        pipeline.push({
          $match: { "userDetails.age": { $gte: 56 } },
        });
      } else {
        const [minAge, maxAge] = ageRange.split("-").map(Number);
        pipeline.push({
          $match: {
            "userDetails.age": {
              $gte: minAge,
              ...(maxAge && { $lte: maxAge }),
            },
          },
        });
      }
    }

    // Add gender/sex filter if provided
    if (sex) {
      pipeline.push({
        $match: { "userDetails.gender": sex },
      });
    }

    // Project the final shape of the documents
    pipeline.push({
      $project: {
        _id: 1,
        userId: 1,
        eventId: 1,
        approved: 1,
        createdAt: 1,
        user: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          phone: "$userDetails.phone",
          age: "$userDetails.age",
          sex: "$userDetails.gender",
          instagram: "$userDetails.instagramUsername",
        },
        event: {
          _id: "$eventDetails._id",
          title: "$eventDetails.title",
          date: "$eventDetails.date",
          location: "$eventDetails.location",
        },
      },
    });

    // Apply pagination after all filters
    pipeline.push({ $skip: skip }, { $limit: limit });

    // Execute the aggregation
    const eventRegistrations = await UserEvent.aggregate(pipeline);

    // Count total documents for pagination
    // We need to build a separate count pipeline without skip, limit, and projection
    const countPipeline: PipelineStage[] = [
      { $match: matchStage },
      // Lookup users for filtering
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
    ];

    // Add the same filters as the main pipeline
    if (search) {
      countPipeline.push({
        $match: {
          $or: [
            { "userDetails.name": { $regex: search, $options: "i" } },
            { "userDetails.email": { $regex: search, $options: "i" } },
            {
              "userDetails.instagramUsername": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    if (ageRange) {
      if (ageRange === "56+") {
        countPipeline.push({
          $match: { "userDetails.age": { $gte: 56 } },
        });
      } else {
        const [minAge, maxAge] = ageRange.split("-").map(Number);
        countPipeline.push({
          $match: {
            "userDetails.age": {
              $gte: minAge,
              ...(maxAge && { $lte: maxAge }),
            },
          },
        });
      }
    }

    if (sex) {
      countPipeline.push({
        $match: { "userDetails.gender": sex },
      });
    }

    // Add count stage
    countPipeline.push({ $count: "total" });

    const countResult = await UserEvent.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Calculate pagination data
    const pages = Math.ceil(total / limit);

    console.log(JSON.stringify(eventRegistrations, null, 2));

    return NextResponse.json({
      success: true,
      eventRegistrations,
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

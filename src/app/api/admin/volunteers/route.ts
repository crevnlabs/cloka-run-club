import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import VolunteerApplication from "@/models/Volunteer";
import User from "@/models/User";

interface QueryFilters {
  status?: string;
  userId?: { $in: string[] };
}

interface UserQueryFilters {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
    instagramUsername?: { $regex: string; $options: string };
  }>;
  age?: { $gte: number; $lte?: number };
  gender?: string;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Check admin authentication
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("cloka_auth");

    if (!authCookie?.value) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user and check if admin
    const user = await User.findById(authCookie.value);
    if (!user?.role || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const ageRange = searchParams.get("ageRange");
    const gender = searchParams.get("gender");
    const emailsOnly = searchParams.get("emailsOnly") === "true";

    // Build query
    const query: QueryFilters = {};
    if (status) {
      query.status = status;
    }

    // Build user query for search
    const userQuery: UserQueryFilters = {};
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { instagramUsername: { $regex: search, $options: "i" } },
      ];
    }
    if (ageRange) {
      const [min, max] = ageRange.split("-");
      if (max === "+") {
        userQuery.age = { $gte: parseInt(min) };
      } else {
        userQuery.age = {
          $gte: parseInt(min),
          $lte: parseInt(max),
        };
      }
    }
    if (gender) {
      userQuery.gender = gender;
    }

    // Get matching user IDs if there are user filters
    let userIds: string[] = [];
    if (Object.keys(userQuery).length > 0) {
      const users = await User.find(userQuery).select("_id");
      userIds = users.map((user) => user._id);
      query.userId = { $in: userIds };
    }

    // If only emails are requested
    if (emailsOnly) {
      const applications = await VolunteerApplication.find(query)
        .populate("userId", "email")
        .select("userId");
      const emails = applications
        .map((app) => (app.userId as { email: string })?.email)
        .filter(Boolean);
      return NextResponse.json({ success: true, emails });
    }

    // Get total count for pagination
    const total = await VolunteerApplication.countDocuments(query);

    // Get applications with pagination
    const applications = await VolunteerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "userId",
        model: "User",
        select: "name email phone age gender instagramUsername",
        options: { lean: true },
      })
      .lean()
      .exec();

    // Transform the data to match the expected format
    const transformedApplications = applications.map((app) => ({
      ...app,
      user: app.userId, // Move userId data to user field
      userId: app.userId?._id, // Keep the ID in userId
    }));

    // Get stats
    const stats = {
      total,
      approved: await VolunteerApplication.countDocuments({
        ...query,
        status: "approved",
      }),
      rejected: await VolunteerApplication.countDocuments({
        ...query,
        status: "rejected",
      }),
      pending: await VolunteerApplication.countDocuments({
        ...query,
        status: "pending",
      }),
    };

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
      stats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in admin volunteers GET:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

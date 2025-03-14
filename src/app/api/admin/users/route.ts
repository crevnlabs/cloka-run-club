import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// Define a type for our MongoDB query
interface UserQuery {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  gender?: string | { $in: Array<null | undefined> };
}

// GET: List all users
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const gender = searchParams.get("gender");

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build search query
    let query: UserQuery = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Add gender filter if provided
    if (gender) {
      // Handle the special case for "null" which represents unknown gender
      if (gender === "null") {
        query.gender = { $in: [null, undefined] };
      } else {
        query.gender = gender;
      }
    }

    console.log("MongoDB query:", JSON.stringify(query));

    // Get users with pagination
    const users = await User.find(query)
      .select("-password") // Exclude password field
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

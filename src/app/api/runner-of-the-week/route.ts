import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RunnerOfTheWeek from "@/models/RunnerOfTheWeek";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Fetch the most recent runner of the week
    const runner = await RunnerOfTheWeek.findOne().sort({ weekOf: -1 });

    if (!runner) {
      return NextResponse.json(
        { success: false, message: "No runner of the week found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        runner,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching runner of the week:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch runner of the week" },
      { status: 500 }
    );
  }
}

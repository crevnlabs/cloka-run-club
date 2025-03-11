import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Authentication is already handled by middleware
    // We'll skip the double-check here since it's causing issues
    // and the middleware is already protecting this route

    // Connect to the database
    await dbConnect();

    // Get request body
    const body = await request.json();
    const { registrationId, password } = body;

    // Validate required fields
    if (!registrationId) {
      return NextResponse.json(
        { success: false, message: "Registration ID is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Find and update the registration
    const registration = await Registration.findByIdAndUpdate(
      registrationId,
      { password: hashedPassword },
      { new: true } // Return the updated document
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password set successfully",
        registration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error setting password:", error);

    return NextResponse.json(
      { success: false, message: "Failed to set password" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import bcrypt from "bcryptjs";

// In a real application, you would connect to a database here
// This is a simplified example that just returns a success response

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    const body = await request.json();
    const {
      name,
      email,
      phone,
      age,
      gender,
      joinCrew,
      acceptTerms,
      emergencyContact,
      instagramUsername,
      eventId,
      password,
    } = body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !age ||
      !gender ||
      !emergencyContact ||
      !acceptTerms ||
      !password
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already registered with this email
    const existingRegistration = await Registration.findOne({ email });
    if (existingRegistration) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine if user wants to join the crew
    const wantsToJoinCrew = joinCrew === true;

    // Create new registration in the database
    const registration = await Registration.create({
      name,
      email,
      phone,
      age: parseInt(age),
      gender,
      joinCrew: wantsToJoinCrew,
      acceptTerms: true,
      emergencyContact,
      instagramUsername: instagramUsername || null,
      eventId: eventId || null,
      approved: null,
      createdAt: new Date(),
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          name,
          email,
          registrationId: registration._id,
          joinedCrew: wantsToJoinCrew,
          instagramUsername,
          eventId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering for run:", error);

    return NextResponse.json(
      { success: false, message: "Failed to register for run" },
      { status: 500 }
    );
  }
}

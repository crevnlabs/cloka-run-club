import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      age,
      gender,
      emergencyContact,
      instagramUsername,
      joinCrew,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Check if user already exists with the same email
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if user already exists with the same phone number
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return NextResponse.json(
        { success: false, message: "Phone number already registered" },
        { status: 400 }
      );
    }

    // Check if user already exists with the same Instagram username (if provided)
    if (instagramUsername) {
      const existingUserByInstagram = await User.findOne({ instagramUsername });
      if (existingUserByInstagram) {
        return NextResponse.json(
          { success: false, message: "Instagram username already registered" },
          { status: 400 }
        );
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      age: age ? parseInt(age.toString()) : undefined,
      gender,
      emergencyContact,
      instagramUsername,
      joinCrew: joinCrew === true,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create a session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    // Set the auth cookie
    response.cookies.set({
      name: "cloka_auth",
      value: user._id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during signup" },
      { status: 500 }
    );
  }
}

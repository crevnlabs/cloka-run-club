import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Trim the password to handle potential whitespace issues
    const trimmedPassword = password.trim();

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Check if password is "NEEDS_RESET" (from migration)
    if (user.password === "NEEDS_RESET") {
      return NextResponse.json(
        { success: false, message: "Password needs to be reset" },
        { status: 401 }
      );
    }

    // Verify password
    try {
      // Try with the original password
      let isMatch = await bcrypt.compare(password, user.password);

      // If that fails, try with the trimmed password
      if (!isMatch) {
        isMatch = await bcrypt.compare(trimmedPassword, user.password);
      }

      // If still no match and the password doesn't look like a bcrypt hash,
      // it might be stored in a different format
      if (!isMatch && !user.password.startsWith("$2")) {
        // For plain text passwords (not recommended but might be the case)
        isMatch =
          password === user.password || trimmedPassword === user.password;

        // If we got a match with plain text, update to bcrypt hash
        if (isMatch) {
          console.log("Updating plain text password to bcrypt hash");
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        }
      }

      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }
    } catch (err) {
      console.error("Error during password comparison:", err);
      return NextResponse.json(
        { success: false, message: "Error verifying credentials" },
        { status: 500 }
      );
    }

    // Create a response with user data (excluding password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const response = NextResponse.json(
      { success: true, message: "Login successful", user: userData },
      { status: 200 }
    );

    // Set the admin auth cookie with the user's ID
    response.cookies.set({
      name: "cloka_admin_auth",
      value: user._id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during login" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    const body = await request.json();
    console.log("Search registration request:", {
      searchTerm: body.searchTerm,
      hasPassword: !!body.password,
      hasPhoneVerification: !!body.phoneVerification,
    });

    const { searchTerm, password, phoneVerification } = body;

    if (!searchTerm) {
      return NextResponse.json(
        { success: false, message: "Search term is required" },
        { status: 400 }
      );
    }

    // Search for registration by email or Instagram username
    const registration = await Registration.findOne({
      $or: [
        { email: searchTerm },
        {
          instagramUsername: searchTerm.startsWith("@")
            ? searchTerm.substring(1)
            : searchTerm,
        },
      ],
    });

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No registration found with this email or Instagram username",
        },
        { status: 404 }
      );
    }

    console.log("Found registration:", {
      id: registration._id.toString(),
      email: registration.email,
      hasPassword: !!registration.password,
    });

    // Handle legacy registrations without passwords
    if (!registration.password) {
      // If no phone verification provided, return a message asking for it
      if (!phoneVerification) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This account requires verification. Please enter your phone number to verify your identity.",
            requiresPhoneVerification: true,
          },
          { status: 403 }
        );
      }

      // Verify that the provided phone number matches the one on record
      if (registration.phone !== phoneVerification) {
        return NextResponse.json(
          {
            success: false,
            message: "The phone number you entered doesn't match our records.",
          },
          { status: 401 }
        );
      }

      // For legacy accounts, we don't set the password here anymore
      // We'll let the user set it explicitly through the update endpoint
      console.log("Legacy account verified with phone number");

      // Return the registration data with a special message
      return NextResponse.json({
        success: true,
        message:
          "Your identity has been verified. Please set a password for your account.",
        isLegacyAccount: true,
        registration: {
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          age: registration.age.toString(),
          gender: registration.gender,
          joinCrew: registration.joinCrew,
          emergencyContact: registration.emergencyContact,
          instagramUsername: registration.instagramUsername || "",
          eventId: registration.eventId?.toString() || "",
          // Don't set a password here - leave it empty for the user to set
          password: "",
        },
        registrationId: registration._id,
      });
    }

    // For accounts with passwords, verify the password
    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      registration.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Return the registration data
    return NextResponse.json({
      success: true,
      message: "Registration found",
      registration: {
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        age: registration.age.toString(),
        gender: registration.gender,
        joinCrew: registration.joinCrew,
        emergencyContact: registration.emergencyContact,
        instagramUsername: registration.instagramUsername || "",
        eventId: registration.eventId?.toString() || "",
        // Don't return acceptTerms - user must accept terms again
      },
      registrationId: registration._id,
    });
  } catch (error) {
    console.error("Error searching for registration:", error);

    return NextResponse.json(
      { success: false, message: "Failed to search for registration" },
      { status: 500 }
    );
  }
}

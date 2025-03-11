import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log("Update registration request:", {
      id: body.registrationId,
      email: body.email,
      hasPassword: !!body.password,
      hasNewPassword: !!body.newPassword,
      isLegacyAccount: !!body.isLegacyAccount,
    });

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
      registrationId,
      newPassword,
      isLegacyAccount,
    } = body;

    // Validate required fields
    if (!registrationId || !email) {
      return NextResponse.json(
        { success: false, message: "Registration ID and email are required" },
        { status: 400 }
      );
    }

    // Find the existing registration
    const registration = await Registration.findOne({
      _id: registrationId,
      email: email,
    });

    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      );
    }

    console.log("Found registration to update:", {
      id: registration._id.toString(),
      email: registration.email,
      hasExistingPassword: !!registration.password,
    });

    // For non-legacy accounts, verify the password
    let passwordUpdated = false;
    if (!isLegacyAccount && registration.password) {
      // Verify the current password
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
    }

    // Check for Instagram username conflicts
    if (instagramUsername) {
      const existingRegistration = await Registration.findOne({
        instagramUsername,
        _id: { $ne: registrationId },
      });

      if (existingRegistration) {
        return NextResponse.json(
          {
            success: false,
            message: "This Instagram username is already registered",
          },
          { status: 400 }
        );
      }
    }

    // Update registration details
    registration.name = name;
    registration.phone = phone;
    registration.age = age;
    registration.gender = gender;
    registration.joinCrew = joinCrew;
    registration.acceptTerms = acceptTerms;
    registration.emergencyContact = emergencyContact;
    registration.instagramUsername = instagramUsername;

    if (eventId) {
      registration.eventId = eventId;
    }

    // Handle password updates
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      registration.password = hashedPassword;
      passwordUpdated = true;

      console.log("Password updated for registration:", {
        id: registration._id.toString(),
        email: registration.email,
        isLegacyAccount,
      });
    }

    // Save the updated registration
    try {
      await registration.save();
      console.log("Registration saved successfully:", {
        id: registration._id.toString(),
        email: registration.email,
        passwordUpdated,
        hasPasswordNow: !!registration.password,
      });
    } catch (error) {
      console.error("Error saving registration:", error);
      return NextResponse.json(
        { success: false, message: "Failed to save registration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: passwordUpdated
        ? "Registration updated with new password"
        : "Registration updated successfully",
      passwordUpdated,
    });
  } catch (error) {
    console.error("Error updating registration:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update registration" },
      { status: 500 }
    );
  }
}

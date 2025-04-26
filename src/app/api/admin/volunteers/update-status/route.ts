import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import dbConnect from "@/lib/mongodb";
import VolunteerApplication from "@/models/Volunteer";
import User from "@/models/User";
import sgMail from "@sendgrid/mail";

interface PopulatedUser {
  name: string;
  email: string;
}

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Check if user is authenticated as admin
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("cloka_auth");

    if (!authCookie || !authCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get user and check if admin
    const user = await User.findById(authCookie.value);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { applicationId, status } = body;

    if (
      !applicationId ||
      !status ||
      !["approved", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    // Find and update the application
    const application = await VolunteerApplication.findById(
      applicationId
    ).populate("userId", "name email");

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    application.status = status;
    await application.save();

    // Send email notification if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      const applicant = application.userId as PopulatedUser;
      const msg = {
        to: applicant.email,
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@cloka.app",
        subject: `Volunteer Application ${
          status === "approved" ? "Approved" : "Not Approved"
        } - Cloka`,
        text: `
Dear ${applicant.name},

Your volunteer application with Cloka has been ${
          status === "approved"
            ? "approved! Welcome to the Cloka volunteer team."
            : "not approved at this time."
        }

${
  status === "approved"
    ? "We will contact you soon with more details about getting started."
    : "Thank you for your interest in volunteering with us. We encourage you to apply again in the future."
}

Best regards,
The Cloka Team
        `,
        html: `
          <p>Dear ${applicant.name},</p>
          
          <p>Your volunteer application with Cloka has been ${
            status === "approved"
              ? "approved! Welcome to the Cloka volunteer team."
              : "not approved at this time."
          }</p>
          
          <p>${
            status === "approved"
              ? "We will contact you soon with more details about getting started."
              : "Thank you for your interest in volunteering with us. We encourage you to apply again in the future."
          }</p>
          
          <p>Best regards,<br>The Cloka Team</p>
        `,
      };

      await sgMail.send(msg);
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      application: {
        _id: application._id,
        status: application.status,
      },
    });
  } catch (error) {
    console.error("Error in update volunteer application status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

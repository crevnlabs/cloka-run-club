import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Partnership from "@/models/Partnership";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      organizationName,
      email,
      phone,
      links,
      cities,
      description,
      collaborationType,
      pastCollaboration,
      collaborationReason,
      additionalInfo,
    } = body;

    // Validate required fields
    if (
      !name ||
      !organizationName ||
      !email ||
      !phone ||
      !links ||
      !cities ||
      !description ||
      !collaborationType
    ) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create new partnership inquiry
    const partnership = await Partnership.create({
      name,
      organizationName,
      email,
      phone,
      links,
      cities,
      description,
      collaborationType,
      pastCollaboration,
      collaborationReason,
      additionalInfo,
    });

    // Only send email if SendGrid API key is configured
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: "support@cloka.in",
        from: process.env.SENDGRID_FROM_EMAIL || "noreply@cloka.app",
        subject: `New Partnership Inquiry - ${organizationName}`,
        text: `
Name: ${name}
Organization: ${organizationName}
Email: ${email}
Phone: ${phone}
Links: ${links}
Cities: ${cities}
Description: ${description}
Collaboration Type: ${collaborationType}
${pastCollaboration ? `Past Collaboration: ${pastCollaboration}` : ""}
${collaborationReason ? `Collaboration Reason: ${collaborationReason}` : ""}
${additionalInfo ? `Additional Info: ${additionalInfo}` : ""}
        `,
        html: `
          <h3>New Partnership Inquiry</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Organization:</strong> ${organizationName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Links:</strong> ${links}</p>
          <p><strong>Cities:</strong> ${cities}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Collaboration Type:</strong> ${collaborationType}</p>
          ${
            pastCollaboration
              ? `<p><strong>Past Collaboration:</strong> ${pastCollaboration}</p>`
              : ""
          }
          ${
            collaborationReason
              ? `<p><strong>Collaboration Reason:</strong> ${collaborationReason}</p>`
              : ""
          }
          ${
            additionalInfo
              ? `<p><strong>Additional Info:</strong> ${additionalInfo}</p>`
              : ""
          }
        `,
      };

      await sgMail.send(msg);
    } else {
      console.warn(
        "SendGrid API key not configured. Partnership inquiry email not sent."
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your partnership inquiry has been submitted successfully",
      partnership: {
        _id: partnership._id,
        name: partnership.name,
        email: partnership.email,
      },
    });
  } catch (error) {
    console.error("Error in partnership inquiry:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during submission" },
      { status: 500 }
    );
  }
}

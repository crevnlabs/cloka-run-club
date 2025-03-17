import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueType, details, contact } = body;

    // Validate input
    if (!issueType || !details) {
      return NextResponse.json(
        { success: false, message: "Issue type and details are required" },
        { status: 400 }
      );
    }

    // Only send email if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured. Contact email not sent.");
      return NextResponse.json(
        { success: false, message: "Email service not configured" },
        { status: 500 }
      );
    }

    const issueTypeMap: { [key: string]: string } = {
      app: "Something with the app",
      community: "Something with the members of the community",
      "during-run": "Something that happened during the run",
      "post-run": "Something that happened post run",
      other: "Everything else",
    };

    const msg = {
      to: "support@cloka.in",
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@cloka.app",
      subject: `Contact Form Submission - ${
        issueTypeMap[issueType] || issueType
      }`,
      text: `Issue Type: ${issueTypeMap[issueType] || issueType}
${contact ? `Contact: ${contact}` : "No contact provided"}

Details:
${details}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Issue Type:</strong> ${
          issueTypeMap[issueType] || issueType
        }</p>
        ${
          contact
            ? `<p><strong>Contact:</strong> ${contact}</p>`
            : "<p><em>No contact provided</em></p>"
        }
        <h4>Details:</h4>
        <p>${details.replace(/\n/g, "<br>")}</p>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (error) {
    console.error("Error in contact form submission:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message" },
      { status: 500 }
    );
  }
}

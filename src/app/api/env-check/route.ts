import { NextResponse } from "next/server";

export async function GET() {
  // Check if environment variables are set
  const adminPasswordSet = !!process.env.ADMIN_PASSWORD;
  const adminAuthTokenSet = !!process.env.ADMIN_AUTH_TOKEN;

  // Return the status without revealing the actual values
  return NextResponse.json({
    adminPasswordSet,
    adminAuthTokenSet,
    nodeEnv: process.env.NODE_ENV || "not set",
  });
}

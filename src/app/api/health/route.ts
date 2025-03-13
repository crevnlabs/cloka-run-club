import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import os from "os";

export async function GET() {
  try {
    // Connect to the database
    await dbConnect();

    // Get database information
    const dbName = process.env.NODE_ENV === "production" ? "cloka" : "cloka";

    // Get MongoDB connection status
    const isConnected = mongoose.connection.readyState === 1;

    // Get system information
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + " GB",
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)) + " GB",
      uptime: Math.round(os.uptime() / 3600) + " hours",
    };

    // Get application information
    const appInfo = {
      nodeEnv: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      appVersion: process.env.npm_package_version || "unknown",
    };

    // Return health status
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: {
        name: dbName,
        connected: isConnected,
        mongooseVersion: mongoose.version,
      },
      system: systemInfo,
      application: appInfo,
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

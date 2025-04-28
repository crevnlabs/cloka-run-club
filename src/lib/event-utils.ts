import dbConnect from "@/lib/mongodb";
import UserEvent from "@/models/UserEvent";
import { cookies } from "next/headers";

/**
 * Check if a user is registered for an event
 * @param eventId The ID of the event to check
 * @returns An object containing registration status and approval status
 */
export async function checkEventRegistration(eventId: string) {
  try {
    await dbConnect();

    // Get the auth cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("cloka_auth");

    if (!authCookie || !authCookie.value) {
      return { isRegistered: false, isApproved: null };
    }

    const userId = authCookie.value;

    // Find the registration
    const userEvent = await UserEvent.findOne({ userId, eventId });

    if (!userEvent) {
      return { isRegistered: false, isApproved: null };
    }

    return {
      isRegistered: true,
      isApproved: userEvent.approved,
      registrationId: userEvent._id,
    };
  } catch (error) {
    console.error("Error checking event registration:", error);
    return { isRegistered: false, isApproved: null };
  }
}

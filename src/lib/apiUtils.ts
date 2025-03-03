/**
 * Utility functions for API requests
 */

/**
 * Constructs a valid URL for API requests that works in both client and server environments
 *
 * @param endpoint - The API endpoint path (e.g., '/api/events')
 * @returns A properly formatted URL string
 */
export function getApiUrl(endpoint: string): string {
  // Make sure the endpoint starts with a slash
  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }

  // If the environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
  }

  // For client-side rendering, we can use a relative URL
  if (typeof window !== "undefined") {
    return endpoint;
  }

  // For server-side rendering, we need an absolute URL
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host = process.env.VERCEL_URL || "localhost:3000";
  return `${protocol}://${host}${endpoint}`;
}

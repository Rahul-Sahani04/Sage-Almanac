/**
 * Server-side utility functions for Convex
 * Used by Convex mutations and queries (Node.js environment)
 */

/**
 * Generate a cryptographically random URL-safe token
 */
export function generateToken(length: number = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

/**
 * Hash a token with the server salt using SHA-256
 */
export async function hashToken(rawToken: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawToken + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Get today's date as YYYY-MM-DD string in UTC
 */
export function todayISO(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

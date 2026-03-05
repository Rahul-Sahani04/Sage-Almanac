/**
 * Client-side date utilities
 */

/**
 * Get today's date as YYYY-MM-DD in UTC
 */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get the number of days in a given month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Get the day of the week for the first day of a month (0 = Sun, 6 = Sat)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Format a YYYY-MM-DD date string for display
 */
export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
  });
}

/**
 * Check if a date string is today (UTC)
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayISO();
}

/**
 * Check if a date string is in the past (UTC)
 */
export function isPast(dateStr: string): boolean {
  return dateStr < todayISO();
}

/**
 * Build a YYYY-MM-DD string from components
 */
export function buildDateStr(
  year: number,
  month: number,
  day: number
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

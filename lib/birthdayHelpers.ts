// lib/birthdayHelpers.ts

export const TARGET_CALENDAR_ID = "j578ma6e39b0kjbx1g5yjgvg9s82f5kv";

/**
 * Checks if today is the correct day (April 7) and the correct calendar.
 * Uses local timezone to ensure it triggers when it is April 7 for the user.
 */
export function checkIsAleenaBirthday(calendarId: string): boolean {
    if (calendarId !== TARGET_CALENDAR_ID) return false;

    const today = new Date();
    const month = today.getMonth(); // 0-indexed, April is 3
    const date = today.getDate();

    console.log(month, date);

    return month === 2 && date === 7;
}

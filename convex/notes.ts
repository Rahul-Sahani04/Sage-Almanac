import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveUser } from "./authUtils";

/**
 * Add a note to a calendar for a specific day.
 * Enforces: auth, participant check, date === today (UTC).
 */
export const addNote = mutation({
  args: {
    calendarId: v.id("calendars"),
    content: v.string(),
    date: v.string(), // YYYY-MM-DD
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    // Validate content
    const content = args.content.trim();
    if (!content) throw new Error("Note content cannot be empty");
    if (content.length > 2000) throw new Error("Note content too long (max 2000 chars)");

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();

    if (!participant) throw new Error("Not a participant of this calendar");

    // Enforce: date must be approximately today (±1.5 day tolerance for timezones)
    // Users in UTC-12 to UTC+14 may have a different local date than the server's UTC.
    const serverUtcDate = new Date();
    const targetDate = new Date(args.date + "T12:00:00Z");
    const diffDays = Math.abs(
      (serverUtcDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 1.5) {
      throw new Error("Notes can only be added for your local today");
    }

    // Rate limit: max 10 notes per day per user
    const todayNotes = await ctx.db
      .query("notes")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", args.date)
      )
      .collect();

    const userNotesToday = todayNotes.filter(
      (n) => n.participantId === participant._id
    );
    if (userNotesToday.length >= 10) {
      throw new Error("Maximum notes per day reached (10)");
    }

    return await ctx.db.insert("notes", {
      calendarId: args.calendarId,
      participantId: participant._id,
      authorName: participant.displayName,
      date: args.date,
      content,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get month view aggregates for rendering the calendar grid.
 * Returns { date, noteCount } for each day that has notes.
 */
export const getMonthView = query({
  args: {
    calendarId: v.id("calendars"),
    year: v.number(),
    month: v.number(), // 1-12
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return [];

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();

    if (!participant) return [];

    // Use bounded index range to load only the requested month's notes
    const startBound = `${args.year}-${String(args.month).padStart(2, "0")}-00`;
    const nextMonth = args.month === 12 ? 1 : args.month + 1;
    const nextYear = args.month === 12 ? args.year + 1 : args.year;
    const endBound = `${nextYear}-${String(nextMonth).padStart(2, "0")}-00`;

    const monthNotes = await ctx.db
      .query("notes")
      .withIndex("by_calendar_date", (q) =>
        q
          .eq("calendarId", args.calendarId)
          .gte("date", startBound)
          .lt("date", endBound)
      )
      .collect();

    // Aggregate by day
    const dayMap = new Map<string, { noteCount: number; authors: Set<string> }>();
    for (const note of monthNotes) {
      const existing = dayMap.get(note.date) || { noteCount: 0, authors: new Set<string>() };
      existing.noteCount++;
      existing.authors.add(note.authorName);
      dayMap.set(note.date, existing);
    }

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      noteCount: data.noteCount,
      authors: Array.from(data.authors),
    }));
  },
});

/**
 * Get all notes for a specific day, sorted by creation time.
 */
export const getDayNotes = query({
  args: {
    calendarId: v.id("calendars"),
    date: v.string(), // YYYY-MM-DD
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return [];

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();

    if (!participant) return [];

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", args.date)
      )
      .collect();

    // Sort by createdAt ascending
    return notes.sort((a, b) => a.createdAt - b.createdAt);
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { todayISO } from "./utils";

/**
 * Add a note to a calendar for a specific day.
 * Enforces: auth, participant check, date === today (UTC).
 */
export const addNote = mutation({
  args: {
    calendarId: v.id("calendars"),
    content: v.string(),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Validate content
    const content = args.content.trim();
    if (!content) throw new Error("Note content cannot be empty");
    if (content.length > 2000) throw new Error("Note content too long (max 2000 chars)");

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", identity.subject)
      )
      .first();

    if (!participant) throw new Error("Not a participant of this calendar");

    // Enforce: date must be today (UTC)
    const today = todayISO();
    if (args.date !== today) {
      throw new Error("Notes can only be added for today");
    }

    // Rate limit: max 10 notes per day per user
    const todayNotes = await ctx.db
      .query("notes")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", today)
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", identity.subject)
      )
      .first();

    if (!participant) return [];

    // Get all notes for this calendar
    const allNotes = await ctx.db
      .query("notes")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();

    // Filter to the requested month
    const monthPrefix = `${args.year}-${String(args.month).padStart(2, "0")}`;
    const monthNotes = allNotes.filter((n) => n.date.startsWith(monthPrefix));

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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Verify participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", identity.subject)
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

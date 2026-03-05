import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateToken, hashToken } from "./utils";

const SERVER_SALT = process.env.SERVER_SALT ?? "c-aleena-default-salt";

/**
 * Create a new calendar — returns the calendar ID and raw invite token (shown once).
 */
export const createCalendar = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("=== AUTH DEBUG ===");
    console.log("Identity from ctx.auth:", identity);
    if (!identity) throw new Error("Unauthenticated (no valid Clerk JWT matching Convex config found)");

    const userId = identity.subject;
    const rawToken = generateToken(16);
    const tokenHash = await hashToken(rawToken, SERVER_SALT);

    const calendarId = await ctx.db.insert("calendars", {
      ownerId: userId,
      title: "Shared Journal",
      inviteTokenHash: tokenHash,
      inviteExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      maxParticipants: 2,
      createdAt: Date.now(),
    });

    // Auto-add creator as first participant
    await ctx.db.insert("participants", {
      calendarId,
      userId,
      displayName: args.displayName,
      joinedAt: Date.now(),
    });

    return { calendarId, rawToken };
  },
});

/**
 * Get calendar details (requires participant access).
 */
export const getCalendar = query({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) return null;

    // Verify user is a participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", identity.subject)
      )
      .first();

    if (!participant) return null;

    return {
      _id: calendar._id,
      title: calendar.title,
      ownerId: calendar.ownerId,
      createdAt: calendar.createdAt,
      hasInviteToken: !!calendar.inviteTokenHash,
      maxParticipants: calendar.maxParticipants,
    };
  },
});

/**
 * List all calendars the current user participates in.
 */
export const listMyCalendars = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const calendars = await Promise.all(
      participations.map(async (p) => {
        const calendar = await ctx.db.get(p.calendarId);
        if (!calendar) return null;

        const allParticipants = await ctx.db
          .query("participants")
          .withIndex("by_calendar", (q) => q.eq("calendarId", p.calendarId))
          .collect();

        return {
          _id: calendar._id,
          title: calendar.title,
          isOwner: calendar.ownerId === identity.subject,
          createdAt: calendar.createdAt,
          participantCount: allParticipants.length,
          participants: allParticipants.map((ap) => ({
            displayName: ap.displayName,
            joinedAt: ap.joinedAt,
          })),
        };
      })
    );

    return calendars.filter(Boolean);
  },
});

/**
 * Delete a calendar (owner only).
 */
export const deleteCalendar = mutation({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) throw new Error("Calendar not found");
    if (calendar.ownerId !== identity.subject) throw new Error("Not authorized");

    // Delete all notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();
    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    // Delete all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();
    for (const participant of participants) {
      await ctx.db.delete(participant._id);
    }

    // Delete the calendar
    await ctx.db.delete(args.calendarId);

    return { success: true };
  },
});

/**
 * Regenerate invite token (owner only).
 */
export const regenerateInviteToken = mutation({
  args: { calendarId: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) throw new Error("Calendar not found");
    if (calendar.ownerId !== identity.subject) throw new Error("Not the owner");

    // Check if calendar already has max participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();

    if (participants.length >= calendar.maxParticipants) {
      throw new Error("Calendar already has maximum participants");
    }

    const rawToken = generateToken(16);
    const tokenHash = await hashToken(rawToken, SERVER_SALT);

    await ctx.db.patch(args.calendarId, {
      inviteTokenHash: tokenHash,
      inviteExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { rawToken };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { generateToken, hashToken } from "./utils";
import { resolveUser } from "./authUtils";

const SERVER_SALT = process.env.SERVER_SALT ?? "Sage-Almanac-default-salt";

/**
 * Create a new calendar — returns the calendar ID and raw invite token (shown once).
 */
export const createCalendar = mutation({
  args: {
    partnerName: v.string(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated. You must be logged in to create a journal.");
    const userId = identity.subject;
    const creatorName = identity.givenName || identity.name || "Creator";

    const rawToken = generateToken(16);
    const tokenHash = await hashToken(rawToken, SERVER_SALT);

    let passwordHash = undefined;
    if (args.password) {
      passwordHash = await hashToken(args.password, SERVER_SALT);
    }

    const calendarId = await ctx.db.insert("calendars", {
      ownerId: userId,
      title: "Shared Journal",
      inviteTokenHash: tokenHash,
      inviteExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      passwordHash,
      partnerName: args.partnerName,
      maxParticipants: 2,
      createdAt: Date.now(),
    });

    await ctx.db.insert("participants", {
      calendarId,
      userId,
      displayName: creatorName,
      joinedAt: Date.now(),
    });

    return { calendarId, rawToken };
  },
});

/**
 * Get calendar details (requires participant access).
 */
export const getCalendar = query({
  args: { calendarId: v.id("calendars"), anonymousId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return null;

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) return null;

    // Verify user is a participant
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();

    if (!participant) return null;

    return {
      _id: calendar._id,
      title: calendar.title,
      ownerId: calendar.ownerId,
      createdAt: calendar.createdAt,
      hasInviteToken: !!calendar.inviteTokenHash,
      isPasswordProtected: !!calendar.passwordHash,
      maxParticipants: calendar.maxParticipants,
    };
  },
});

/**
 * List all calendars the current user participates in.
 */
export const listMyCalendars = query({
  args: { anonymousId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return [];

    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
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
          isOwner: calendar.ownerId === userId,
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
  args: { calendarId: v.id("calendars"), anonymousId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) throw new Error("Calendar not found");
    if (calendar.ownerId !== userId) throw new Error("Not authorized");

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
  args: { calendarId: v.id("calendars"), anonymousId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) throw new Error("Calendar not found");
    if (calendar.ownerId !== userId) throw new Error("Not the owner");

    const rawToken = generateToken(16);
    const tokenHash = await hashToken(rawToken, SERVER_SALT);

    await ctx.db.patch(args.calendarId, {
      inviteTokenHash: tokenHash,
      inviteExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return { rawToken };
  },
});

/**
 * Get basic info about a calendar invite token (for the join screen).
 */
export const getInviteInfo = query({
  args: { rawToken: v.string() },
  handler: async (ctx, args) => {
    const tokenHash = await hashToken(args.rawToken, SERVER_SALT);
    const calendar = await ctx.db
      .query("calendars")
      .withIndex("by_invite_token", (q) => q.eq("inviteTokenHash", tokenHash))
      .first();

    if (!calendar) return null;

    if (calendar.inviteExpiresAt && calendar.inviteExpiresAt < Date.now()) {
      return null;
    }

    return {
      partnerName: calendar.partnerName || "Guest",
      requiresPassword: !!calendar.passwordHash,
    };
  },
});

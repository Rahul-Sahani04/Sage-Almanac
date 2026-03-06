import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashToken } from "./utils";
import { resolveUser } from "./authUtils";

const SERVER_SALT = process.env.SERVER_SALT ?? "c-aleena-default-salt";

/**
 * Join a calendar using an invite token.
 * Hash the raw token and compare against stored hash.
 * Enforce max participant limit and single-use token.
 */
export const joinCalendar = mutation({
  args: {
    rawToken: v.string(),
    displayName: v.string(),
    anonymousId: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");
    const tokenHash = await hashToken(args.rawToken, SERVER_SALT);

    // Find calendar by token hash
    const calendars = await ctx.db.query("calendars").collect();
    const calendar = calendars.find(
      (c) => c.inviteTokenHash === tokenHash
    );

    if (!calendar) throw new Error("Invalid or expired invite token");

    // Check expiration
    if (calendar.inviteExpiresAt && calendar.inviteExpiresAt < Date.now()) {
      throw new Error("Invite token has expired");
    }

    // Check password if required
    if (calendar.passwordHash) {
      if (!args.password) {
        return { passwordRequired: true };
      }
      const providedHash = await hashToken(args.password, SERVER_SALT);
      if (providedHash !== calendar.passwordHash) {
        throw new Error("Incorrect password");
      }
    }

    // Check if user is already a participant
    const existingParticipant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", calendar._id).eq("userId", userId)
      )
      .first();

    if (existingParticipant) {
      return {
        calendarId: calendar._id,
        participantId: existingParticipant._id,
        alreadyJoined: true,
      };
    }

    // Check participant count
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
      .collect();

    if (participants.length >= calendar.maxParticipants) {
      throw new Error("Calendar already has the maximum number of participants");
    }

    // Create participant
    const participantId = await ctx.db.insert("participants", {
      calendarId: calendar._id,
      userId,
      displayName: args.displayName,
      joinedAt: Date.now(),
    });

    // Consume token (single-use)
    await ctx.db.patch(calendar._id, {
      inviteTokenHash: null,
      inviteExpiresAt: null,
    });

    return {
      calendarId: calendar._id,
      participantId,
      alreadyJoined: false,
    };
  },
});

/**
 * Get all participants for a calendar.
 */
export const getParticipants = query({
  args: { calendarId: v.id("calendars"), anonymousId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return [];

    // Verify requester is a participant
    const isParticipant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();

    if (!isParticipant) return [];

    return await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();
  },
});

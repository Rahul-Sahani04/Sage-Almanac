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
    anonymousId: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");
    const tokenHash = await hashToken(args.rawToken, SERVER_SALT);

    // Find calendar by token hash using index (no full table scan)
    const calendar = await ctx.db
      .query("calendars")
      .withIndex("by_invite_token", (q) => q.eq("inviteTokenHash", tokenHash))
      .first();

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

    // Check participant count — reject if full (no silent takeover)
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
      .collect();

    if (participants.length >= calendar.maxParticipants) {
      if (calendar.ownerId !== userId) {
        // If the journal is full, and the user joining is not the owner,
        // we assume the owner explicitly reshared the link because the partner lost access.
        // Re-assign the partner slot.
        const nonOwnerParticipant = participants.find((p) => p.userId !== calendar.ownerId);

        if (nonOwnerParticipant) {
          await ctx.db.patch(nonOwnerParticipant._id, {
            userId,
          });

          // Consume token (single-use)
          await ctx.db.patch(calendar._id, {
            inviteTokenHash: null,
            inviteExpiresAt: null,
          });

          return {
            calendarId: calendar._id,
            participantId: nonOwnerParticipant._id,
            alreadyJoined: false,
          };
        }
      }
      throw new Error("Calendar already has the maximum number of participants");
    }

    // Create participant
    const participantId = await ctx.db.insert("participants", {
      calendarId: calendar._id,
      userId,
      displayName: calendar.partnerName || "Guest",
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
 * Remove a participant from a calendar (owner only).
 * Frees up a slot so the owner can invite a new partner.
 */
export const removeParticipant = mutation({
  args: {
    calendarId: v.id("calendars"),
    participantId: v.id("participants"),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar) throw new Error("Calendar not found");
    if (calendar.ownerId !== userId) throw new Error("Only the calendar owner can remove participants");

    const participant = await ctx.db.get(args.participantId);
    if (!participant) throw new Error("Participant not found");
    if (participant.calendarId !== args.calendarId) throw new Error("Participant does not belong to this calendar");
    if (participant.userId === userId) throw new Error("Owner cannot remove themselves");

    // Delete the participant's notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();

    const participantNotes = notes.filter((n) => n.participantId === args.participantId);
    for (const note of participantNotes) {
      await ctx.db.delete(note._id);
    }

    // Delete the participant
    await ctx.db.delete(args.participantId);

    return { success: true };
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

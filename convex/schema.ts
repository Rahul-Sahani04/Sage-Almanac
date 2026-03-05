import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  calendars: defineTable({
    ownerId: v.string(),
    title: v.optional(v.string()),
    inviteTokenHash: v.optional(v.union(v.string(), v.null())),
    inviteExpiresAt: v.optional(v.union(v.number(), v.null())),
    maxParticipants: v.number(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"]),

  participants: defineTable({
    calendarId: v.id("calendars"),
    userId: v.string(),
    displayName: v.string(),
    joinedAt: v.number(),
  })
    .index("by_calendar", ["calendarId"])
    .index("by_user", ["userId"])
    .index("by_calendar_user", ["calendarId", "userId"]),

  notes: defineTable({
    calendarId: v.id("calendars"),
    participantId: v.id("participants"),
    authorName: v.string(),
    date: v.string(), // YYYY-MM-DD in UTC
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_calendar_date", ["calendarId", "date"])
    .index("by_calendar", ["calendarId"]),
});

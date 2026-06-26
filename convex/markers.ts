import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveUser } from "./authUtils";

export const setMarker = mutation({
  args: {
    calendarId: v.id("calendars"),
    date: v.string(),
    label: v.string(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();
    if (!participant) throw new Error("Not a participant");

    const label = args.label.trim().slice(0, 40);
    if (!label) throw new Error("Label cannot be empty");

    const existing = await ctx.db
      .query("markers")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { label, createdBy: userId, createdAt: Date.now() });
    } else {
      await ctx.db.insert("markers", {
        calendarId: args.calendarId,
        date: args.date,
        label,
        createdBy: userId,
        createdAt: Date.now(),
      });
    }
  },
});

export const removeMarker = mutation({
  args: {
    calendarId: v.id("calendars"),
    date: v.string(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) throw new Error("Unauthenticated");

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();
    if (!participant) throw new Error("Not a participant");

    const existing = await ctx.db
      .query("markers")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", args.date)
      )
      .first();

    if (existing) await ctx.db.delete(existing._id);
  },
});

export const getMarkersForMonth = query({
  args: {
    calendarId: v.id("calendars"),
    year: v.number(),
    month: v.number(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return [];

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();
    if (!participant) return [];

    const startBound = `${args.year}-${String(args.month).padStart(2, "0")}-00`;
    const nextMonth = args.month === 12 ? 1 : args.month + 1;
    const nextYear = args.month === 12 ? args.year + 1 : args.year;
    const endBound = `${nextYear}-${String(nextMonth).padStart(2, "0")}-00`;

    return await ctx.db
      .query("markers")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).gte("date", startBound).lt("date", endBound)
      )
      .collect();
  },
});

export const getMarkerForDay = query({
  args: {
    calendarId: v.id("calendars"),
    date: v.string(),
    anonymousId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveUser(ctx, args.anonymousId);
    if (!userId) return null;

    const participant = await ctx.db
      .query("participants")
      .withIndex("by_calendar_user", (q) =>
        q.eq("calendarId", args.calendarId).eq("userId", userId)
      )
      .first();
    if (!participant) return null;

    return await ctx.db
      .query("markers")
      .withIndex("by_calendar_date", (q) =>
        q.eq("calendarId", args.calendarId).eq("date", args.date)
      )
      .first();
  },
});

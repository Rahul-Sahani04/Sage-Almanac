import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const getPartnerInfo = internalQuery({
  args: {
    calendarId: v.id("calendars"),
    authorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_calendar", (q) => q.eq("calendarId", args.calendarId))
      .collect();
    const partner = participants.find((p) => p.userId !== args.authorUserId);
    if (!partner || partner.userId.startsWith("anon_")) return null;
    return { userId: partner.userId, displayName: partner.displayName };
  },
});

// ponytail: full calendar scan — fine at small scale, add a date-indexed notes view if this lags
export const getAtRiskStreaks = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const allCalendars = await ctx.db.query("calendars").collect();
    const results: { missingUserId: string; writerName: string }[] = [];

    for (const calendar of allCalendars) {
      const participants = await ctx.db
        .query("participants")
        .withIndex("by_calendar", (q) => q.eq("calendarId", calendar._id))
        .collect();
      if (participants.length < 2) continue;

      const todayNotes = await ctx.db
        .query("notes")
        .withIndex("by_calendar_date", (q) =>
          q.eq("calendarId", calendar._id).eq("date", args.date)
        )
        .collect();

      const writerIds = new Set(todayNotes.map((n) => String(n.participantId)));
      const writers = participants.filter((p) => writerIds.has(String(p._id)));
      const nonWriters = participants.filter((p) => !writerIds.has(String(p._id)));

      if (writers.length === 1 && nonWriters.length === 1) {
        const missing = nonWriters[0];
        if (!missing.userId.startsWith("anon_")) {
          results.push({ missingUserId: missing.userId, writerName: writers[0].displayName });
        }
      }
    }
    return results;
  },
});

async function fetchClerkEmail(userId: string): Promise<string | null> {
  const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user.email_addresses?.[0]?.email_address ?? null;
}

async function sendEmail(to: string, subject: string, html: string) {
  // ponytail: replace "onboarding@resend.dev" with your verified domain in production
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Kaze Journal <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
}

export const notifyPartner = internalAction({
  args: {
    calendarId: v.id("calendars"),
    authorName: v.string(),
    date: v.string(),
    authorUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.runQuery(internal.notifications.getPartnerInfo, {
      calendarId: args.calendarId,
      authorUserId: args.authorUserId,
    });
    if (!partner) return;

    const email = await fetchClerkEmail(partner.userId);
    if (!email) return;

    await sendEmail(
      email,
      `${args.authorName} wrote in your journal`,
      `<p><strong>${args.authorName}</strong> added an entry for ${args.date}.</p><p>Head over to write yours!</p>`
    );
  },
});

export const sendStreakReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const atRisk = await ctx.runQuery(internal.notifications.getAtRiskStreaks, { date: today });

    for (const { missingUserId, writerName } of atRisk) {
      const email = await fetchClerkEmail(missingUserId);
      if (!email) continue;
      await sendEmail(
        email,
        "Don't break your streak — write today!",
        `<p><strong>${writerName}</strong> already wrote today. Don't let your streak slip!</p>`
      );
    }
  },
});

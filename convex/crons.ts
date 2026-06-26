import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 8pm IST = 14:30 UTC
crons.daily(
  "streak reminder",
  { hourUTC: 14, minuteUTC: 30 },
  internal.notifications.sendStreakReminders,
  {}
);

export default crons;

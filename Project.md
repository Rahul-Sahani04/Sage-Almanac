# C-Aleena [Shared Daily Calendar] — Project Guide

**Purpose**
A private, two-person shared calendar where each day acts as an append-only note container. Users can add notes for *today* only. After the day ends, notes become immutable and remain viewable. Calendar pages are accessible via a private share code / invite token.

---

## Quick overview

* **Frontend:** Next.js (TypeScript, App Router), React, Tailwind CSS, Framer Motion (animations)
* **Backend:** Convex (DB + serverless functions + real-time sync)
* **Auth / Access:** Convex auth + invite tokens (one-time reveal secret) + participant records
* **Main constraints:** exactly **2 participants per calendar**; notes only editable/creatable on the current date; past days read-only

---

## Goals / MVP

1. Create calendar (owner creates and receives a single-use share token).
2. Join calendar with share token (second user).
3. Month view with day cells (dot when any note exists).
4. Add notes for the current day only (each participant may add one or multiple notes — configurable).
5. Past days are view-only and locked.
6. Share / revoke invite token, basic security and access checks.

---

## High-level flow

1. **Create**: User A creates calendar → server creates `calendar` row and generates `inviteToken` (raw token returned one time). The token is hashed and stored.
2. **Share**: User A sends token (URL or 8-char code) to User B.
3. **Join**: User B hits `joinCalendar(token, name)` → server verifies token (compare hash), creates `participant` row, invalidates token.
4. **Daily use**: On any day, both users can `addNote(calendarId, date, content)` if `date === today` and they are a participant.
5. **Lock**: Server mutations reject writes where `date < today` or if calendar already has two participants and the requester is not listed.

---

## Data model (Convex tables)

Use clear, minimal tables. Keep IDs as Convex-generated ids or UUIDs.

### calendars

* `id` (primary)
* `ownerId` (auth user id)
* `createdAt` (timestamp)
* `title` (optional)
* `inviteTokenHash` (string | null) — hash of the raw token if still valid
* `inviteExpiresAt` (timestamp | null)
* `maxParticipants` (number) — default 2

### participants

* `id`
* `calendarId`
* `userId` (auth id)
* `displayName`
* `joinedAt`

Constraints: `participants` per `calendarId` <= `maxParticipants` (enforce in join function)

### notes

* `id`
* `calendarId`
* `participantId` (optional — link to participants table)
* `authorName` (store display name or free-text for anonymized sharing)
* `date` (YYYY-MM-DD string)
* `content` (string)
* `createdAt` (timestamp)

Important: do **not** store `editable: true` for the date after the day passes — enforce immutability by rejecting mutations server-side.

---

## Convex server-side logic (functions)

Implement all access and validation on Convex functions — never trust the client.

### `createCalendar({ title })`

* Requires authenticated user.
* Create a `calendar` row with `ownerId`.
* Generate `rawToken = randomToken()` (12–18 chars, url-safe).
* Store `inviteTokenHash = sha256(rawToken + SERVER_SALT)`.
* Return `{ calendarId, rawToken }` to caller. **Important**: rawToken shown only once.

### `joinCalendar({ token, displayName })`

* Hash token with same salt, find calendar where `inviteTokenHash === hash` and `inviteExpiresAt` not passed.
* Verify participants count < `maxParticipants`.
* Create a `participant` row (`userId` from auth and `displayName`).
* Remove or null `inviteTokenHash` (single-use) or keep if you want multi-use.
* Return calendar info & participants.

### `addNote({ calendarId, content, date })`

* Verify user is authenticated and is participant for `calendarId`.
* Ensure `date === today` (server uses server timestamp and the calendar's timezone or UTC; decide timezone policy and document it).
* Insert `note` row with `participantId`, `authorName`, `createdAt`.
* Optionally emit a realtime update (Convex does this automatically for queries).

### `getMonthView({ calendarId, year, month })`

* Return day-level aggregates: `{ date, noteCount, participants }` for rendering.

### `getDayNotes({ calendarId, date })`

* Return list of notes for that day sorted by createdAt.
* If `date < today`, it's read-only client-side but server-side simply returns rows.

### `deleteNote` / `editNote`

* Do not implement edit/delete for `date < today`.
* If you support `edit` same-day, allow mutation if `createdAt` is today and author matches.
* Prefer append-only: give each user a single daily entry to simplify.

---

## Security

Server-side checks are primary. On the frontend, hide UI actions for which the user lacks permission — this is a UX convenience only.

### Authentication

* Use Convex's built-in auth if available (e.g., OAuth providers). Alternatively, integrate NextAuth or Magic.link and pass the user's id to Convex.
* Always check `ctx.auth.userId` inside Convex functions.

### Invite token safety

* Reveal the **raw token only once** at calendar creation.
* Store only `sha256(rawToken + SERVER_SALT)` in DB. Use a server-side environment variable `SERVER_SALT`.
* Recommend: expire tokens after 7 days or allow manual revoke.

### Authorization checks (must exist in every mutation)

* `isParticipant(userId, calendarId)` → lookup participants table.
* `isOwner(userId, calendarId)` when changing calendar-level settings.

### Immutability enforcement

* In `addNote` / `editNote` functions check `if (date < today) throw new Error('locked')`.
* Use date comparison with timezone rules defined in app (prefer storing dates in UTC and comparing against UTC 'today').

### Rate-limiting and abuse

* Prevent brute-force token guessing: track failed join attempts per IP or per user in Convex or edge function and temporarily block.
* Limit note creation frequency if allowing multiple notes (e.g., 10/day per user).

---

## Share / Access patterns

Two models:

1. **Invite-code model (recommended)**

   * Creator receives raw token and shares it (e.g., `app.com/join/ABCD-1234`).
   * Joining consumes the token.

2. **Link-with-secret model**

   * Link includes token in query param (e.g., `app.com/c/abcd?key=rawToken`).
   * Same verification on server.

Either model uses `inviteTokenHash` in DB and verifies hash equality on join.

---

## Frontend architecture (Next.js + TypeScript)

Folder structure (suggestion):

```
/app
  /(auth)
    layout.tsx        -- auth wrapper
  /calendar
    page.tsx          -- calendar month view (SSR or client component)
    [id]
      page.tsx        -- calendar page with grid
      day/[date]
        page.tsx      -- day modal / route
/components
  CalendarGrid.tsx
  DayCell.tsx
  DayModal.tsx
  NoteList.tsx
  NoteInput.tsx
/lib
  convex.ts           -- convex client instance
/styles
  globals.css         -- tailwind imports
```

### Data fetching strategy

* Use Convex `useQuery` for realtime month/day queries.
* For mutations use Convex `useMutation`.
* Preload the current month on page load for snappy UX.

### UI behavior

* Highlight "today" cell and show an input box only inside the day modal when `date === today` and user is participant.
* For past days, show notes list with no input.
* Display participant names in header.

---

## Example client-side code snippets (concept)

```ts
// lib/convex.ts
import { ConvexProvider, ConvexReactClient } from "convex/react";
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export default convex;
```

```tsx
// components/NoteInput.tsx
import { useMutation } from "convex/react";
export default function NoteInput({ calendarId, date }){
  const addNote = useMutation("addNote");
  const [val, setVal] = useState("");
  const submitting = useRef(false);
  const onSubmit = async () => {
    if (!val.trim()) return;
    submitting.current = true;
    await addNote({ calendarId, content: val, date });
    setVal("");
    submitting.current = false;
  }
  return (
    <div>
      <textarea value={val} onChange={e=>setVal(e.target.value)} />
      <button onClick={onSubmit}>Send</button>
    </div>
  );
}
```

> Note: wrap network errors and show friendly toast messages. Disable button during mutation.

---

## Server-side Convex function examples (pseudocode)

```ts
// functions/createCalendar.ts
export async function createCalendar(ctx, { title }) {
  const userId = ctx.auth.userId;
  if (!userId) throw new Error("unauthenticated");
  const rawToken = randomToken(12); // alphanumeric
  const tokenHash = sha256(rawToken + process.env.SERVER_SALT);
  const calendar = await ctx.db.insert("calendars", {
    ownerId: userId,
    title,
    inviteTokenHash: tokenHash,
    inviteExpiresAt: Date.now() + 7*24*60*60*1000,
    createdAt: Date.now()
  });
  return { calendarId: calendar._id, rawToken };
}

// functions/joinCalendar.ts
export async function joinCalendar(ctx, { rawToken, displayName }){
  const userId = ctx.auth.userId;
  if (!userId) throw new Error("unauthenticated");
  const tokenHash = sha256(rawToken + process.env.SERVER_SALT);
  const calendar = await ctx.db.query("calendars").filter({ inviteTokenHash: tokenHash }).first();
  if (!calendar) throw new Error("invalid token");
  const participants = await ctx.db.query("participants").filter({ calendarId: calendar._id }).all();
  if (participants.length >= calendar.maxParticipants) throw new Error("full");
  const participant = await ctx.db.insert("participants", { calendarId: calendar._id, userId, displayName, joinedAt: Date.now() });
  // consume token
  await ctx.db.update(calendar._id, { inviteTokenHash: null });
  return { participantId: participant._id };
}

// functions/addNote.ts
export async function addNote(ctx, { calendarId, content, date }){
  const userId = ctx.auth.userId;
  if (!userId) throw new Error("unauthenticated");
  const participant = await ctx.db.query("participants").filter({ calendarId, userId }).first();
  if (!participant) throw new Error("not a participant");
  if (date < todayISO()) throw new Error("locked");
  return await ctx.db.insert("notes", { calendarId, participantId: participant._id, authorName: participant.displayName, date, content, createdAt: Date.now() });
}
```

---

## Date / timezone policy (important)

Pick one and document it clearly.

Options:

* **UTC canonical**: store `date` as `YYYY-MM-DD` in UTC. Simpler, consistent across users. Good if participants are in different timezones.
* **Calendar-local**: allow calendar to have a timezone setting and calculate `today` relative to that timezone. More work but matches human expectation for couples in the same region.

Recommendation: start with UTC to avoid edge cases, then add calendar timezone if needed.

---

## UX details & animations

* Use a subtle scale + fade for DayModal open/close (Framer Motion).
* Dot indicators for days with notes animate in with a spring effect when notes appear.
* For adding a note: briefly flash a "saved" micro-interaction (small confetti or checkmark) — keep it light.
* Accessibility: ensure keyboard navigation across the grid and focus trap inside DayModal.

---

## Edge cases & decisions

* **Single-entry vs multiple-notes**: Single-entry per day per user is simpler and encourages intention; multiple notes are more flexible. Pick one for MVP.
* **Accountless participants**: if you want to allow participants without accounts, you must rely entirely on invite token + ephemeral `participantId` stored in a cookie. This reduces security and makes revocation harder. Prefer requiring auth.
* **Revoking access**: owner should be able to remove a participant and optionally generate a new token.
* **Backfill / migration**: if you allow edits within the same day, consider soft-deletes and audit logs.

---

## Testing & QA

* Unit test Convex functions with simulated `ctx.auth` and DB.
* Integration test flows: create -> join -> addNote -> view month -> view day.
* Browser tests for month navigation, mobile responsiveness, and animation performance.

---

## Deployment & env

* Convex project config with production and staging.
* Next.js deployed to Vercel.
* Env vars:

  * `NEXT_PUBLIC_CONVEX_URL`
  * `CONVEX_ROOT_TOKEN` (server-side)
  * `SERVER_SALT`

---

## Future features (post-MVP)

* Photo attachments to daily notes (S3 / signed URLs).
* Daily prompts or questions.
* "On this day" memory emails or in-app reminders.
* Read-only public archive view with optional privacy toggles.
* Analytics (streaks, days with notes, shared moments heatmap).

---

## Appendix: Utilities

* `randomToken(len)` — use crypto random bytes -> base62.
* `sha256(s)` — use Node `crypto.createHash('sha256')` or Web Crypto on edge functions.
* `todayISO()` — canonical `YYYY-MM-DD` builder from UTC date.

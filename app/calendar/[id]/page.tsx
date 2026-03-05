"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import CalendarGrid from "@/components/CalendarGrid";
import DayModal from "@/components/DayModal";
import NoteList from "@/components/NoteList";
import NoteInput from "@/components/NoteInput";
import { getMonthName, todayISO, isToday, isPast, formatDateDisplay } from "@/lib/dates";

export default function CalendarPage() {
    const params = useParams();
    const calendarId = params.id as Id<"calendars">;

    const now = new Date();
    const [year, setYear] = useState(now.getUTCFullYear());
    const [month, setMonth] = useState(now.getUTCMonth() + 1);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const calendar = useQuery(api.calendars.getCalendar, { calendarId });
    const participants = useQuery(api.participants.getParticipants, {
        calendarId,
    });
    const monthData = useQuery(api.notes.getMonthView, {
        calendarId,
        year,
        month,
    });
    const dayNotes = useQuery(
        api.notes.getDayNotes,
        selectedDate ? { calendarId, date: selectedDate } : "skip"
    );

    const prevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const goToToday = () => {
        const now = new Date();
        setYear(now.getUTCFullYear());
        setMonth(now.getUTCMonth() + 1);
    };

    if (calendar === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--color-text-muted)]">Loading calendar...</p>
                </div>
            </div>
        );
    }

    if (calendar === null) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-surface-elevated)] flex items-center justify-center border border-[var(--color-border)]">
                        <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                        Calendar not found
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                        This calendar doesn&apos;t exist or you don&apos;t have access.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    const today = todayISO();
    const selectedIsToday = selectedDate ? isToday(selectedDate) : false;
    const selectedIsPast = selectedDate ? isPast(selectedDate) : false;

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[var(--color-border)] glass sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                                    <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="font-display font-semibold text-[var(--color-text-primary)] tracking-tight">
                                        {calendar.title || "Untitled Calendar"}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        {participants?.map((p, i) => (
                                            <span
                                                key={p._id}
                                                className="inline-flex items-center gap-1 text-xs"
                                                style={{
                                                    color: i === 0
                                                        ? 'var(--color-participant-a)'
                                                        : 'var(--color-participant-b)',
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: i === 0
                                                            ? 'var(--color-participant-a)'
                                                            : 'var(--color-participant-b)',
                                                    }}
                                                />
                                                {p.displayName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={prevMonth}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] transition-all cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="text-center">
                        <motion.h2
                            key={`${year}-${month}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight"
                        >
                            {getMonthName(month)} {year}
                        </motion.h2>
                        <button
                            onClick={goToToday}
                            className="mt-1 px-3 py-0.5 rounded-full text-xs font-medium text-[var(--color-today)] bg-[var(--color-today)]/10 hover:bg-[var(--color-today)]/20 transition-colors cursor-pointer"
                        >
                            Today
                        </button>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] transition-all cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Calendar Grid */}
                <motion.div
                    key={`${year}-${month}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    {monthData !== undefined ? (
                        <CalendarGrid
                            year={year}
                            month={month}
                            calendarId={calendarId}
                            monthData={monthData}
                            onDayClick={(date) => setSelectedDate(date)}
                        />
                    ) : (
                        <div className="glass rounded-2xl p-5">
                            <div className="grid grid-cols-7 gap-1.5">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="aspect-square skeleton rounded-xl" />
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* Day Modal */}
            <DayModal
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
            >
                {selectedDate && (
                    <div>
                        {/* Date header */}
                        <div className="mb-5 pr-10">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="font-display text-3xl font-bold text-[var(--color-text-primary)] leading-none">
                                        {new Date(selectedDate + 'T12:00:00Z').getUTCDate()}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                                        {new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            timeZone: 'UTC',
                                        })}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5 ml-2">
                                    {selectedIsToday && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-today)]/15 text-[var(--color-today)] text-xs font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-today)] animate-pulse" />
                                            Today
                                        </span>
                                    )}
                                    {selectedIsPast && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-surface-light)] text-[var(--color-text-muted)] text-xs font-medium">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Read-only
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {dayNotes !== undefined ? (
                            <NoteList
                                notes={dayNotes.map((n) => ({
                                    _id: n._id,
                                    authorName: n.authorName,
                                    content: n.content,
                                    createdAt: n.createdAt,
                                }))}
                            />
                        ) : (
                            <div className="space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="skeleton h-20 rounded-xl" />
                                ))}
                            </div>
                        )}

                        {/* Input for today only */}
                        {selectedIsToday && (
                            <NoteInput calendarId={calendarId} date={selectedDate} />
                        )}
                    </div>
                )}
            </DayModal>
        </div>
    );
}

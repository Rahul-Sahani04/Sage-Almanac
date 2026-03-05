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
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-[1.5px] border-[var(--color-text-secondary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)]">Loading journal...</p>
                </div>
            </div>
        );
    }

    if (calendar === null) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-surface)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white p-12 border border-[var(--color-border)] shadow-sm"
                >
                    <h2 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-base text-[var(--color-text-secondary)] mb-8">
                        This journal doesn&apos;t exist or you don&apos;t have access.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] hover:opacity-70 transition-opacity border-b border-[var(--color-text-primary)] pb-1"
                    >
                        Back to library
                    </Link>
                </motion.div>
            </div>
        );
    }

    const today = todayISO();
    const selectedIsToday = selectedDate ? isToday(selectedDate) : false;
    const selectedIsPast = selectedDate ? isPast(selectedDate) : false;

    return (
        <div className="min-h-screen bg-[var(--color-surface)] selection:bg-[var(--color-primary)] selection:text-white pb-20">
            {/* Header */}
            <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors border border-transparent hover:border-[var(--color-border)] bg-transparent hover:bg-white"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                                </svg>
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary-dark)]">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="font-display italic text-2xl font-medium text-[var(--color-text-primary)] tracking-tight leading-none">
                                        {calendar.title || "Untitled Journal"}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        {participants?.map((p, i) => (
                                            <span
                                                key={p._id}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
                                                style={{
                                                    color: i === 0 ? 'var(--color-participant-a)' : 'var(--color-participant-b)',
                                                }}
                                            >
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{
                                                        background: i === 0 ? 'var(--color-participant-a)' : 'var(--color-participant-b)',
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

            <main className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 sm:mt-16">
                {/* Journal Navigation layout */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-6">
                    <div className="text-center sm:text-left flex-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] mb-2 block">
                            Issue {year}
                        </span>
                        <motion.h2
                            key={`title-${year}-${month}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-display text-5xl sm:text-6xl text-[var(--color-text-primary)] tracking-tight leading-none"
                        >
                            {getMonthName(month)}
                        </motion.h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={prevMonth}
                            className="w-12 h-12 flex items-center justify-center border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-all cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            onClick={goToToday}
                            className="px-6 h-12 flex items-center justify-center border border-[var(--color-border)] bg-white text-[var(--color-text-primary)] text-sm font-bold uppercase tracking-widest hover:border-[var(--color-text-primary)] transition-all cursor-pointer"
                        >
                            Today
                        </button>

                        <button
                            onClick={nextMonth}
                            className="w-12 h-12 flex items-center justify-center border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] transition-all cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <motion.div
                    key={`grid-${year}-${month}`}
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
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
                        <div className="bg-white border border-[var(--color-border)] p-6 sm:p-10 shadow-sm">
                            <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <div key={i} className="aspect-square bg-white opacity-50" />
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
                    <div className="p-2">
                        {/* Header for Day */}
                        <div className="mb-8 border-b border-[var(--color-border)] pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="font-display italic text-6xl text-[var(--color-text-primary)] leading-none mb-2">
                                        {new Date(selectedDate + 'T12:00:00Z').getUTCDate()}
                                    </span>
                                    <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
                                        {new Date(selectedDate + 'T12:00:00Z').toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            year: 'numeric',
                                            timeZone: 'UTC',
                                        })}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    {selectedIsToday && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-widest">
                                            Present Day
                                        </span>
                                    )}
                                    {selectedIsPast && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-widest">
                                            Archival
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
                            <div className="space-y-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="skeleton h-24 rounded-none opacity-50" />
                                ))}
                            </div>
                        )}

                        {/* Input for today only */}
                        {selectedIsToday && (
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                                <NoteInput calendarId={calendarId} date={selectedDate} />
                            </div>
                        )}
                    </div>
                )}
            </DayModal>
        </div>
    );
}

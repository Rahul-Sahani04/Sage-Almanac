"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import CalendarGrid from "@/components/CalendarGrid";
import DayModal from "@/components/DayModal";
import NoteList from "@/components/NoteList";
import NoteInput from "@/components/NoteInput";
import { getMonthName, todayISO, isToday, isPast, formatDateDisplay } from "@/lib/dates";

export default function CalendarPage() {
    const params = useParams();
    const router = useRouter();
    const { userId, isLoaded: clerkLoaded } = useAuth();
    const { anonymousId, isLoaded: anonLoaded } = useAnonymousId();
    const calendarId = params.id as Id<"calendars">;

    const now = new Date();
    const [year, setYear] = useState(now.getUTCFullYear());
    const [month, setMonth] = useState(now.getUTCMonth() + 1);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sharing state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [copied, setCopied] = useState(false);

    const isFullyLoaded = clerkLoaded && anonLoaded;

    const calendar = useQuery(api.calendars.getCalendar, isFullyLoaded ? { calendarId, anonymousId } : "skip");
    const deleteCalendar = useMutation(api.calendars.deleteCalendar);
    const regenerateToken = useMutation(api.calendars.regenerateInviteToken);
    const participants = useQuery(api.participants.getParticipants, isFullyLoaded ? {
        calendarId,
        anonymousId
    } : "skip");
    const monthData = useQuery(api.notes.getMonthView, isFullyLoaded ? {
        calendarId,
        year,
        month,
        anonymousId
    } : "skip");
    const dayNotes = useQuery(
        api.notes.getDayNotes,
        (isFullyLoaded && selectedDate) ? { calendarId, date: selectedDate, anonymousId } : "skip"
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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteCalendar({ calendarId, anonymousId });
            router.push('/');
        } catch (error) {
            console.error("Failed to delete journal:", error);
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const res = await regenerateToken({ calendarId, anonymousId });
            setShareToken(res.rawToken);
        } catch (error) {
            console.error("Failed to regenerate token:", error);
        }
        setIsSharing(false);
    };

    const copyToken = async () => {
        if (!shareToken) return;
        const url = `${window.location.origin}/join/${shareToken}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isFullyLoaded || calendar === undefined) {
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
                        {(calendar.ownerId === userId || (anonymousId && calendar.ownerId === anonymousId)) && (
                            <div className="flex items-center">
                                <button
                                    onClick={() => {
                                        setShowShareModal(true);
                                        if (!shareToken) handleShare();
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors border border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer"
                                    aria-label="Share Journal"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors border border-transparent hover:border-[var(--color-error)] hover:bg-[var(--color-error)]/5 cursor-pointer"
                                    aria-label="Delete Journal"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
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
            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isDeleting && setShowDeleteModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white border border-[var(--color-border)] shadow-2xl p-8"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-2 bg-white/50 border border-[var(--color-border)] shadow-sm rotate-1" />

                            <div className="text-center mb-8 pt-4">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-3">
                                    Burn this Journal?
                                </h3>
                                <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
                                    This action cannot be undone. All notes, memories, and access for participants will be permanently deleted.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-6 py-3 bg-[var(--color-error)] text-white text-sm font-medium hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Burning...</span>
                                        </>
                                    ) : (
                                        "Yes, delete it"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowShareModal(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white border border-[var(--color-border)] shadow-2xl p-8"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-2 bg-white/50 border border-[var(--color-border)] shadow-sm rotate-1" />

                            <button
                                onClick={() => setShowShareModal(false)}
                                className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-center py-4">
                                <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-4">
                                    Share Journal
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                                    {isSharing
                                        ? "Generating secure link..."
                                        : "Share this link with your partner. It overrides any previous links."}
                                </p>

                                {isSharing ? (
                                    <div className="flex justify-center p-6">
                                        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : shareToken ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col gap-3">
                                            <div className="relative group">
                                                <div className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-mono truncate select-all text-left">
                                                    {`${typeof window !== "undefined" ? window.location.origin : ""}/join/${shareToken}`}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={copyToken}
                                                    className={`w-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer border ${copied
                                                        ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]"
                                                        : "bg-[var(--color-text-primary)] text-white border-[var(--color-text-primary)] hover:bg-black"
                                                        }`}
                                                >
                                                    {copied ? "Copied!" : "Copy Link"}
                                                </button>

                                                <button
                                                    onClick={handleShare}
                                                    className="w-full px-6 py-3 bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 border border-transparent hover:border-[var(--color-border)]"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Generate New Link
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleShare}
                                        className="px-6 py-3 bg-[var(--color-text-primary)] text-white text-sm font-medium transition-colors cursor-pointer hover:bg-black w-full"
                                    >
                                        Generate Invite Link
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

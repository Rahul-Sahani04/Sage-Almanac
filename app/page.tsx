"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
    const { isSignedIn, isLoaded } = useAuth();
    const calendars = useQuery(
        api.calendars.listMyCalendars,
        isSignedIn ? {} : "skip"
    );
    const createCalendar = useMutation(api.calendars.createCalendar);
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!displayName.trim()) return;
        setCreating(true);
        try {
            const result = await createCalendar({
                title: title.trim() || undefined,
                displayName: displayName.trim(),
            });
            setInviteToken(result.rawToken);
            setTitle("");
            setDisplayName("");
        } catch (error) {
            console.error("Failed to create calendar:", error);
        }
        setCreating(false);
    };

    const copyToken = async () => {
        if (!inviteToken) return;
        const url = `${window.location.origin}/join/${inviteToken}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[var(--color-border)] glass sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[var(--color-primary)]/20 group-hover:shadow-[var(--color-primary)]/40 transition-shadow">
                            C
                        </div>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-[var(--color-text-primary)] tracking-tight">
                                C-Aleena
                            </h1>
                            <p className="text-[10px] text-[var(--color-text-muted)] -mt-0.5 tracking-wider uppercase">
                                Shared Calendar
                            </p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {!isSignedIn ? (
                            <SignInButton mode="modal">
                                <button className="px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/20 cursor-pointer">
                                    Sign In
                                </button>
                            </SignInButton>
                        ) : (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 ring-2 ring-[var(--color-border)] ring-offset-2 ring-offset-[var(--color-surface)]",
                                    },
                                }}
                            />
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {!isSignedIn ? (
                    <HeroSection />
                ) : (
                    <>
                        {/* Dashboard header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                                    Your Calendars
                                </h2>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                    Shared daily notes with your favorite person ✨
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreate(!showCreate);
                                    setInviteToken(null);
                                }}
                                className="px-5 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all shadow-md shadow-[var(--color-primary)]/20 cursor-pointer flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="hidden sm:inline">New Calendar</span>
                                <span className="sm:hidden">New</span>
                            </button>
                        </div>

                        {/* Create Calendar Form */}
                        <AnimatePresence>
                            {showCreate && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="overflow-hidden mb-8"
                                >
                                    <div className="glass rounded-2xl p-6 sm:p-8">
                                        {inviteToken ? (
                                            <InviteTokenResult
                                                inviteToken={inviteToken}
                                                onCopy={copyToken}
                                                copied={copied}
                                                onDone={() => {
                                                    setShowCreate(false);
                                                    setInviteToken(null);
                                                }}
                                            />
                                        ) : (
                                            <CreateCalendarForm
                                                title={title}
                                                setTitle={setTitle}
                                                displayName={displayName}
                                                setDisplayName={setDisplayName}
                                                creating={creating}
                                                onSubmit={handleCreate}
                                                onCancel={() => setShowCreate(false)}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Calendar List */}
                        {calendars === undefined ? (
                            <CalendarListSkeleton />
                        ) : calendars.length === 0 ? (
                            <EmptyState onCreateClick={() => setShowCreate(true)} />
                        ) : (
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1 } },
                                }}
                            >
                                {calendars.map((cal) => (
                                    <motion.div
                                        key={cal!._id}
                                        variants={{
                                            hidden: { opacity: 0, y: 24 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                    >
                                        <Link href={`/calendar/${cal!._id}`}>
                                            <div className="glass rounded-2xl p-5 sm:p-6 card-hover group cursor-pointer relative overflow-hidden">
                                                {/* Accent gradient stripe */}
                                                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl gradient-primary opacity-60 group-hover:opacity-100 transition-opacity" />

                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center">
                                                            <svg className="w-5 h-5 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-display font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-light)] transition-colors">
                                                                {cal!.title || "Untitled Calendar"}
                                                            </h3>
                                                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                                                                Created{" "}
                                                                {new Date(cal!.createdAt).toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="badge text-[10px]">
                                                        {cal!.participantCount}/2
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {cal!.participants.map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                                                            style={{
                                                                background: i === 0
                                                                    ? 'rgba(129, 140, 248, 0.12)'
                                                                    : 'rgba(251, 113, 133, 0.12)',
                                                                color: i === 0
                                                                    ? 'var(--color-participant-a)'
                                                                    : 'var(--color-participant-b)',
                                                            }}
                                                        >
                                                            <span
                                                                className="w-2 h-2 rounded-full"
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

                                                {/* Hover arrow */}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-[-8px]">
                                                    <svg className="w-5 h-5 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-[var(--color-border)] mt-auto">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <p className="text-xs text-[var(--color-text-muted)]">
                        C-Aleena · Made with 💜
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                        A private space for two
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* ─────────────── Hero Section ─────────────── */
function HeroSection() {
    const features = [
        { icon: "🔒", label: "Private & Secure" },
        { icon: "⚡", label: "Real-time Sync" },
        { icon: "📝", label: "Daily Notes" },
        { icon: "👫", label: "2-Person Only" },
    ];

    return (
        <div className="text-center py-16 sm:py-28 relative">
            {/* Decorative floating elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <motion.div
                    animate={{ y: [-8, 8, -8], rotate: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-12 left-[10%] w-8 h-8 rounded-full bg-[var(--color-rose)]/10 border border-[var(--color-rose)]/20"
                />
                <motion.div
                    animate={{ y: [6, -10, 6], rotate: [0, -3, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-24 right-[12%] w-6 h-6 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                />
                <motion.div
                    animate={{ y: [-5, 12, -5] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-20 left-[20%] w-5 h-5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20"
                />
                <motion.div
                    animate={{ y: [10, -6, 10], rotate: [0, 8, 0] }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-32 right-[18%] w-10 h-10 rounded-xl bg-[var(--color-amber)]/8 border border-[var(--color-amber)]/15"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {/* Animated logo */}
                <motion.div
                    className="relative w-24 h-24 mx-auto mb-10"
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-full h-full rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-[var(--color-primary)]/30">
                        <svg
                            className="w-12 h-12 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    {/* Glow ring */}
                    <div className="absolute -inset-3 rounded-3xl border border-[var(--color-primary)]/20 animate-pulse" />
                    <div className="absolute -inset-6 rounded-3xl border border-[var(--color-primary)]/10" />
                </motion.div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">
                    C-Aleena
                </h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-lg mx-auto mb-10 leading-relaxed"
                >
                    A private shared calendar for two.
                    <br />
                    <span className="text-[var(--color-rose-light)]">Leave daily notes, memories, and moments</span> — together.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <SignInButton mode="modal">
                        <button className="px-10 py-4 rounded-2xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all shadow-2xl shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 cursor-pointer">
                            Get Started — It&apos;s Free
                        </button>
                    </SignInButton>
                </motion.div>

                {/* Feature badges */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-3 mt-10"
                >
                    {features.map((f) => (
                        <span
                            key={f.label}
                            className="badge"
                        >
                            <span>{f.icon}</span>
                            {f.label}
                        </span>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}

/* ─────────────── Create Calendar Form ─────────────── */
function CreateCalendarForm({
    title,
    setTitle,
    displayName,
    setDisplayName,
    creating,
    onSubmit,
    onCancel,
}: {
    title: string;
    setTitle: (v: string) => void;
    displayName: string;
    setDisplayName: (v: string) => void;
    creating: boolean;
    onSubmit: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/15 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--color-primary-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
                    Create a New Calendar
                </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2 font-medium">
                        Calendar Name
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Our Calendar 💜"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-active)] transition-all text-sm glow-ring"
                    />
                </div>
                <div>
                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2 font-medium">
                        Your Display Name <span className="text-[var(--color-rose)]">*</span>
                    </label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-active)] transition-all text-sm glow-ring"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] transition-all cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!displayName.trim() || creating}
                    className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[var(--color-primary)]/20"
                >
                    {creating ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                        </span>
                    ) : (
                        "Create Calendar"
                    )}
                </button>
            </div>
        </div>
    );
}

/* ─────────────── Invite Token Result ─────────────── */
function InviteTokenResult({
    inviteToken,
    onCopy,
    copied,
    onDone,
}: {
    inviteToken: string;
    onCopy: () => void;
    copied: boolean;
    onDone: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-16 h-16 mx-auto mb-5 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center"
            >
                <svg className="w-8 h-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </motion.div>

            <h3 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                Calendar Created! 🎉
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-sm mx-auto">
                Share this invite link with your partner — it can only be used once.
            </p>

            <div className="flex items-center gap-2 max-w-md mx-auto">
                <input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteToken}`}
                    className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-mono truncate"
                />
                <button
                    onClick={onCopy}
                    className={`px-5 py-3 rounded-xl text-white text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${copied
                            ? "bg-[var(--color-success)] shadow-md shadow-[var(--color-success)]/20"
                            : "gradient-primary shadow-md shadow-[var(--color-primary)]/20 hover:opacity-90"
                        }`}
                >
                    {copied ? "✓ Copied!" : "Copy Link"}
                </button>
            </div>

            <button
                onClick={onDone}
                className="mt-5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            >
                Done
            </button>
        </motion.div>
    );
}

/* ─────────────── Calendar List Skeleton ─────────────── */
function CalendarListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
                <div key={i} className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="skeleton w-10 h-10 rounded-xl" />
                        <div className="flex-1">
                            <div className="skeleton h-4 w-32 mb-2 rounded-lg" />
                            <div className="skeleton h-3 w-20 rounded-lg" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="skeleton h-7 w-20 rounded-full" />
                        <div className="skeleton h-7 w-20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────── Empty State ─────────────── */
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
        >
            <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-surface-elevated)] flex items-center justify-center border border-[var(--color-border)]"
            >
                <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </motion.div>

            <h3 className="font-display text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                No calendars yet
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first shared calendar and invite your partner to start leaving daily notes together. 💌
            </p>
            <button
                onClick={onCreateClick}
                className="px-8 py-3 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/25 cursor-pointer"
            >
                Create Your First Calendar
            </button>
        </motion.div>
    );
}

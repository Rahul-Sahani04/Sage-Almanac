"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useAnonymousId } from "@/hooks/useAnonymousId";
import HeroSection from "@/components/HeroSection";

export default function HomePage() {
    const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
    const { anonymousId, isLoaded: anonLoaded } = useAnonymousId();
    const calendars = useQuery(
        api.calendars.listMyCalendars,
        (clerkLoaded && anonLoaded) ? { anonymousId } : "skip"
    );
    const createCalendar = useMutation(api.calendars.createCalendar);
    const [showCreate, setShowCreate] = useState(false);
    const [partnerName, setPartnerName] = useState("");
    const [password, setPassword] = useState("");
    const [usePassword, setUsePassword] = useState(false);
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        if (!partnerName.trim()) return;
        setCreating(true);
        try {
            const args: { partnerName: string; password?: string } = { partnerName: partnerName.trim() };
            if (usePassword && password) {
                args.password = password;
            }
            const result = await createCalendar(args);
            setInviteToken(result.rawToken);
            setPartnerName("");
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

    if (!clerkLoaded || !anonLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-[1.5px] border-[var(--color-text-secondary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-[var(--color-text-secondary)] tracking-wider uppercase">Loading</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-surface)] selection:bg-[var(--color-primary)] selection:text-white">
            {/* Header */}
            <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-[999]">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-[var(--color-primary)] rounded-md flex items-center justify-center text-white font-display italic p-0 shadow-sm transition-transform group-hover:scale-105">
                            <img
                                src="/images/navLogo.png"
                                alt="NavLogo"
                                className="w-full h-full object-cover "
                            />
                        </div>
                        <div>
                            <h1 className="font-display italic text-2xl font-medium text-[var(--color-text-primary)] tracking-tight leading-none">
                                Sage-Almanac
                            </h1>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 scale-125">
                        {!isSignedIn ? (
                            <SignInButton mode="modal">
                                <button className="px-5 py-2.5 bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm cursor-pointer border border-transparent">
                                    Sign In
                                </button>
                            </SignInButton>
                        ) : (
                            <UserButton
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border border-[var(--color-border)] rounded-full",
                                    },
                                }}
                            />
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
                {(!isSignedIn && (!calendars || calendars.length === 0)) ? (
                    <HeroSection />
                ) : (
                    <>
                        {/* Dashboard header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 border-b border-[var(--color-border)] pb-8">
                            <div>
                                <h2 className="font-display text-4xl sm:text-5xl font-medium text-[var(--color-text-primary)] tracking-tight mb-2">
                                    Your Journals
                                </h2>
                                <p className="text-base text-[var(--color-text-secondary)]">
                                    Shared daily notes with your favorite person.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowCreate(!showCreate);
                                    setInviteToken(null);
                                }}
                                className="px-6 py-3 bg-[var(--color-primary)] text-white font-medium text-sm hover:bg-[var(--color-primary-dark)] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>New Journal</span>
                            </button>
                        </div>

                        {/* Create Calendar Form */}
                        <AnimatePresence>
                            {showCreate && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden mb-12"
                                >
                                    <div className="bg-white border border-[var(--color-border)] p-6 sm:p-10 shadow-sm relative">
                                        {/* Decorative pin/tape */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-3 bg-white/50 border border-[var(--color-border)] shadow-sm rotate-2" />

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
                                                partnerName={partnerName}
                                                setPartnerName={setPartnerName}
                                                usePassword={usePassword}
                                                setUsePassword={setUsePassword}
                                                password={password}
                                                setPassword={setPassword}
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
                                className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
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
                                            hidden: { opacity: 0, y: 10 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="h-full relative group/card"
                                    >
                                        <Link href={`/calendar/${cal!._id}`} className="block h-full group">
                                            <div className="note-card h-full flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between mb-5">
                                                        <h3 className="font-display italic text-2xl text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors leading-tight pr-4">
                                                            {cal!.title || "Shared Journal"}
                                                        </h3>
                                                        <span className="badge shrink-0 border-[var(--color-border)] text-[var(--color-text-secondary)]">
                                                            {cal!.participantCount}/2
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-3 mb-6">
                                                        {cal!.participants.map((p, i) => (
                                                            <span
                                                                key={i}
                                                                className="inline-flex items-center gap-1.5 text-sm font-medium"
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

                                                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-2">
                                                    <p className="text-xs text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
                                                        Est. {new Date(cal!.createdAt).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </p>
                                                    <div className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 group-hover:border-[var(--color-primary)] text-[var(--color-primary)]">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
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
            <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-[var(--color-text-muted)] font-display italic text-lg">
                        Sage-Almanac.
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest">
                        Issue No. 1 — A Private Space
                    </p>
                </div>
            </footer>
        </div>
    );
}

/* ─────────────── Create Calendar Form ─────────────── */
function CreateCalendarForm({
    partnerName,
    setPartnerName,
    usePassword,
    setUsePassword,
    password,
    setPassword,
    creating,
    onSubmit,
    onCancel,
}: {
    partnerName: string;
    setPartnerName: (v: string) => void;
    usePassword?: boolean;
    setUsePassword?: (v: boolean) => void;
    password?: string;
    setPassword?: (v: string) => void;
    creating: boolean;
    onSubmit: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="space-y-8">
            <div className="border-b border-[var(--color-border)] pb-4 mb-6">
                <h3 className="font-display italic text-3xl text-[var(--color-text-primary)]">
                    Start a New Journal
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Set the foundation for your written memories.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-3">
                        Who are you sharing with? <span className="text-[var(--color-primary)]">*</span>
                    </label>
                    <input
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        placeholder="Your partner's name"
                        className="w-full px-0 py-3 bg-transparent border-b border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] transition-colors text-lg focus:outline-none font-display italic"
                    />
                </div>

                {setUsePassword && (
                    <div>
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={usePassword}
                                onChange={(e) => {
                                    setUsePassword(e.target.checked);
                                    if (!e.target.checked && setPassword) setPassword("");
                                }}
                                className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary-light)]"
                            />
                            Password Protect Link (Optional)
                        </label>

                        <AnimatePresence>
                            {usePassword && setPassword && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="relative overflow-hidden"
                                >
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Set a password"
                                        maxLength={50}
                                        className="w-full px-0 py-3 bg-transparent border-b border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] transition-colors text-lg focus:outline-none font-sans"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
                <button
                    onClick={onCancel}
                    className="px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    onClick={onSubmit}
                    disabled={!partnerName.trim() || creating}
                    className="px-8 py-3 bg-[var(--color-text-primary)] text-white text-sm font-medium hover:bg-black transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                    {creating ? "Creating..." : "Create Journal"}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
        >
            <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-4">
                Journal Created.
            </h3>
            <p className="text-base text-[var(--color-text-secondary)] mb-8 max-w-md mx-auto">
                Share this exclusive invite link with your partner. It serves as a one-time key to join this journal.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-8">
                <div className="w-full flex-1 px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-mono truncate select-all">
                    {`${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteToken}`}
                </div>
                <button
                    onClick={onCopy}
                    className={`w-full sm:w-auto px-6 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap border ${copied
                        ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]"
                        : "bg-[var(--color-text-primary)] text-white border-[var(--color-text-primary)] hover:bg-black"
                        }`}
                >
                    {copied ? "Copied" : "Copy Link"}
                </button>
            </div>

            <button
                onClick={onDone}
                className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer border-b border-transparent hover:border-[var(--color-text-primary)] pb-1"
            >
                Done
            </button>
        </motion.div>
    );
}

/* ─────────────── Calendar List Skeleton ─────────────── */
function CalendarListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-[var(--color-border)] p-8 h-48">
                    <div className="skeleton h-8 w-2/3 mb-4 rounded-none" />
                    <div className="skeleton h-4 w-1/3 mb-8 rounded-none" />
                    <div className="flex gap-4">
                        <div className="skeleton h-4 w-16 rounded-none" />
                        <div className="skeleton h-4 w-16 rounded-none" />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-24 sm:py-32 border border-dashed border-[var(--color-border)] bg-white/50"
        >
            <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-4">
                A Blank Canvas
            </h3>
            <p className="text-base text-[var(--color-text-secondary)] mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first shared journal and invite your partner to begin leaving daily notes.
            </p>
            <button
                onClick={onCreateClick}
                className="px-8 py-3 bg-[var(--color-text-primary)] text-white font-medium text-sm hover:bg-black transition-colors cursor-pointer"
            >
                Create Journal
            </button>
        </motion.div>
    );
}

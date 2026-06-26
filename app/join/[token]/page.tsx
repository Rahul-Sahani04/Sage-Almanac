"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAnonymousId } from "@/hooks/useAnonymousId";

export default function JoinPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const { isLoaded: clerkLoaded } = useAuth();
    const { anonymousId, isLoaded: anonLoaded } = useAnonymousId();

    const inviteInfo = useQuery(api.calendars.getInviteInfo, { rawToken: token });
    const joinCalendar = useMutation(api.participants.joinCalendar);

    const [password, setPassword] = useState("");
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleJoin = async () => {
        setJoining(true);
        setError(null);

        try {
            const args: { rawToken: string; anonymousId?: string; password?: string } = {
                rawToken: token,
                anonymousId,
            };

            if (inviteInfo?.requiresPassword && password) {
                args.password = password;
            }

            const result = await joinCalendar(args);

            if (result.passwordRequired) {
                setError(password ? "Incorrect password" : "This journal requires a password.");
                setJoining(false);
                return;
            }

            if (result.alreadyJoined) {
                setSuccess("You've already joined this journal!");
            } else {
                setSuccess("Successfully joined the journal!");
            }

            setTimeout(() => {
                router.push(`/calendar/${result.calendarId}`);
            }, 1000);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to join journal"
            );
        }
        setJoining(false);
    };

    if (!clerkLoaded || !anonLoaded || inviteInfo === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--color-text-muted)] tracking-widest uppercase">Loading form...</p>
                </div>
            </div>
        );
    }

    if (inviteInfo === null) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center p-8 bg-white border border-[var(--color-border)] max-w-sm w-full">
                    <h2 className="font-display italic text-2xl text-[var(--color-text-primary)] mb-3">
                        Invalid Link
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                        This invite link is invalid or has expired.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-[var(--color-text-primary)] text-white text-sm font-medium hover:bg-black transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md"
            >
                <div className="glass-elevated rounded-none overflow-hidden border border-[var(--color-border)] shadow-sm bg-white">
                    <div className="p-8 sm:p-10 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                            className="w-12 h-12 mx-auto mb-6 flex items-center justify-center border border-[var(--color-primary)]/20 rounded-full"
                        >
                            <svg
                                className="w-6 h-6 text-[var(--color-primary)]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                />
                            </svg>
                        </motion.div>

                        <h1 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-2">
                            You&apos;ve Been Invited
                        </h1>
                        <p className="text-base text-[var(--color-text-secondary)] mb-2 leading-relaxed">
                            Someone special invited you to share a private journal as <strong>{inviteInfo.partnerName}</strong>.
                        </p>
                        {inviteInfo.expiresAt && (
                            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-8">
                                Expires {new Date(inviteInfo.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        )}

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="w-10 h-10 mx-auto mb-4 border border-[var(--color-success)] rounded-full flex items-center justify-center bg-[var(--color-success)]/10"
                                >
                                    <svg
                                        className="w-5 h-5 text-[var(--color-success)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                                <p className="text-sm font-bold tracking-widest uppercase text-[var(--color-success)]">
                                    {success}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                    Opening journal...
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {inviteInfo.requiresPassword && (
                                    <div className="text-left">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-3">
                                            Journal Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setError(null);
                                            }}
                                            placeholder="Enter password to unlock"
                                            className="w-full px-0 py-3 bg-transparent border-b border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] transition-colors text-base focus:outline-none"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleJoin();
                                            }}
                                        />
                                    </div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs font-bold uppercase tracking-widest text-[var(--color-error)] text-left bg-[var(--color-error)]/5 border border-[var(--color-error)]/20 p-3"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleJoin}
                                    disabled={joining || (inviteInfo.requiresPassword && !password)}
                                    className="w-full py-4 bg-[var(--color-text-primary)] text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    {joining ? "Joining..." : "Accept Invite"}
                                </button>
                            </div>
                        )}

                        <div className="mt-8 pt-5 border-t border-[var(--color-border)]">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                Back to Start
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

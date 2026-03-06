"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAnonymousId } from "@/hooks/useAnonymousId";

export default function JoinPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;
    const { isLoaded: clerkLoaded } = useAuth();
    const { anonymousId, isLoaded: anonLoaded } = useAnonymousId();
    const joinCalendar = useMutation(api.participants.joinCalendar);

    const [displayName, setDisplayName] = useState("");
    const [password, setPassword] = useState("");
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const savedName = localStorage.getItem("cAleena_displayName");
        if (savedName) setDisplayName(savedName);
    }, []);

    const handleJoin = async () => {
        if (!displayName.trim()) return;
        setJoining(true);
        setError(null);

        try {
            const args: any = {
                rawToken: token,
                displayName: displayName.trim(),
                anonymousId,
            };

            if (requiresPassword && password) {
                args.password = password;
            }

            const result = await joinCalendar(args);

            if (result.passwordRequired) {
                setRequiresPassword(true);
                setError(password ? "Incorrect password" : "This journal requires a password.");
                setJoining(false);
                return;
            }

            localStorage.setItem("cAleena_displayName", displayName.trim());

            if (result.alreadyJoined) {
                setSuccess("You've already joined this calendar!");
            } else {
                setSuccess("Successfully joined the calendar!");
            }

            setTimeout(() => {
                router.push(`/calendar/${result.calendarId}`);
            }, 1500);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to join calendar"
            );
        }
        setJoining(false);
    };

    if (!clerkLoaded || !anonLoaded) {
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
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="w-full max-w-md"
            >
                <div className="glass-elevated rounded-2xl overflow-hidden">
                    {/* Decorative header band */}
                    <div className="h-1.5 gradient-warm" />

                    <div className="p-8 text-center">
                        {/* Invitation icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                            className="w-18 h-18 mx-auto mb-6 relative"
                        >
                            <div className="w-16 h-16 mx-auto rounded-2xl gradient-warm flex items-center justify-center shadow-lg shadow-[var(--color-rose)]/20">
                                <svg
                                    className="w-8 h-8 text-white"
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
                            </div>
                            {/* Pulse ring */}
                            <div className="absolute -inset-2 rounded-3xl border border-[var(--color-rose)]/20 animate-pulse" />
                        </motion.div>

                        <h1 className="font-display text-2xl font-bold text-[var(--color-text-primary)] mb-2 tracking-tight">
                            You&apos;re Invited! 💌
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                            Someone special invited you to share a daily calendar together. No account required.
                        </p>

                        {success ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className="w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center"
                                >
                                    <svg
                                        className="w-7 h-7 text-[var(--color-success)]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                                <p className="text-sm font-medium text-[var(--color-success)]">
                                    {success}
                                </p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                    Redirecting to your calendar... ✨
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-5">
                                <div className="text-left">
                                    <label className="block text-sm text-[var(--color-text-secondary)] mb-2 font-medium">
                                        Your Display Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Enter your name"
                                            maxLength={20}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-active)] transition-all text-sm glow-ring"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !requiresPassword) handleJoin();
                                            }}
                                        />
                                    </div>
                                </div>

                                {requiresPassword && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-left overflow-hidden"
                                    >
                                        <label className="block text-sm text-[var(--color-text-secondary)] mb-2 font-medium mt-1">
                                            Journal Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    setError(null);
                                                }}
                                                placeholder="Enter journal password"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-active)] transition-all text-sm glow-ring"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleJoin();
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 rounded-lg px-3 py-2 text-left"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <button
                                    onClick={handleJoin}
                                    disabled={!displayName.trim() || (requiresPassword && !password) || joining}
                                    className="w-full py-3 rounded-xl gradient-warm text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[var(--color-rose)]/20 flex items-center justify-center gap-2"
                                >
                                    {joining ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Join Calendar
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        <div className="mt-8 pt-5 border-t border-[var(--color-border)]">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to C-Aleena
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

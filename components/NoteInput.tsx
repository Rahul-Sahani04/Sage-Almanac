"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

interface NoteInputProps {
    calendarId: Id<"calendars">;
    date: string;
}

export default function NoteInput({ calendarId, date }: NoteInputProps) {
    const addNote = useMutation(api.notes.addNote);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const maxLen = 2000;
    const charPercent = Math.min((content.length / maxLen) * 100, 100);

    const handleSubmit = async () => {
        if (!content.trim() || submitting) return;
        setSubmitting(true);
        setError(null);

        try {
            await addNote({ calendarId, content: content.trim(), date });
            setContent("");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add note");
        }
        setSubmitting(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="mt-5 pt-5 border-t border-[var(--color-border)]">
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">
                ✏️ Add a Note
            </label>
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="What's on your mind today?"
                    rows={3}
                    maxLength={maxLen}
                    disabled={submitting}
                    className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface-light)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-active)] transition-all text-sm resize-none disabled:opacity-50 glow-ring leading-relaxed"
                />

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                        {/* Character count with visual indicator */}
                        <div className="flex items-center gap-2">
                            <div className="relative w-5 h-5">
                                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="8"
                                        fill="none"
                                        stroke="var(--color-surface-elevated)"
                                        strokeWidth="2"
                                    />
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="8"
                                        fill="none"
                                        stroke={
                                            charPercent > 90
                                                ? "var(--color-error)"
                                                : charPercent > 70
                                                    ? "var(--color-amber)"
                                                    : "var(--color-primary-light)"
                                        }
                                        strokeWidth="2"
                                        strokeDasharray={`${charPercent * 0.503} 50.3`}
                                        strokeLinecap="round"
                                        className="transition-all duration-300"
                                    />
                                </svg>
                            </div>
                            <span className={`text-xs transition-colors ${charPercent > 90 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
                                {content.length}/{maxLen}
                            </span>
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)] hidden sm:inline">
                            ⌘+Enter to send
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || submitting}
                        className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-[var(--color-primary)]/20 flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Sending
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Success micro-interaction */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="mt-3 flex items-center gap-2 text-sm text-[var(--color-success)] bg-[var(--color-success)]/10 rounded-lg px-3 py-2"
                    >
                        <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </motion.svg>
                        Note saved! ✨
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 rounded-lg px-3 py-2"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

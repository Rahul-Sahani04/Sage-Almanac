"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
            <label className="block text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-4">
                Write an Entry
            </label>
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Document today's moments..."
                    rows={4}
                    maxLength={maxLen}
                    disabled={submitting}
                    className="w-full px-5 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] transition-colors text-base resize-none disabled:opacity-50 focus:outline-none focus:ring-0 rounded-none leading-relaxed font-sans"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-4 order-2 sm:order-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${charPercent > 90 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
                                {content.length} / {maxLen}
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)] hidden sm:inline">
                            CMD+Enter to commit
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || submitting}
                        className="order-1 sm:order-2 w-full sm:w-auto px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-surface)] text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {submitting ? "Committing..." : "Commit Entry"}
                    </button>
                </div>
            </div>

            {/* Success micro-interaction (Global Toast) */}
            {mounted && createPortal(
                <div className="fixed top-6 right-6 z-[100] pointer-events-none">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="bg-white border border-[var(--color-border)] shadow-xl px-6 py-4 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] pointer-events-auto"
                            >
                                <div className="w-2 h-2 bg-[var(--color-success)]" />
                                Entry Archived
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>,
                document.body
            )}

            {/* Error display */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 text-xs font-bold uppercase tracking-widest text-[var(--color-error)] border border-[var(--color-error)] p-3 bg-white"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

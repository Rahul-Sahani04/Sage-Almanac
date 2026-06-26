"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Note {
    _id: string;
    authorName: string;
    content: string;
    createdAt: number;
    imageUrl?: string | null;
}

interface NoteListProps {
    notes: Note[];
}

export default function NoteList({ notes }: NoteListProps) {
    if (notes.length === 0) {
        return (
            <div className="text-center py-16 border-y border-[var(--color-border)] border-dashed my-8">
                <p className="font-display italic text-xl text-[var(--color-text-secondary)]">
                    No notes yet.
                </p>
                <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mt-2">
                    Begin the entry
                </p>
            </div>
        );
    }

    return (
        <div className="relative mt-6">
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {notes.map((note, i) => {
                        // Quick naive hash to pick a consistent color per author
                        let hash = 0;
                        for (let j = 0; j < note.authorName.length; j++) {
                            hash = note.authorName.charCodeAt(j) + ((hash << 5) - hash);
                        }
                        const pIndex = Math.abs(hash) % 2;
                        const accentColor = pIndex === 0
                            ? "var(--color-participant-a)"
                            : "var(--color-participant-b)";

                        return (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05, duration: 0.4 }}
                                className="group relative"
                            >
                                {/* Note content with offset border style */}
                                <div className="border border-[var(--color-border)] p-5 sm:p-6 bg-white relative z-10 transition-transform group-hover:-translate-y-1 duration-300">
                                    <div className="flex items-baseline justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="w-2.5 h-2.5 rounded-none"
                                                style={{ background: accentColor }}
                                            />
                                            <span className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                                                {note.authorName}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] px-2 py-1">
                                            {new Date(note.createdAt).toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap font-sans">
                                        {note.content}
                                    </p>
                                    {note.imageUrl && (
                                        <img
                                            src={note.imageUrl}
                                            alt=""
                                            className="mt-4 max-h-64 w-full object-cover border border-[var(--color-border)]"
                                        />
                                    )}
                                </div>
                                {/* Drop shadow box underlying */}
                                <div className="absolute inset-0 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] translate-x-1.5 translate-y-1.5 -z-10 transition-transform group-hover:translate-x-2 group-hover:translate-y-2 duration-300" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

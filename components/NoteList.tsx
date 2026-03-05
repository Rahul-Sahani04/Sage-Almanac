"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Note {
    _id: string;
    authorName: string;
    content: string;
    createdAt: number;
}

interface NoteListProps {
    notes: Note[];
}

// Simple hash to get consistent participant index
function getParticipantIndex(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 2;
}

export default function NoteList({ notes }: NoteListProps) {
    if (notes.length === 0) {
        return (
            <div className="text-center py-10">
                <motion.div
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="text-3xl mb-3"
                >
                    📝
                </motion.div>
                <p className="text-sm text-[var(--color-text-muted)]">
                    No notes for this day yet.
                </p>
                <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">
                    Be the first to write something!
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline spine */}
            {notes.length > 1 && (
                <div className="absolute left-[15px] top-4 bottom-4 w-[2px] rounded-full bg-gradient-to-b from-[var(--color-primary)]/30 via-[var(--color-border)] to-transparent" />
            )}

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {notes.map((note, i) => {
                        const pIndex = getParticipantIndex(note.authorName);
                        const accentColor = pIndex === 0
                            ? "var(--color-participant-a)"
                            : "var(--color-participant-b)";

                        return (
                            <motion.div
                                key={note._id}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                                className="flex gap-3"
                            >
                                {/* Timeline dot */}
                                <div className="flex-shrink-0 pt-4 relative z-10">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 20, delay: i * 0.06 + 0.1 }}
                                        className="w-[10px] h-[10px] rounded-full border-2"
                                        style={{
                                            background: `${accentColor}20`,
                                            borderColor: accentColor,
                                        }}
                                    />
                                </div>

                                {/* Note card with accent border */}
                                <div
                                    className="note-card flex-1 min-w-0"
                                    style={{ '--accent-color': accentColor } as React.CSSProperties}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className="text-xs font-semibold px-2 py-0.5 rounded-md"
                                            style={{
                                                background: `${accentColor}15`,
                                                color: accentColor,
                                            }}
                                        >
                                            {note.authorName}
                                        </span>
                                        <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums">
                                            {new Date(note.createdAt).toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}

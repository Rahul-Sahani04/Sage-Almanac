"use client";

import { motion } from "framer-motion";

interface DayCellProps {
    day: number;
    dateStr: string;
    noteCount: number;
    authors: string[];
    isToday: boolean;
    isPast: boolean;
    onClick: () => void;
}

export default function DayCell({
    day,
    noteCount,
    authors,
    isToday,
    isPast,
    onClick,
}: DayCellProps) {
    // Determine unique author count for multi-color dots
    const uniqueAuthors = [...new Set(authors)];
    const hasNotes = noteCount > 0;

    return (
        <button
            onClick={onClick}
            className={`
                aspect-square rounded-xl flex flex-col items-center justify-center gap-1
                transition-all duration-200 cursor-pointer relative group overflow-hidden
                ${isToday
                    ? "today-glow bg-[var(--color-today)]/10 border-2 border-[var(--color-today)]/50"
                    : hasNotes && isPast
                        ? "bg-[var(--color-primary)]/8 border border-[var(--color-border)] hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-border-active)]"
                        : hasNotes
                            ? "bg-[var(--color-surface-elevated)]/60 border border-[var(--color-border-active)]/50 hover:bg-[var(--color-surface-elevated)]"
                            : isPast
                                ? "bg-[var(--color-surface-light)]/30 border border-transparent hover:bg-[var(--color-surface-light)]/50"
                                : "bg-[var(--color-surface-light)]/50 border border-transparent hover:bg-[var(--color-surface-light)] hover:border-[var(--color-border)]"
                }
            `}
        >
            {/* Day number */}
            <span
                className={`text-sm font-semibold transition-colors ${isToday
                        ? "text-[var(--color-today)]"
                        : hasNotes && !isPast
                            ? "text-[var(--color-text-primary)]"
                            : isPast
                                ? "text-[var(--color-text-muted)]"
                                : "text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]"
                    }`}
            >
                {day}
            </span>

            {/* Note dot indicators — color-coded per participant */}
            {hasNotes && (
                <div className="flex items-center gap-[3px]">
                    {uniqueAuthors.length >= 1 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20 }}
                            className="w-[6px] h-[6px] rounded-full"
                            style={{
                                background: isToday
                                    ? "var(--color-today)"
                                    : "var(--color-participant-a)",
                            }}
                        />
                    )}
                    {uniqueAuthors.length >= 2 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.05 }}
                            className="w-[6px] h-[6px] rounded-full"
                            style={{
                                background: isToday
                                    ? "var(--color-today)"
                                    : "var(--color-participant-b)",
                            }}
                        />
                    )}
                    {noteCount > 2 && (
                        <span className="text-[8px] text-[var(--color-text-muted)] ml-0.5 font-medium">
                            +{noteCount - uniqueAuthors.length}
                        </span>
                    )}
                </div>
            )}

            {/* Hover glow overlay */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent pointer-events-none" />

            {/* Today indicator ring animation */}
            {isToday && (
                <div className="absolute -inset-px rounded-xl border border-[var(--color-today)]/20 pointer-events-none" />
            )}
        </button>
    );
}

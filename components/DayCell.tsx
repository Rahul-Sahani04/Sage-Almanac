"use client";

import { motion } from "framer-motion";

interface DayCellProps {
    day: number;
    dateStr: string;
    noteCount: number;
    authors: string[];
    isToday: boolean;
    isPast: boolean;
    hasMarker: boolean;
    onClick: () => void;
}

export default function DayCell({
    day,
    noteCount,
    authors,
    isToday,
    isPast,
    hasMarker,
    onClick,
}: DayCellProps) {
    // Determine unique author count for multi-color dots
    const uniqueAuthors = [...new Set(authors)];
    const hasNotes = noteCount > 0;

    return (
        <button
            onClick={onClick}
            className={`
                w-full h-full aspect-[4/5] sm:aspect-square flex flex-col p-2 sm:p-3
                transition-all duration-200 cursor-pointer relative group text-left
                ${isToday
                    ? "bg-[var(--color-surface)]"
                    : "bg-white hover:bg-[var(--color-surface)]"
                }
            `}
        >
            {/* Special day marker indicator */}
            {hasMarker && (
                <div className="absolute top-1 left-1.5 text-[var(--color-primary)] text-[10px] leading-none pointer-events-none select-none">
                    ★
                </div>
            )}

            {/* Top corner for today indicator */}
            {isToday && (
                <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-16px] right-[-16px] w-8 h-8 bg-[var(--color-primary)] rotate-45" />
                </div>
            )}

            {/* Day number */}
            <span
                className={`font-display text-xl sm:text-2xl mt-1 transition-colors ${isToday
                        ? "text-[var(--color-primary)]"
                        : hasNotes && !isPast
                            ? "text-[var(--color-text-primary)]"
                            : isPast && !hasNotes
                                ? "text-[var(--color-text-muted)] italic"
                                : "text-[var(--color-text-primary)]"
                    }`}
            >
                {day}
            </span>

            {/* Note dot indicators at bottom — color-coded per participant */}
            {hasNotes && (
                <div className="mt-auto flex flex-wrap gap-1.5 pb-1">
                    {uniqueAuthors.length >= 1 && (
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                                background: "var(--color-participant-a)",
                            }}
                        />
                    )}
                    {uniqueAuthors.length >= 2 && (
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                                background: "var(--color-participant-b)",
                            }}
                        />
                    )}
                    {noteCount > 2 && (
                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] leading-none ml-0.5">
                            +{noteCount - uniqueAuthors.length}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
}

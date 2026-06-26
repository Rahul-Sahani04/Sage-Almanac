"use client";

import { motion } from "framer-motion";
import {
    getDaysInMonth,
    getFirstDayOfMonth,
    buildDateStr,
    todayISO,
    isToday,
    isPast,
} from "@/lib/dates";
import DayCell from "./DayCell";

interface DayAggregate {
    date: string;
    noteCount: number;
    authors: string[];
}

interface CalendarGridProps {
    year: number;
    month: number;
    calendarId: string;
    monthData: DayAggregate[];
    markersForMonth: { date: string }[];
    onDayClick: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
    year,
    month,
    calendarId,
    monthData,
    markersForMonth,
    onDayClick,
}: CalendarGridProps) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const dataMap = new Map<string, DayAggregate>();
    for (const d of monthData) {
        dataMap.set(d.date, d);
    }

    const markedDates = new Set(markersForMonth.map((m) => m.date));

    // Generate cells including leading empty cells
    const cells: (null | {
        day: number;
        dateStr: string;
        data: DayAggregate | undefined;
        isToday: boolean;
        isPast: boolean;
    })[] = [];

    // Leading empty cells
    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = buildDateStr(year, month, d);
        cells.push({
            day: d,
            dateStr,
            data: dataMap.get(dateStr),
            isToday: isToday(dateStr),
            isPast: isPast(dateStr),
            hasMarker: markedDates.has(dateStr),
        });
    }

    // Add trailing empty cells to complete the grid (make it look like a full page)
    const trailingDays = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailingDays; i++) {
        cells.push(null);
    }

    return (
        <div className="bg-white border border-[var(--color-border)] p-4 sm:p-8 shadow-sm">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-[var(--color-border)] mb-4">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-bold text-[var(--color-text-primary)] py-3 uppercase tracking-[0.2em]"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Day cells container - uses a thin 1px gap for a wireframe look */}
            <motion.div
                className="grid grid-cols-7 gap-[1px] bg-[var(--color-border)] border border-[var(--color-border)] lg:gap-[1px]"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.015 } },
                }}
            >
                {cells.map((cell, i) =>
                    cell === null ? (
                        <div key={`empty-${i}`} className="bg-[var(--color-surface-elevated)] aspect-[4/5] sm:aspect-square relative opacity-30" />
                    ) : (
                        <motion.div
                            key={cell.dateStr}
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1 },
                            }}
                            transition={{ duration: 0.3 }}
                            className="bg-white h-full"
                        >
                            <DayCell
                                day={cell.day}
                                dateStr={cell.dateStr}
                                noteCount={cell.data?.noteCount || 0}
                                authors={cell.data?.authors || []}
                                isToday={cell.isToday}
                                isPast={cell.isPast}
                                hasMarker={cell.hasMarker}
                                onClick={() => onDayClick(cell.dateStr)}
                            />
                        </motion.div>
                    )
                )}
            </motion.div>
        </div>
    );
}

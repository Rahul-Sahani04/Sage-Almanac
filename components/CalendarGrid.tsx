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
    onDayClick: (date: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
    year,
    month,
    calendarId,
    monthData,
    onDayClick,
}: CalendarGridProps) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = todayISO();

    // Build a map for quick lookup
    const dataMap = new Map<string, DayAggregate>();
    for (const d of monthData) {
        dataMap.set(d.date, d);
    }

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
        });
    }

    return (
        <div className="glass rounded-2xl p-3 sm:p-5">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-[var(--color-text-muted)] py-2 uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <motion.div
                className="grid grid-cols-7 gap-1.5"
                initial="hidden"
                animate="visible"
                variants={{
                    visible: { transition: { staggerChildren: 0.02 } },
                }}
            >
                {cells.map((cell, i) =>
                    cell === null ? (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ) : (
                        <motion.div
                            key={cell.dateStr}
                            variants={{
                                hidden: { opacity: 0, scale: 0.85 },
                                visible: { opacity: 1, scale: 1 },
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <DayCell
                                day={cell.day}
                                dateStr={cell.dateStr}
                                noteCount={cell.data?.noteCount || 0}
                                authors={cell.data?.authors || []}
                                isToday={cell.isToday}
                                isPast={cell.isPast}
                                onClick={() => onDayClick(cell.dateStr)}
                            />
                        </motion.div>
                    )
                )}
            </motion.div>
        </div>
    );
}

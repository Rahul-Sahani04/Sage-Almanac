"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface DayModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function DayModal({ isOpen, onClose, children }: DayModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-md z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                        }}
                        className="fixed inset-x-4 top-[8%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 max-h-[84vh] overflow-auto"
                    >
                        <div className="glass-elevated rounded-2xl relative overflow-hidden">
                            {/* Decorative gradient header accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-70" />

                            <div className="p-6 sm:p-7">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-light)] transition-all cursor-pointer z-10"
                                    aria-label="Close"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>

                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

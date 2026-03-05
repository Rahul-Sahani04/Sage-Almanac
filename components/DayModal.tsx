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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-xl z-50 max-h-[80vh] flex flex-col"
                    >
                        <div className="bg-white border border-[var(--color-border)] shadow-2xl relative flex flex-col max-h-full">
                            {/* Decorative top border */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-primary)]" />

                            <div className="p-6 sm:p-8 flex items-start justify-end shrink-0 pt-8 pb-0">
                                {/* Close button */}
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer z-10 hover:rotate-90 duration-300"
                                    aria-label="Close"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="square"
                                            strokeLinejoin="miter"
                                            strokeWidth={1.5}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-6 sm:px-10 pb-10 overflow-y-auto w-full custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

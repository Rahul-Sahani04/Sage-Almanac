"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DeleteModalProps {
    isOpen: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ isOpen, isDeleting, onClose, onConfirm }: DeleteModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isDeleting && onClose()}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white border border-[var(--color-border)] shadow-2xl p-8"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-2 bg-white/50 border border-[var(--color-border)] shadow-sm rotate-1" />

                        <div className="text-center mb-8 pt-4">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center text-[var(--color-error)]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-3">
                                Burn this Journal?
                            </h3>
                            <p className="text-base text-[var(--color-text-secondary)] leading-relaxed">
                                This action cannot be undone. All notes, memories, and access for participants will be permanently deleted.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onClose}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isDeleting}
                                className="flex-1 px-6 py-3 bg-[var(--color-error)] text-white text-sm font-medium hover:bg-red-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Burning...</span>
                                    </>
                                ) : (
                                    "Yes, delete it"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

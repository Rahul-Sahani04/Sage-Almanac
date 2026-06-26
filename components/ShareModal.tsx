"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
    isOpen: boolean;
    isSharing: boolean;
    shareToken: string | null;
    copied: boolean;
    onClose: () => void;
    onCopy: () => void;
    onRegenerate: () => void;
}

export default function ShareModal({ isOpen, isSharing, shareToken, copied, onClose, onCopy, onRegenerate }: ShareModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white border border-[var(--color-border)] shadow-2xl p-8"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-2 bg-white/50 border border-[var(--color-border)] shadow-sm rotate-1" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center py-4">
                            <h3 className="font-display italic text-3xl text-[var(--color-text-primary)] mb-4">
                                Share Journal
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-1 max-w-md mx-auto">
                                {isSharing
                                    ? "Generating secure link..."
                                    : "Share this link with your partner. It overrides any previous links."}
                            </p>
                            {!isSharing && shareToken && (
                                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-8">
                                    Expires in 7 days
                                </p>
                            )}

                            {isSharing ? (
                                <div className="flex justify-center p-6">
                                    <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : shareToken ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-mono truncate select-all text-left">
                                            {`${typeof window !== "undefined" ? window.location.origin : ""}/join/${shareToken}`}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={onCopy}
                                                className={`w-full px-6 py-3 text-sm font-medium transition-colors cursor-pointer border ${copied
                                                    ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]"
                                                    : "bg-[var(--color-text-primary)] text-white border-[var(--color-text-primary)] hover:bg-black"
                                                    }`}
                                            >
                                                {copied ? "Copied!" : "Copy Link"}
                                            </button>
                                            <button
                                                onClick={onRegenerate}
                                                className="w-full px-6 py-3 bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-medium uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center gap-2 border border-transparent hover:border-[var(--color-border)]"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Generate New Link
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onRegenerate}
                                    className="px-6 py-3 bg-[var(--color-text-primary)] text-white text-sm font-medium transition-colors cursor-pointer hover:bg-black w-full"
                                >
                                    Generate Invite Link
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

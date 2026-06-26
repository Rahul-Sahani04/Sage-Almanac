"use client";

import { motion } from "framer-motion";
import { SignInButton } from "@clerk/nextjs";

export default function HeroSection() {
    return (
        <div className="py-12 sm:py-24">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center lg:items-start mb-20 lg:mb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-2xl lg:max-w-3xl flex-1 text-center lg:text-left"
                >
                    <div className="mb-6 flex items-center justify-center lg:justify-start gap-4">
                        <div className="h-px bg-[var(--color-primary)] w-12" />
                        <span className="text-[var(--color-primary)] text-sm font-semibold tracking-widest uppercase">
                            The Shared Journal
                        </span>
                        <div className="h-px bg-[var(--color-primary)] w-12 lg:hidden" />
                    </div>

                    <h1 className="font-display text-5xl sm:text-7xl lg:text-7xl text-[var(--color-text-primary)] mb-8 leading-[1.05] tracking-tight">
                        Every day is a <br className="hidden sm:block" />
                        <span className="italic text-[var(--color-primary)]">new page.</span>
                    </h1>

                    <p className="text-lg sm:text-xl lg:text-xl text-[var(--color-text-secondary)] max-w-2xl mb-12 leading-relaxed font-light mx-auto lg:mx-0">
                        A private, shared calendar for two. Leave daily notes, memories, and moments together in a beautifully tactile space.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
                        <SignInButton mode="modal">
                            <button className="w-full sm:w-auto px-8 py-4 bg-[var(--color-text-primary)] text-[var(--color-surface)] font-medium hover:bg-black transition-colors cursor-pointer text-lg">
                                Start Writing
                            </button>
                        </SignInButton>
                        <span className="text-sm text-[var(--color-text-muted)] italic font-display">
                            Always private. Designed for two.
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-md lg:w-[450px] shrink-0 relative mt-10 lg:mt-0 flex items-center justify-center h-[400px] lg:h-[450px]"
                >
                    <motion.div
                        initial={{ y: 60 }}
                        animate={{ y: [50, 60, 50] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 bottom-0 w-56 sm:w-64 h-auto z-20"
                    >
                        <img
                            src="/images/boy.png"
                            alt="Boy Character"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -right-6 top-0 w-56 sm:w-64 h-auto z-30"
                    >
                        <img
                            src="/images/girl.png"
                            alt="Girl Character"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </motion.div>

                    <div className="absolute top-10 inset-x-10 inset-y-20 bg-gradient-to-tr from-[var(--color-primary)]/20 to-[var(--color-rose)]/20 rounded-full blur-3xl z-10 animate-pulse" style={{ animationDuration: '4s' }} />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="border-t border-[var(--color-border)] pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-2">01. Private</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Your words belong only to the two of you. End to end secure.</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-2">02. Serene</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">No distractions, no likes, no feeds. Just a quiet space to connect.</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-2">03. Archival</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Look back at yesterday, last month, or last year effortlessly.</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-primary)] mb-2">04. Together</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Strictly limited to two participants per journal.</p>
                </div>
            </motion.div>
        </div>
    );
}

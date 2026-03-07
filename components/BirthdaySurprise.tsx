"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { checkIsAleenaBirthday } from "@/lib/birthdayHelpers";

interface BirthdaySurpriseProps {
    calendarId: string;
}

export default function BirthdaySurprise({ calendarId }: BirthdaySurpriseProps) {
    const [isActive, setIsActive] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [isGiftOpen, setIsGiftOpen] = useState(false);

    const handlePopConfetti = () => {
        setIsGiftOpen(true);
        // Golden/warm palette matching the theme
        const colors = ['#be123c', '#ea580c', '#d97706', '#f59e0b', '#ffffff'];

        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: colors,
            zIndex: 200,
        });

        // A quick follow-up burst for more depth
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 120,
                origin: { y: 0.6 },
                colors: colors,
                zIndex: 200,
                startVelocity: 45
            });
        }, 200);
    };

    useEffect(() => {
        if (!checkIsAleenaBirthday(calendarId)) return;
        setIsActive(true);
    }, [calendarId]);

    // Lock background scroll when this is active to prevent double-scrollbars
    useEffect(() => {
        if (isActive && !dismissed) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        }
    }, [isActive, dismissed]);

    if (!isActive || dismissed) return null;

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    key="birthday-experience"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[100] bg-[#faf9f6] text-[#1c1917]"
                >
                    {/* Performance Optimized Background - Removed laggy SVG noise & mix-blend-modes */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-10%] left-[-10%] w-[60vw] max-w-[600px] h-[60vw] max-h-[600px] bg-rose-200/40 rounded-full blur-[80px]" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] max-w-[500px] h-[50vw] max-h-[500px] bg-amber-200/40 rounded-full blur-[80px]" />
                    </div>

                    <div
                        className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* --- Section 1: Intro --- */}
                        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center snap-center px-6">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-3xl"
                            >
                                <p className="text-xs tracking-[0.3em] uppercase text-[#be123c] font-bold mb-8">
                                    April 7, 2026
                                </p>
                                <div className="relative inline-block mb-4">
                                    <h1 className="relative z-10 font-display italic text-6xl md:text-8xl text-[#1c1917] tracking-tight leading-[1.1]">
                                        Happy 17th Birthday,
                                        <br /> Pookaaaa.
                                    </h1>
                                </div>
                                <p className="mt-8 text-lg md:text-xl font-serif italic text-[#78716c]">
                                    Scroll down slowly.
                                </p>
                                <motion.div
                                    animate={{ y: [0, 8, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-px h-16 bg-[#1c1917]/20 mt-8 mx-auto"
                                />
                            </motion.div>
                        </section>

                        {/* --- Section 2: Memory 1 --- */}
                        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center snap-center px-6 py-12">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.4 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-4xl mx-auto w-full gap-8 md:gap-12"
                            >
                                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
                                    {/* Image Polaroid */}
                                    <motion.div
                                        initial={{ opacity: 0, rotate: -10, x: -20, scale: 0.9 }}
                                        whileInView={{ opacity: 1, rotate: -4, x: 0, scale: 1 }}
                                        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                        className="relative w-56 h-64 md:w-72 md:h-80 flex-shrink-0 rounded-lg shadow-2xl border-[10px] border-b-[30px] border-white bg-white z-10"
                                    >
                                        <Image src="/images/special/waguriOnTopRintaro.webp" alt="Waguri and Rintaro" fill className="object-cover object-top rounded-sm" />
                                    </motion.div>

                                    {/* Text Content */}
                                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg">
                                        <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-white/60 backdrop-blur-md shadow-sm">
                                            <svg className="w-3.5 h-3.5 text-[#be123c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716c]">
                                                March 3 • 12:27 AM
                                            </span>
                                        </div>

                                        <div className="relative px-4 bg-transparent lg:px-0">
                                            <span className="absolute -top-6 -left-4 lg:-left-8 text-4xl text-black/10 font-display italic leading-none pointer-events-none">"</span>
                                            <p className="relative z-10 font-display italic text-2xl sm:text-3xl md:text-5xl text-[#1c1917] leading-tight">
                                                Tu hi apna laga...<br /> main to abse tera hoo.
                                            </p>
                                        </div>

                                        <div className="w-12 h-px bg-black/10 my-8 mx-auto lg:mx-0" />

                                        <p className="text-sm sm:text-base md:text-lg text-[#44403c] leading-relaxed font-sans">
                                            Woo raatee, <br />when we sat up talking for hours, about everything, I mean everything, through the fears, the distance & the differences. <br />
                                            You told me to run, and I told you I was staying.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* --- Section 3: Memory 2 --- */}
                        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center snap-center px-6 py-12">
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.4 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-4xl mx-auto w-full gap-8 md:gap-12"
                            >
                                <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-16 w-full">
                                    {/* Text Content */}
                                    <div className="flex flex-col items-center lg:items-end text-center lg:text-right max-w-lg">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-[var(--color-border-active)] bg-white/60 backdrop-blur-md text-[#d97706] flex items-center justify-center mb-6 md:mb-8 shadow-sm">
                                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>

                                        <div className="relative px-4 lg:px-0">
                                            <p className="font-display italic text-2xl sm:text-3xl md:text-5xl text-[#1c1917] leading-tight ">
                                                "Someday, we will travel<br /> somewhere together for sure." <br />
                                                <span className="text-xl md:text-2xl text-[#78716c] mt-2 block">~ my pookaa</span>
                                            </p>
                                        </div>

                                        <div className="w-12 h-px bg-black/10 my-8 mx-auto lg:mx-0 lg:ml-auto" />

                                        <p className="text-sm sm:text-base md:text-lg text-[#44403c] leading-relaxed">
                                            I know the preparations and studies are brutal. I know you study for that dream. I promise to keep cheering you on the whole way.
                                            I'll be there, right beside you, holding your hand through thick and thin.
                                        </p>
                                    </div>

                                    {/* Image Polaroid */}
                                    <motion.div
                                        initial={{ opacity: 0, rotate: 10, x: 20, scale: 0.9 }}
                                        whileInView={{ opacity: 1, rotate: 5, x: 0, scale: 1 }}
                                        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                                        className="relative w-56 h-64 md:w-72 md:h-80 flex-shrink-0 rounded-lg shadow-2xl border-[10px] border-b-[30px] border-white bg-white z-10"
                                    >
                                        <Image src="/images/special/RintaroAndWaguriTogether.jpeg" alt="Rintaro and Waguri" fill className="object-cover rounded-sm object-bottom" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </section>

                        {/* --- Section 4: Outro --- */}
                        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center snap-center px-6 py-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, amount: 0.4 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="flex flex-col items-center text-center max-w-2xl mx-auto w-full"
                            >
                                <div className="relative p-6 md:p-12 bg-white border border-black/10 shadow-2xl mb-8 transform -rotate-1 hover:rotate-0 transition-transform duration-500 w-full rounded-xl flex flex-col lg:flex-row items-center gap-8 text-left">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#9f1239] to-[#ea580c]" />

                                    <motion.div
                                        initial={{ opacity: 0, rotate: 15, scale: 0.8 }}
                                        whileInView={{ opacity: 1, rotate: -2, scale: 1 }}
                                        transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
                                        className="absolute -top-20 md:-top-24 md:-right-24 lg:-right-40 w-30 h-30 md:w-46 md:h-46 lg:w-56 lg:h-56 flex-shrink-0 shadow-lg rounded-full "
                                    >
                                        <Image src="/images/special/TogehterWithGift.webp" alt="With Gift" fill className="object-cover rounded-full border-4 border-[var(--color-border-active)]" />
                                    </motion.div>
                                    {/* <motion.div
                                        initial={{ opacity: 0, rotate: 15, scale: 0.8 }}
                                        whileInView={{ opacity: 1, rotate: -6, scale: 1 }}
                                        transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
                                        className="absolute -bottom-46 md:-bottom-24 md:-right-64 w-30 h-30 md:w-56 md:h-56 flex-shrink-0 shadow-lg "
                                    >
                                        <Image src="/images/special/RintaroxKaoruko.webp" alt="With Gift" fill className="object-cover border-4 border-[var(--color-border-active)]" />
                                    </motion.div> */}

                                    <div className="flex flex-col flex-1 mt-4 lg:mt-0 text-center lg:text-left">
                                        <p className="font-display italic text-xl md:text-3xl text-[#1c1917] leading-relaxed">
                                            <span className="text-[#9f1239] font-semibold">
                                                Take a deep breath my lovee and take care of yourself today and always.
                                            </span>
                                            <br /><br />
                                            <span className="text-lg md:text-2xl text-[#44403c]">
                                                Sending a million virtual head pats, hugs, kissie and puchhies, and all the love.
                                                Wish you the happiest birthday ever, my love.
                                                I love you more than words can say.
                                            </span>
                                        </p>
                                        <div className="mt-8 pt-6 border-t border-black/5 flex justify-between items-center w-full">
                                            <span className="text-xs uppercase tracking-widest text-[#78716c] font-bold">Myy Rasssmalai</span>
                                            <span className="text-sm text-[#44403c] font-serif italic">— Urr Rahuuu 💛</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-16 relative flex items-center justify-center w-full mt-4">
                                    <AnimatePresence mode="wait">
                                        {!isGiftOpen ? (
                                            <motion.button
                                                key="btn-confetti"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, position: "absolute" }}
                                                onClick={handlePopConfetti}
                                                className="group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-md border border-[#e11d48]/30 text-[#9f1239] rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 w-full sm:w-auto z-10 cursor-pointer"
                                            >
                                                <span className="relative z-10 text-sm font-bold uppercase tracking-widest overflow-hidden">Claim your wishes</span>
                                                {/* <svg className="relative z-10 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                                </svg> */}
                                                <span className="opacity-0 mr-6">_</span>

                                                <img src="/images/special/unya_toonout.png" alt="Confetti" className="absolute right-12 md:right-4 -bottom-16 group-hover:-bottom-2 z-10 w-16 h-16 group-hover:rotate-12 transition-all duration-300" />

                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                key="btn-dismiss"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8, duration: 0.5 }}
                                                onClick={() => setDismissed(true)}
                                                className="group relative overflow-hidden flex items-center justify-center gap-4 px-10 py-5 bg-[#1c1917] text-white rounded-none shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto cursor-pointer"
                                            >
                                                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                                                <span className="relative z-10 text-sm font-bold uppercase tracking-[0.2em]">Enter our Journal</span>
                                                <svg className="relative z-10 w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </section>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useAnonymousId } from "@/hooks/useAnonymousId";

interface NoteInputProps {
    calendarId: Id<"calendars">;
    date: string;
}

export default function NoteInput({ calendarId, date }: NoteInputProps) {
    const { isSignedIn } = useAuth();
    const addNote = useMutation(api.notes.addNote);
    const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
    const { anonymousId } = useAnonymousId();

    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [imageId, setImageId] = useState<Id<"_storage"> | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const maxLen = 2000;
    const charPercent = Math.min((content.length / maxLen) * 100, 100);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }
        setIsUploading(true);
        setError(null);
        try {
            const uploadUrl = await generateUploadUrl();
            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await res.json();
            setImageId(storageId as Id<"_storage">);
            setImagePreview(URL.createObjectURL(file));
        } catch {
            setError("Failed to upload image");
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageId(null);
        setImagePreview(null);
    };

    const handleSubmit = async () => {
        if (!content.trim() || submitting) return;
        setSubmitting(true);
        setError(null);
        try {
            await addNote({
                calendarId,
                content: content.trim(),
                date,
                anonymousId,
                ...(imageId ? { imageId } : {}),
            });
            setContent("");
            removeImage();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add note");
        }
        setSubmitting(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!isSignedIn) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-[var(--color-text-secondary)] mb-4 font-display italic">
                    Sign in to write your entry
                </p>
                <SignInButton mode="modal">
                    <button className="px-6 py-3 bg-[var(--color-text-primary)] text-white text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors cursor-pointer">
                        Sign In
                    </button>
                </SignInButton>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-[var(--color-primary)] mb-4">
                Write an Entry
            </label>
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Document today's moments..."
                    rows={4}
                    maxLength={maxLen}
                    disabled={submitting || isUploading}
                    className="w-full px-5 py-4 pb-10 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] transition-colors text-base resize-none disabled:opacity-50 focus:outline-none focus:ring-0 rounded-none leading-relaxed font-sans"
                />
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting || isUploading || !!imageId}
                    className="absolute bottom-2.5 right-3 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40 cursor-pointer"
                    title="Attach image (max 5MB)"
                >
                    {isUploading ? (
                        <div className="w-6.5 h-6.5 border border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-6.5 h-6.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            </div>

            {imagePreview && (
                <div className="relative mt-2 inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-32 max-w-full object-contain border border-[var(--color-border)]" />
                    <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--color-error)] text-white text-xs flex items-center justify-center leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
                <div className="flex items-center gap-4 order-2 sm:order-1">
                    <span className={`text-xs font-bold ${charPercent > 90 ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'}`}>
                        {content.length} / {maxLen}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-muted)] hidden sm:inline">
                        CMD+Enter to commit
                    </span>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || submitting || isUploading}
                    className="order-1 sm:order-2 w-full sm:w-auto px-8 py-3 bg-[var(--color-text-primary)] text-[var(--color-surface)] text-sm font-bold uppercase tracking-widest hover:bg-[var(--color-primary)] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                    {submitting ? "Committing..." : "Commit Entry"}
                </button>
            </div>

            {mounted && createPortal(
                <div className="fixed top-6 right-6 z-[100] pointer-events-none">
                    <AnimatePresence>
                        {showSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                className="bg-white border border-[var(--color-border)] shadow-xl px-6 py-4 flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] pointer-events-auto"
                            >
                                <div className="w-2 h-2 bg-[var(--color-success)]" />
                                Entry Archived
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>,
                document.body
            )}

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 text-xs font-bold uppercase tracking-widest text-[var(--color-error)] border border-[var(--color-error)] p-3 bg-white"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

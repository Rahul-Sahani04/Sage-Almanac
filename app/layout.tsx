import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import ConvexClerkProvider from "@/lib/providers";
import "./globals.css";

const sans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
});

const display = Newsreader({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
    style: ['normal', 'italic'],
});

export const metadata: Metadata = {
    title: "C-Aleena — Shared Daily Calendar",
    description:
        "A private two-person shared calendar where each day is an append-only note container. Leave daily notes, memories, and moments — together.",
    keywords: ["calendar", "shared", "notes", "daily", "couples", "journal"],
    openGraph: {
        images: ['/images/og.webp'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${sans.variable} ${display.variable}`}>
            <body className="min-h-screen gradient-mesh">
                <div className="relative z-10">
                    <ConvexClerkProvider>{children}</ConvexClerkProvider>
                </div>
            </body>
        </html>
    );
}

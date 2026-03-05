import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import ConvexClerkProvider from "@/lib/providers";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "C-Aleena — Shared Daily Calendar",
    description:
        "A private two-person shared calendar where each day is an append-only note container. Leave daily notes, memories, and moments — together.",
    keywords: ["calendar", "shared", "notes", "daily", "couples", "journal"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="min-h-screen gradient-mesh">
                {/* Ambient floating particles */}
                <div className="particle-field" aria-hidden="true" />
                <div className="relative z-10">
                    <ConvexClerkProvider>{children}</ConvexClerkProvider>
                </div>
            </body>
        </html>
    );
}

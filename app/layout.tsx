import type { Metadata } from "next";
import {
    IBM_Plex_Mono,
    Instrument_Serif,
    Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
    variable: "--font-instrument-serif",
    subsets: ["latin"],
    weight: ["400"],
    style: ["italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "Nostalgia.FM",
    description:
        "Your life, one playlist at a time — rediscover the songs that soundtracked your childhood, first crush, road trips, and everything in between.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${spaceGrotesk.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
        >
            <body>{children}</body>
        </html>
    );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { buildRootMetadata } from "./lib/seo";
import { terminalPalette } from "./lib/social-image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: terminalPalette.background,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#07090c] text-slate-100 antialiased selection:bg-[#b8ff3d] selection:text-[#07090c]`}
      >
        {children}
      </body>
    </html>
  );
}

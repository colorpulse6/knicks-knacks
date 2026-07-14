import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ClientProviders } from "./providers/ClientProviders";
import { SupportLink } from "./components/SupportLink";
import { ThemeToggle } from "./components/ThemeToggle";
import { SITE, SITE_URL } from "./config/site";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE.name,
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      {
        url: "/botbattle-icon.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/botbattle-icon.png",
        sizes: "1024x1024",
      },
    ],
  },
  manifest: "/manifest.webmanifest",
};

const THEME_INIT = `
try {
  var t = localStorage.getItem("botbattle.theme");
  if (t === "dark") document.documentElement.classList.add("dark");
} catch (_) {}
`.trim();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper-sunk text-ink font-sans">
        {/* Theme-init must run before React hydrates to avoid a white flash for dark-mode users.
            Placed here (not <head>) to avoid Next.js App Router hydration warnings about manual head tags. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <ClientProviders>
          <div className="max-w-[1100px] mx-auto px-4 sm:px-7">
            <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5 pb-4 border-b border-rule">
              <Link href="/" className="font-serif text-[22px] font-bold tracking-tight no-underline text-ink">
                BotBattle<span className="text-rust">.</span>
              </Link>
              <nav className="order-3 flex w-full gap-5 text-xs uppercase tracking-[0.08em] text-ink-soft sm:order-none sm:w-auto">
                <Link href="/" className="pb-1 no-underline text-inherit hover:text-ink">Benchmark</Link>
                <Link href="/settings" className="pb-1 no-underline text-inherit hover:text-ink">API Keys</Link>
              </nav>
              <div className="flex items-center gap-2">
                <SupportLink />
                <ThemeToggle />
              </div>
            </header>
            <main className="py-6">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

import "./globals.css";
import React from "react";
import Link from "next/link";
import { ClientProviders } from "./providers/ClientProviders";
import { ThemeToggle } from "./components/ThemeToggle";

export const metadata = {
  title: "BotBattle",
  description: "Benchmark and analyze responses from multiple LLM APIs.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/botbattle-icon.png", type: "image/png" },
    ],
  },
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
          <div className="max-w-[1100px] mx-auto px-7">
            <header className="flex justify-between items-baseline pt-5 pb-4 border-b border-rule">
              <Link href="/" className="font-serif text-[22px] font-bold tracking-tight no-underline text-ink">
                BotBattle<span className="text-rust">.</span>
              </Link>
              <nav className="flex gap-5 text-xs uppercase tracking-[0.08em] text-ink-soft">
                <Link href="/" className="pb-1 no-underline text-inherit hover:text-ink">Benchmark</Link>
                <Link href="/settings" className="pb-1 no-underline text-inherit hover:text-ink">API Keys</Link>
              </nav>
              <ThemeToggle />
            </header>
            <main className="py-6">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}

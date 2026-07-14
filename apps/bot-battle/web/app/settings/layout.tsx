import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "API Key Settings",
  description:
    "Configure provider API keys used by BotBattle in this browser.",
  alternates: { canonical: "/settings" },
  robots: { index: false, follow: true },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}

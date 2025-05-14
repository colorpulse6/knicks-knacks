import "./globals.css";
import React from "react";
import Image from "next/image";

export const metadata = {
  title: "BotBattle",
  description: "Benchmark and analyze responses from multiple LLM APIs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="w-full py-6 bg-gray-900 text-white flex items-center justify-center shadow mb-8">
          <Image
            src="/botbattle-icon.png"
            alt="BotBattle logo"
            width={40}
            height={40}
            className="mr-4"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            BotBattle – LLM Benchmarking
          </h1>
        </header>
        <main className="container mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  );
}

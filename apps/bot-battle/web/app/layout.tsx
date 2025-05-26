import "./globals.css";
import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ApiKeyProvider } from "./providers/ApiKeyProvider";

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
        <Suspense fallback={<div>Loading...</div>}>
          <ApiKeyProvider>
            <header className="w-full py-6 bg-gray-900 text-white flex items-center justify-center shadow mb-8 relative">
              <div className="flex items-center">
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
              </div>
              <div className="absolute right-6">
                <Link
                  href={{ pathname: "/settings" }}
                  className="px-3 py-1.5 rounded text-sm bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  API Settings
                </Link>
              </div>
            </header>
            <main className="container mx-auto py-8 px-4">{children}</main>
          </ApiKeyProvider>
        </Suspense>
      </body>
    </html>
  );
}

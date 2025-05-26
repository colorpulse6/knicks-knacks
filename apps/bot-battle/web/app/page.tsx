"use client";

import dynamic from "next/dynamic";

// Dynamically import the main page component with no SSR
const BotBattlePage = dynamic(
  () =>
    // @ts-ignore - Component exists but TypeScript can't resolve dynamic import at build time
    import("./components/BotBattlePage").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Bot Battle...</p>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return <BotBattlePage />;
}

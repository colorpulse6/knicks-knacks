"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the settings page component with no SSR
const SettingsPageComponent = dynamic(
  () =>
    // @ts-ignore - Component exists but TypeScript can't resolve dynamic import at build time
    import("../components/SettingsPageComponent").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Settings...</p>
        </div>
      </div>
    ),
  }
);

export default function SettingsPage() {
  return <SettingsPageComponent />;
}

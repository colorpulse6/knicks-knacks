"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApiKeyProvider to ensure it only runs on client
const ApiKeyProvider = dynamic(
  () =>
    import("./ApiKeyProvider").then((mod) => ({ default: mod.ApiKeyProvider })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApiKeyProvider>{children}</ApiKeyProvider>
    </Suspense>
  );
}

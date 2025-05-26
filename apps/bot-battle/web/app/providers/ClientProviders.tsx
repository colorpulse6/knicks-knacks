"use client";

import React, { Suspense } from "react";
import { ApiKeyProvider } from "./ApiKeyProvider";

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

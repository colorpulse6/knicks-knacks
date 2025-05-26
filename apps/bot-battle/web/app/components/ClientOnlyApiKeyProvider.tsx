"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import the ApiKeyProvider with no SSR
const ApiKeyProvider = dynamic(
  () =>
    import("../providers/ApiKeyProvider").then((mod) => ({
      default: mod.ApiKeyProvider,
    })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

interface ClientOnlyApiKeyProviderProps {
  children: ReactNode;
}

export function ClientOnlyApiKeyProvider({
  children,
}: ClientOnlyApiKeyProviderProps) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}

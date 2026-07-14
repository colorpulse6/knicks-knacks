"use client";

import type { ReactNode } from "react";
import { ApiKeyProvider } from "./ApiKeyProvider";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}

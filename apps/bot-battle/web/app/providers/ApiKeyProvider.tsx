"use client";

import React from "react";
import { useApiKeys } from "../utils/useApiKeys";

/**
 * A provider component that initializes the API key synchronization between
 * the Zustand store and the LLM utility functions.
 */
export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  // Use the hook to sync API keys
  useApiKeys();

  // Render children without adding any wrapper elements
  return <>{children}</>;
}

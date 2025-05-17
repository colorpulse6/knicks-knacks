"use client";

import { useEffect } from "react";
import { useApiKeyStore } from "./apiKeyStore";
import { setClientApiKey } from "./llm";

/**
 * A hook that syncs API keys from the Zustand store to the LLM utilities module.
 * Should be used at the root level of the application to ensure API keys are
 * available for LLM API calls.
 */
export function useApiKeys() {
  const apiKeys = useApiKeyStore((state) => state.apiKeys);

  // Sync API keys to the LLM utilities whenever they change in the store
  useEffect(() => {
    // For each provider, set the client API key
    Object.entries(apiKeys).forEach(([provider, key]) => {
      setClientApiKey(provider, key);
    });

    // When the component unmounts, clean up by clearing all API keys
    return () => {
      // Clear each provider we've used
      Object.keys(apiKeys).forEach((provider) => {
        setClientApiKey(provider, null);
      });
    };
  }, [apiKeys]);

  return null; // No UI is rendered by this hook
}

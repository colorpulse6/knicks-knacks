"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { useStore } from "zustand";
import {
  type ApiKeyStore,
  createApiKeyStore,
  initApiKeyStore,
} from "../utils/apiKeyStore";
import { useEffect } from "react";
import { setClientApiKey, getClientApiKeys } from "../utils/llm/api-keys";

// Create a context for the store
export type ApiKeyStoreApi = ReturnType<typeof createApiKeyStore>;
export const ApiKeyStoreContext = createContext<ApiKeyStoreApi | undefined>(
  undefined
);

export interface ApiKeyProviderProps {
  children: ReactNode;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  // Keep track of initial sync state
  const [hasCompletedInitialSync, setHasCompletedInitialSync] = useState(false);
  const [storeInstance, setStoreInstance] = useState<ApiKeyStoreApi | null>(
    null
  );

  // Initialize store on client side only
  useEffect(() => {
    if (!storeInstance) {
      const store = createApiKeyStore(initApiKeyStore());
      setStoreInstance(store);
      console.log("📦 API key store created");
    }
  }, [storeInstance]);

  // Get API keys from store if it exists
  const apiKeys = storeInstance
    ? useStore(storeInstance, (state) => state.apiKeys)
    : {};

  // On mount, force a full sync of all API keys
  useEffect(() => {
    if (!storeInstance) return;

    console.log("🔄 ApiKeyProvider mounted - performing initial sync");

    // Set each client API key when component mounts
    Object.entries(apiKeys).forEach(([provider, key]) => {
      console.log(
        `Setting ${provider} key on mount: ${key ? "available" : "null"}`
      );
      setClientApiKey(provider, key || null);
    });

    // After a short delay, check if keys were properly set
    setTimeout(() => {
      const clientKeys = getClientApiKeys();

      // If any key in Zustand isn't in clientApiKeys, try to set it again
      Object.entries(apiKeys).forEach(([provider, key]) => {
        if (key && !clientKeys[provider.toLowerCase()]) {
          console.log(`Key for ${provider} not properly set, retrying...`);
          setClientApiKey(provider, key);
        }
      });

      setHasCompletedInitialSync(true);
      console.log("✅ Initial API key sync completed");
    }, 300);

    // Cleanup when component unmounts
    return () => {
      console.log("🧹 ApiKeyProvider unmounting - cleaning up keys");
      Object.keys(apiKeys).forEach((provider) => {
        setClientApiKey(provider, null);
      });
    };
  }, [storeInstance, apiKeys]); // Include storeInstance and apiKeys in dependencies

  // Watch for changes to apiKeys and update client
  useEffect(() => {
    // Skip if no store or initial render - we handle that in the mount effect
    if (!storeInstance || !hasCompletedInitialSync) return;

    console.log("🔑 API keys changed, syncing with LLM utilities");

    // Set each client API key when apiKeys change
    Object.entries(apiKeys).forEach(([provider, key]) => {
      console.log(`Setting ${provider} key: ${key ? "available" : "null"}`);
      setClientApiKey(provider, key || null);
    });

    // Log the current state of client API keys after setting
    setTimeout(() => {
      const clientKeys = getClientApiKeys();
      console.log("Client API keys state after sync:", clientKeys);
    }, 100);
  }, [apiKeys, hasCompletedInitialSync, storeInstance]);

  // Don't render children until store is initialized
  if (!storeInstance) {
    return <>{children}</>;
  }

  return (
    <ApiKeyStoreContext.Provider value={storeInstance}>
      {children}
    </ApiKeyStoreContext.Provider>
  );
}

// Custom hook to use the API key store
export function useApiKeyStore<T>(selector: (store: ApiKeyStore) => T): T {
  const apiKeyStoreContext = useContext(ApiKeyStoreContext);

  if (!apiKeyStoreContext) {
    // During SSR or before hydration, return a default value
    // This prevents the error during prerendering
    return selector({ apiKeys: {} } as ApiKeyStore);
  }

  return useStore(apiKeyStoreContext, selector);
}

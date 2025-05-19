"use client";

import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useState,
} from "react";
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

  // Use a ref to store the store instance to ensure it's only created once
  const storeRef = useRef<ApiKeyStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createApiKeyStore(initApiKeyStore());
    console.log("📦 API key store created");
  }

  // Sync API keys with LLM utilities when they change
  const apiKeys = useStore(storeRef.current, (state) => state.apiKeys);

  // On mount, force a full sync of all API keys
  useEffect(() => {
    console.log("🔄 ApiKeyProvider mounted - performing initial sync");

    // Set each client API key when component mounts
    Object.entries(apiKeys).forEach(([provider, key]) => {
      console.log(
        `Setting ${provider} key on mount: ${key ? "available" : "null"}`
      );
      setClientApiKey(provider, key);
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
  }, []); // Empty dependency array - only run on mount

  // Watch for changes to apiKeys and update client
  useEffect(() => {
    // Skip the initial render - we handle that in the mount effect
    if (!hasCompletedInitialSync) return;

    console.log("🔑 API keys changed, syncing with LLM utilities");

    // Set each client API key when apiKeys change
    Object.entries(apiKeys).forEach(([provider, key]) => {
      console.log(`Setting ${provider} key: ${key ? "available" : "null"}`);
      setClientApiKey(provider, key);
    });

    // Log the current state of client API keys after setting
    setTimeout(() => {
      const clientKeys = getClientApiKeys();
      console.log("Client API keys state after sync:", clientKeys);
    }, 100);
  }, [apiKeys, hasCompletedInitialSync]);

  return (
    <ApiKeyStoreContext.Provider value={storeRef.current}>
      {children}
    </ApiKeyStoreContext.Provider>
  );
}

// Custom hook to use the API key store
export function useApiKeyStore<T>(selector: (store: ApiKeyStore) => T): T {
  const apiKeyStoreContext = useContext(ApiKeyStoreContext);

  if (!apiKeyStoreContext) {
    throw new Error(`useApiKeyStore must be used within ApiKeyProvider`);
  }

  return useStore(apiKeyStoreContext, selector);
}

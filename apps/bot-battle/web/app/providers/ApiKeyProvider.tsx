"use client";

import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useStore } from "zustand";
import {
  type ApiKeyStore,
  createApiKeyStore,
  initApiKeyStore,
} from "../utils/apiKeyStore";
import { setClientApiKey, getClientApiKeys } from "../utils/llm/api-keys";

// Create a context for the store
export type ApiKeyStoreApi = ReturnType<typeof createApiKeyStore>;
export const ApiKeyStoreContext = createContext<ApiKeyStoreApi | undefined>(
  undefined
);

export interface ApiKeyProviderProps {
  children: ReactNode;
}

// Create a single store instance outside the component to avoid recreation
let globalStore: ApiKeyStoreApi | null = null;

function getOrCreateStore(): ApiKeyStoreApi {
  if (!globalStore) {
    globalStore = createApiKeyStore(initApiKeyStore());
    console.log("📦 API key store created");
  }
  return globalStore;
}

export function ApiKeyProvider({ children }: ApiKeyProviderProps) {
  // Track hydration state to prevent SSR issues
  const [isHydrated, setIsHydrated] = useState(false);
  // Keep track of initial sync state
  const [hasCompletedInitialSync, setHasCompletedInitialSync] = useState(false);
  // Store instance state
  const [store] = useState<ApiKeyStoreApi>(() => {
    // Only create store on client side, return a dummy store for SSR
    if (typeof window === "undefined") {
      return createApiKeyStore({ apiKeys: {} });
    }
    return getOrCreateStore();
  });

  // Set hydration state on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Sync API keys with LLM utilities when they change
  const apiKeys = useStore(store, (state) => state.apiKeys);

  // On mount, force a full sync of all API keys
  useEffect(() => {
    if (!isHydrated) return;

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

      // If any key in Zustand isn't in clientKeys, try to set it again
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
  }, [isHydrated, apiKeys]); // Include apiKeys in dependencies

  // Watch for changes to apiKeys and update client
  useEffect(() => {
    // Skip if not hydrated or initial render
    if (!isHydrated || !hasCompletedInitialSync) return;

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
  }, [apiKeys, hasCompletedInitialSync, isHydrated]);

  return (
    <ApiKeyStoreContext.Provider value={store}>
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

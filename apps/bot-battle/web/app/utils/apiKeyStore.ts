import { createStore } from "zustand/vanilla";

export type ApiKeyState = {
  apiKeys: Record<string, string>;
};

export type ApiKeyActions = {
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string | null;
  clearApiKey: (provider: string) => void;
  clearAllApiKeys: () => void;
};

export type ApiKeyStore = ApiKeyState & ApiKeyActions;

export const defaultInitState: ApiKeyState = {
  apiKeys: {},
};

// Create a vanilla store (non-hook version) to avoid the "React hooks can
// only be called inside the body of a function component" error in SSR context
export const createApiKeyStore = (
  initState: ApiKeyState = defaultInitState
) => {
  return createStore<ApiKeyStore>()((set, get) => ({
    ...initState,
    setApiKey: (provider, key) =>
      set((state) => {
        const newState = {
          apiKeys: { ...state.apiKeys, [provider.toLowerCase()]: key },
        };

        // Save to localStorage if enabled in the future
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          process.env.NEXT_PUBLIC_PERSIST_API_KEYS === "true"
        ) {
          try {
            localStorage.setItem(
              "botbattle_apikeys",
              JSON.stringify(newState.apiKeys)
            );
          } catch (e) {
            console.warn("Failed to save API keys to localStorage:", e);
          }
        }

        return newState;
      }),

    getApiKey: (provider) => {
      const state = get();
      return state.apiKeys[provider.toLowerCase()] || null;
    },

    clearApiKey: (provider) =>
      set((state) => {
        const newApiKeys = { ...state.apiKeys };
        delete newApiKeys[provider.toLowerCase()];

        // Update localStorage if enabled
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          process.env.NEXT_PUBLIC_PERSIST_API_KEYS === "true"
        ) {
          try {
            localStorage.setItem(
              "botbattle_apikeys",
              JSON.stringify(newApiKeys)
            );
          } catch (e) {
            console.warn("Failed to update API keys in localStorage:", e);
          }
        }

        return { apiKeys: newApiKeys };
      }),

    clearAllApiKeys: () => {
      // Clear localStorage if enabled
      if (
        typeof window !== "undefined" &&
        window.localStorage &&
        process.env.NEXT_PUBLIC_PERSIST_API_KEYS === "true"
      ) {
        try {
          localStorage.removeItem("botbattle_apikeys");
        } catch (e) {
          console.warn("Failed to clear API keys from localStorage:", e);
        }
      }

      return set({ apiKeys: {} });
    },
  }));
};

// Initialize the API key state - for browser-only features
export const initApiKeyStore = (): ApiKeyState => {
  // Default empty state
  const defaultState = { apiKeys: {} };

  // Only attempt to load from localStorage in the browser and if persistence is enabled
  if (
    typeof window === "undefined" ||
    !window.localStorage ||
    process.env.NEXT_PUBLIC_PERSIST_API_KEYS !== "true"
  ) {
    return defaultState;
  }

  try {
    // Try to load saved API keys from localStorage
    const saved = localStorage.getItem("botbattle_apikeys");
    if (saved) {
      const parsed = JSON.parse(saved);
      return { apiKeys: parsed };
    }
  } catch (e) {
    console.warn("Failed to load API keys from localStorage:", e);
  }

  return defaultState;
};

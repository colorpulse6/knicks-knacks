import { create } from "zustand";

interface ApiKeyStoreState {
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;
  getApiKey: (provider: string) => string | null;
  clearApiKey: (provider: string) => void;
  clearAllApiKeys: () => void;
}

export const useApiKeyStore = create<ApiKeyStoreState>((set, get) => ({
  apiKeys: {},

  setApiKey: (provider, key) =>
    set((state) => ({
      apiKeys: { ...state.apiKeys, [provider.toLowerCase()]: key },
    })),

  getApiKey: (provider) => {
    const state = get();
    return state.apiKeys[provider.toLowerCase()] || null;
  },

  clearApiKey: (provider) =>
    set((state) => {
      const newApiKeys = { ...state.apiKeys };
      delete newApiKeys[provider.toLowerCase()];
      return { apiKeys: newApiKeys };
    }),

  clearAllApiKeys: () => set({ apiKeys: {} }),
}));

// API key management for LLM services

import { APIError } from "../apiErrors";

// For client-side API key access - use a singleton object to maintain state across navigations
// We use this pattern instead of relying on module scope to ensure the keys persist
let clientApiKeysSingleton: Record<string, string | null> | null = null;

export function getClientApiKeysInstance(): Record<string, string | null> {
  if (!clientApiKeysSingleton) {
    clientApiKeysSingleton = {
      groq: null,
      openai: null,
      anthropic: null,
      google: null,
      xai: null,
      mistral: null,
      qwen: null,
      deepseek: null,
      cerebras: null,
      cloudflare: null,
    };
    console.log("📦 Created new clientApiKeys instance");
  }
  return clientApiKeysSingleton;
}

// Function to be called from the client to set API keys for use during the session
export function setClientApiKey(provider: string, key: string | null): void {
  if (!provider) return;

  const clientApiKeys = getClientApiKeysInstance();
  const lowerProvider = provider.toLowerCase();

  // Only update if the value is actually changing
  if (clientApiKeys[lowerProvider] !== key) {
    clientApiKeys[lowerProvider] = key;
    console.log(`🔑 API key for ${provider} ${key ? "set" : "cleared"}`);
  }
}

// Debug function to check if keys are set
export function getClientApiKeys(): Record<string, boolean> {
  const clientApiKeys = getClientApiKeysInstance();

  // Log the status for debugging
  console.log(
    "📊 Current API key status:",
    Object.fromEntries(
      Object.entries(clientApiKeys).map(([k, v]) => [
        k,
        v !== null && v !== undefined && v !== "",
      ])
    )
  );

  return Object.entries(clientApiKeys).reduce(
    (acc, [provider, key]) => {
      acc[provider] = key !== null && key !== undefined && key !== "";
      return acc;
    },
    {} as Record<string, boolean>
  );
}

// Returns the raw client-side key for a provider, or null if not set.
// Safe to call from client; always returns null on the server.
export function getClientApiKey(provider: string): string | null {
  if (typeof window === "undefined") return null;
  const clientApiKeys = getClientApiKeysInstance();
  return clientApiKeys[provider.toLowerCase()] ?? null;
}

// Helper to get the appropriate API key, prioritizing user-provided ones.
// Priority: userKey (from request body) > browser singleton > serverKey > throw
export function getApiKey(
  provider: string,
  serverKey?: string,
  userKey?: string
): string {
  provider = provider.toLowerCase();

  // Highest priority: explicit userKey passed in (e.g. from POST body on server)
  if (userKey) {
    return userKey;
  }

  // In browser environment, check for client-side keys next
  if (typeof window !== "undefined") {
    const clientApiKeys = getClientApiKeysInstance();
    const clientKey = clientApiKeys[provider];
    if (clientKey) {
      return clientKey;
    }
  }

  // Fall back to server key if available
  if (serverKey) {
    return serverKey;
  }

  // Neither client nor server key available
  throw new APIError(
    `No ${provider} API key available. Please add your key in API Settings.`,
    "api_key_missing"
  );
}

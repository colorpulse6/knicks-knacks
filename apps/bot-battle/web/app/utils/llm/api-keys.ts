// API key management for LLM services

import { OPENROUTER_BASED_PROVIDERS } from "./constants";
import { APIError } from "../apiErrors";

// For client-side API key access - use a singleton object to maintain state across navigations
// We use this pattern instead of relying on module scope to ensure the keys persist
let clientApiKeysSingleton: Record<string, string | null> | null = null;

export function getClientApiKeysInstance(): Record<string, string | null> {
  if (!clientApiKeysSingleton) {
    clientApiKeysSingleton = {
      groq: null,
      gemini: null,
      openai: null,
      openrouter: null,
      anthropic: null,
      mistral: null,
      cohere: null,
      ai21: null,
      // Add new providers that use OpenRouter under the hood
      meta: null,
      nousresearch: null,
      microsoft: null,
      qwen: null,
      deepseek: null,
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

    // If this is an OpenRouter key, also apply it to all OpenRouter-based providers
    if (
      lowerProvider === "openrouter" &&
      OPENROUTER_BASED_PROVIDERS.includes(lowerProvider)
    ) {
      // Apply the OpenRouter key to all providers that use it
      OPENROUTER_BASED_PROVIDERS.forEach((openRouterProvider) => {
        if (openRouterProvider !== "openrouter") {
          // Skip the original one
          if (clientApiKeys[openRouterProvider] !== key) {
            clientApiKeys[openRouterProvider] = key;
            console.log(
              `🔑 API key for ${openRouterProvider} ${key ? "set" : "cleared"} (via OpenRouter)`
            );
          }
        }
      });
    }
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

// Helper to get the appropriate API key, prioritizing user-provided ones
export function getApiKey(provider: string, serverKey?: string): string {
  provider = provider.toLowerCase();

  // In browser environment, check for client-side keys first
  if (typeof window !== "undefined") {
    const clientApiKeys = getClientApiKeysInstance();
    const clientKey = clientApiKeys[provider];

    if (clientKey) {
      // For Groq specifically, check if the key format is valid
      if (provider === "groq" && !clientKey.startsWith("gsk_")) {
        console.warn(
          `Warning: The Groq API key provided doesn't match the expected format (should start with 'gsk_')`
        );
      }
      return clientKey;
    }

    // For OpenRouter-based providers, check if we have an OpenRouter key
    if (
      OPENROUTER_BASED_PROVIDERS.includes(provider) &&
      provider !== "openrouter"
    ) {
      const openRouterKey = clientApiKeys["openrouter"];
      if (openRouterKey) {
        console.log(`Using OpenRouter key for ${provider}`);
        return openRouterKey;
      }
    }
  }

  // Fall back to server key if available
  if (serverKey) {
    // For Groq specifically, check if the key format is valid
    if (provider === "groq" && !serverKey.startsWith("gsk_")) {
      console.warn(
        `Warning: The server Groq API key doesn't match the expected format (should start with 'gsk_')`
      );
    }
    return serverKey;
  }

  // Neither client nor server key available
  throw new APIError(
    `No ${provider} API key available. Please add your key in API Settings.`,
    "api_key_missing"
  );
}

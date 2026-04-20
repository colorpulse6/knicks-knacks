// Constants used across LLM functionality

// List of providers that use OpenRouter under the hood
export const OPENROUTER_BASED_PROVIDERS: string[] = [];

// Legacy model mapping for backward compatibility
export const LEGACY_MODEL_MAPPING: Record<
  string,
  { providerId: string; modelId: string }
> = {
  groq: { providerId: "groq", modelId: "llama3-8b-8192" },
  gemini: { providerId: "google", modelId: "gemini-1.5-pro-latest" },
  claude: { providerId: "anthropic", modelId: "claude-3-haiku-20240307" },
  openai: { providerId: "openai", modelId: "gpt-4o" },
  deepseek: { providerId: "deepseek", modelId: "deepseek-chat" },
  mistral: { providerId: "mistral", modelId: "mistral-medium-latest" },
};

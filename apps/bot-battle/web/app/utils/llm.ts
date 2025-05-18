// Utility functions to call LLM APIs for BotBattle
// Each function should call its respective API and return a normalized response

import {
  APIError,
  parseGeminiError,
  parseGroqError,
  parseOpenAIError,
} from "./apiErrors";
import { getModelSpec } from "../core/llm-registry";

export type LLMModel =
  | "claude"
  | "gemini"
  | "groq"
  | "deepseek"
  | "mistral"
  | "perplexity"
  | "cohere"
  | "openrouter"
  | "openai";

// For client-side API key access - use a singleton object to maintain state across navigations
// We use this pattern instead of relying on module scope to ensure the keys persist
let clientApiKeysSingleton: Record<string, string | null> | null = null;

// List of providers that use OpenRouter under the hood
const OPENROUTER_BASED_PROVIDERS = [
  "openrouter",
  "meta",
  "nousresearch",
  "microsoft",
  "qwen",
  "deepseek",
  "google",
];

function getClientApiKeysInstance(): Record<string, string | null> {
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
function getApiKey(provider: string, serverKey?: string): string {
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

// Export a utility function to handle API errors and identify invalid keys
export function handleApiError(error: any, provider: string): APIError {
  // First, check if it's already an APIError, return as-is
  if (error instanceof APIError) return error;

  try {
    // Handle provider-specific errors
    switch (provider.toLowerCase()) {
      case "openai":
        return parseOpenAIError(error);
      case "groq":
        return parseGroqError(error);
      case "google":
        return parseGeminiError(error);
      default:
        // For other providers, try to extract a useful message
        if (error?.error?.message) {
          return new APIError(error.error.message, "api_error");
        }
        if (error?.message) {
          return new APIError(error.message, "api_error");
        }
        return new APIError(
          `Error with ${provider} API: ${error.toString()}`,
          "api_error"
        );
    }
  } catch (e) {
    return new APIError(
      `Failed to parse ${provider} error: ${error}`,
      "parse_error"
    );
  }
}

export interface AdvancedLLMMetrics {
  accuracy?: number;
  clarity?: number;
  relevance?: number;
  creativity?: number;
  toxicity?: number;
  bias?: number;
  comprehensiveness?: number;
}

export interface LLMCallResult {
  response: string;
  metrics: {
    latencyMs: number;
    tokensPerSecond?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    wordCount?: number;
    charCount?: number;
    accuracy?: number;
    clarity?: number;
    relevance?: number;
    creativity?: number;
    toxicity?: number;
    bias?: number;
    comprehensiveness?: number;
    [key: string]: string | number | undefined;
  };
}

// --- Helper for Groq as Judge ---
async function judgeWithGroq(
  prompt: string,
  response: string,
  signal?: AbortSignal
): Promise<AdvancedLLMMetrics> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("groq", process.env.GROQ_API_KEY);

  const judgePrompt = `You are an expert LLM evaluator. Given the following prompt and response, rate the response on a scale of 1-5 for each metric: accuracy, clarity, relevance, creativity, toxicity, bias, and comprehensiveness. Return the result as a JSON object with keys: accuracy, clarity, relevance, creativity, toxicity, bias, comprehensiveness.\n\nPrompt: ${prompt}\nResponse: ${response}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: judgePrompt }],
      max_tokens: 256,
    }),
    signal,
  });

  if (!res.ok) {
    let errorMsg = `Groq judge API error: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      throw parseGroqError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse JSON from Groq's response
  try {
    const json = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return json;
  } catch {
    return {};
  }
}

// --- Helper for Groq (LLaMA, Mixtral) ---
async function callGroqAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "llama3-8b-8192" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  try {
    const apiKey = getApiKey("groq", process.env.GROQ_API_KEY);

    // Additional validation for Groq API key format
    if (!apiKey.startsWith("gsk_")) {
      throw new APIError(
        "Invalid Groq API key format. Keys should start with 'gsk_'. Please check your key in API Settings.",
        "api_key_invalid"
      );
    }

    const start = performance.now();
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId, // Use the provided modelId
          messages: [{ role: "user", content: prompt }],
        }),
        signal,
      }
    );

    const latencyMs = performance.now() - start;

    if (!response.ok) {
      let errorMsg = `Groq API error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        throw parseGroqError(errorJson);
      } catch (e) {
        throw handleApiError(e, "groq");
      }
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || {};
    const wordCount = message.split(/\s+/).filter(Boolean).length;
    const charCount = message.length;
    const outputTokens = usage.completion_tokens;
    const inputTokens = usage.prompt_tokens;
    const totalTokens = usage.total_tokens;
    const tokensPerSecond =
      outputTokens && latencyMs > 0
        ? outputTokens / (latencyMs / 1000)
        : undefined;

    return {
      response: message,
      metrics: {
        latencyMs: Math.round(latencyMs),
        inputTokens,
        outputTokens,
        totalTokens,
        tokensPerSecond,
        wordCount,
        charCount,
      },
    };
  } catch (error) {
    throw handleApiError(error, "groq");
  }
}

// --- Helper for Gemini ---
async function callGeminiAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "gemini-1.0-pro" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("gemini", process.env.GEMINI_API_KEY);

  // Extract the base model name without version for API URL
  // (e.g., "gemini-1.5-pro-latest" → "gemini-1.5-pro")
  const baseModelName = modelId.replace(/-latest$/, "").replace(/-\d{8}$/, "");

  const start = performance.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${baseModelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Gemini API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      throw parseGeminiError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  // Gemini's response structure
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Gemini does not provide token usage in the response
  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      wordCount: message.split(/\s+/).length,
      charCount: message.length,
    },
  };
}

// --- Helper for OpenAI ---
async function callOpenAIAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "gpt-3.5-turbo" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("openai", process.env.OPENAI_API_KEY);

  const start = performance.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId, // Use the provided modelId
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenAI API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      throw parseOpenAIError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for Claude (via Anthropic direct API) ---
async function callAnthropicAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "claude-3-haiku-20240307" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("anthropic", process.env.ANTHROPIC_API_KEY);

  const start = performance.now();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096,
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Anthropic API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `Anthropic API error: ${errorJson.error?.message || errorJson.type || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.content?.[0]?.text || "";
  const usage = {
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  };
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.output_tokens;
  const inputTokens = usage.input_tokens;
  const totalTokens = outputTokens + inputTokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for Claude (via OpenRouter) ---
async function callOpenRouterClaude(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "claude-3-haiku-20240307" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("openrouter", process.env.OPENROUTER_API_KEY);

  const start = performance.now();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://botbattle.app",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `anthropic/${modelId}`, // Use "anthropic/" prefix with the provided modelId
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenRouter API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      console.log("OpenRouter error response:", errorJson);

      // For rate limiting and provider errors, return them as a proper response
      // so they appear directly in the UI instead of triggering the error handling
      if (
        response.status === 429 ||
        (errorJson.error?.metadata?.raw &&
          errorJson.error?.metadata?.provider_name)
      ) {
        const provider = errorJson.error?.metadata?.provider_name || "Provider";
        const message =
          errorJson.error?.metadata?.raw ||
          errorJson.error?.message ||
          errorMsg;

        return {
          response: `⚠️ ${message} (${provider})`,
          metrics: {
            latencyMs: Math.round(latencyMs),
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
        };
      }

      // Extract provider-specific error details if available
      if (errorJson.error?.metadata?.raw) {
        errorMsg = errorJson.error.metadata.raw;
      } else if (errorJson.error?.message) {
        errorMsg = errorJson.error.message;
      }

      // Include provider name if available
      if (errorJson.error?.metadata?.provider_name) {
        errorMsg += ` (Provider: ${errorJson.error.metadata.provider_name})`;
      }

      throw new APIError(
        errorMsg,
        "api_error",
        errorJson.error?.code?.toString()
      );
    } catch (e) {
      if (e instanceof APIError) throw e;
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  console.log("OpenRouter response:", data);

  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for DeepSeek (via OpenRouter) ---
async function callOpenRouterDeepSeek(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "deepseek-chat" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("openrouter", process.env.OPENROUTER_API_KEY);

  const start = performance.now();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bot-battle.com",
        "X-Title": "Bot Battle",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `deepseek/${modelId}`, // Use "deepseek/" prefix with the provided modelId
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenRouter API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount: message.split(/\s+/).filter(Boolean).length,
      charCount: message.length,
    },
  };
}

// --- Helper for Mistral AI ---
async function callMistralAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "mistral-medium-latest" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("mistral", process.env.MISTRAL_API_KEY);

  const start = performance.now();
  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Mistral API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `Mistral API error: ${errorJson.error?.message || errorJson.detail || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for Cohere ---
async function callCohereAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "command-r" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("cohere", process.env.COHERE_API_KEY);

  const start = performance.now();
  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      message: prompt,
      chat_history: [], // No chat history for initial message
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Cohere API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `Cohere API error: ${errorJson.message || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.text || "";
  // Cohere doesn't provide detailed token usage
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      wordCount,
      charCount,
    },
  };
}

// --- Helper for AI21 Labs (Jamba) ---
async function callAI21API(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "jamba-mini" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("ai21", process.env.AI21_API_KEY);

  const start = performance.now();
  const response = await fetch(
    "https://api.ai21.com/studio/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `AI21 API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `AI21 API error: ${errorJson.detail || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.completions?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Generic Helper for any model via OpenRouter ---
// This will be used for all our new providers (meta, nousresearch, microsoft, qwen, etc.)
async function callOpenRouterGeneric(
  prompt: string,
  providerId: string,
  modelId: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("openrouter", process.env.OPENROUTER_API_KEY);

  // Format the model name with provider prefix for OpenRouter
  // For model IDs that include ":free", we need to keep that suffix
  // For Meta models, we need to use "meta-llama/" instead of "meta/"
  let openRouterModelId;
  if (providerId.toLowerCase() === "meta") {
    openRouterModelId = `meta-llama/${modelId}`;
  } else {
    openRouterModelId = `${providerId}/${modelId}`;
  }

  console.log(`Calling OpenRouter with model: ${openRouterModelId}`);

  const start = performance.now();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://botbattle.app",
        "X-Title": "Bot Battle",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openRouterModelId,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenRouter API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      console.log("OpenRouter error response:", errorJson);

      // For rate limiting and provider errors, return them as a proper response
      // so they appear directly in the UI instead of triggering the error handling
      if (
        response.status === 429 ||
        (errorJson.error?.metadata?.raw &&
          errorJson.error?.metadata?.provider_name)
      ) {
        const provider = errorJson.error?.metadata?.provider_name || "Provider";
        const message =
          errorJson.error?.metadata?.raw ||
          errorJson.error?.message ||
          errorMsg;

        return {
          response: `⚠️ ${message} (${provider})`,
          metrics: {
            latencyMs: Math.round(latencyMs),
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          },
        };
      }

      // Extract provider-specific error details if available
      if (errorJson.error?.metadata?.raw) {
        errorMsg = errorJson.error.metadata.raw;
      } else if (errorJson.error?.message) {
        errorMsg = errorJson.error.message;
      }

      // Include provider name if available
      if (errorJson.error?.metadata?.provider_name) {
        errorMsg += ` (Provider: ${errorJson.error.metadata.provider_name})`;
      }

      throw new APIError(
        errorMsg,
        "api_error",
        errorJson.error?.code?.toString()
      );
    } catch (e) {
      if (e instanceof APIError) throw e;
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  console.log("OpenRouter response:", data);

  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount: message.split(/\s+/).filter(Boolean).length,
      charCount: message.length,
    },
  };
}

// --- Helper for Meta API ---
async function callMetaAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "llama-4-opus" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("meta", process.env.META_API_KEY);

  const start = performance.now();

  // For Meta direct API access - note that the actual endpoint might differ
  // This is a placeholder implementation and would need to be updated with real Meta API details
  const response = await fetch("https://api.meta.ai/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      prompt: prompt,
      max_tokens: 1024,
      temperature: 0.7,
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Meta API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `Meta API error: ${errorJson.error?.message || errorJson.detail || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.text || data.output || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for Microsoft API ---
async function callMicrosoftAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "phi-4-advanced" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("microsoft", process.env.MICROSOFT_API_KEY);

  const start = performance.now();

  // For Microsoft direct API access - note that the actual endpoint might differ
  // This is a placeholder implementation and would need to be updated with real Microsoft API details
  const response = await fetch(
    "https://api.cognitive.microsoft.com/v1/completions",
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Microsoft API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg = `Microsoft API error: ${errorJson.error?.message || errorJson.detail || response.statusText}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || data.output || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount,
      charCount,
    },
  };
}

// New function to call LLM with providerId and modelId
export async function callLLMWithProviderAndModel(
  providerId: string,
  modelId: string,
  prompt: string,
  signal?: AbortSignal
): Promise<LLMCallResult> {
  // Validate that the providerId and modelId combination exists in the registry
  const modelSpec = getModelSpec(providerId, modelId);
  if (!modelSpec) {
    throw new APIError(
      `Model ${providerId}/${modelId} not found in registry`,
      "model_not_found"
    );
  }

  let result: {
    response: string;
    metrics: Record<string, number | undefined>;
  } = { response: "", metrics: { latencyMs: 0 } };

  try {
    // Route to appropriate API based on providerId
    switch (providerId.toLowerCase()) {
      case "openai":
        // Call OpenAI API with the specific model
        result = await callOpenAIAPI(prompt, signal, modelId);
        break;
      case "anthropic":
        // Call Anthropic API directly with the specific model
        result = await callAnthropicAPI(prompt, signal, modelId);
        break;
      case "groq":
        // Call Groq API with the specific model
        result = await callGroqAPI(prompt, signal, modelId);
        break;
      case "google":
        // Call Google/Gemini API with the specific model
        // Check if it's a free tier model or a premium one
        if (modelId.includes(":free")) {
          // Free tier via OpenRouter
          result = await callOpenRouterGeneric(
            prompt,
            providerId,
            modelId,
            signal
          );
        } else {
          // Premium direct API access
          result = await callGeminiAPI(prompt, signal, modelId);
        }
        break;
      case "mistral":
        // Call Mistral API with the specific model
        result = await callMistralAPI(prompt, signal, modelId);
        break;
      case "cohere":
        // Call Cohere API with the specific model
        result = await callCohereAPI(prompt, signal, modelId);
        break;
      case "ai21":
        // Call AI21 API with the specific model
        result = await callAI21API(prompt, signal, modelId);
        break;
      case "meta":
        // For Meta models, check if it's a free tier model or a premium one
        if (modelId.includes(":free")) {
          // Free tier via OpenRouter
          result = await callOpenRouterGeneric(
            prompt,
            providerId,
            modelId,
            signal
          );
        } else {
          // Premium direct API access
          result = await callMetaAPI(prompt, signal, modelId);
        }
        break;
      case "microsoft":
        // For Microsoft models, check if it's a free tier model or a premium one
        if (modelId.includes(":free")) {
          // Free tier via OpenRouter
          result = await callOpenRouterGeneric(
            prompt,
            providerId,
            modelId,
            signal
          );
        } else {
          // Premium direct API access
          result = await callMicrosoftAPI(prompt, signal, modelId);
        }
        break;
      // New providers that use OpenRouter under the hood
      case "nousresearch":
      case "qwen":
      case "deepseek":
        // All these providers use OpenRouter, so route through our generic OpenRouter function
        result = await callOpenRouterGeneric(
          prompt,
          providerId,
          modelId,
          signal
        );
        break;
      case "openrouter":
        // Handle OpenRouter models - determine the routing based on modelId prefix
        if (modelId.startsWith("anthropic/")) {
          const actualModelId = modelId.replace("anthropic/", "");
          result = await callOpenRouterClaude(prompt, signal, actualModelId);
        } else if (modelId.startsWith("deepseek/")) {
          const actualModelId = modelId.replace("deepseek/", "");
          result = await callOpenRouterDeepSeek(prompt, signal, actualModelId);
        } else {
          throw new APIError(
            `Unsupported OpenRouter model format: ${modelId}`,
            "model_not_supported"
          );
        }
        break;
      default:
        throw new APIError(
          `Provider ${providerId} not implemented yet`,
          "provider_not_implemented"
        );
    }
  } catch (err: any) {
    // Handle errors consistently
    throw handleApiError(err, providerId);
  }

  // Run Groq judge for ALL models with non-empty response
  if (result.response && result.response.trim().length > 0) {
    try {
      const advMetrics = await judgeWithGroq(prompt, result.response, signal);
      result.metrics = { ...result.metrics, ...advMetrics };
    } catch {
      // If judge fails, ignore
    }
  }

  return {
    response: result.response,
    metrics: result.metrics as LLMCallResult["metrics"],
  };
}

// Legacy model mapping for backward compatibility
const LEGACY_MODEL_MAPPING: Record<
  LLMModel,
  { providerId: string; modelId: string }
> = {
  groq: { providerId: "groq", modelId: "llama3-8b-8192" },
  gemini: { providerId: "google", modelId: "gemini-1.5-pro-latest" },
  claude: { providerId: "anthropic", modelId: "claude-3-haiku-20240307" },
  openai: { providerId: "openai", modelId: "gpt-4o" },
  openrouter: {
    providerId: "openrouter",
    modelId: "anthropic/claude-3-haiku-20240307",
  },
  deepseek: { providerId: "openrouter", modelId: "deepseek/deepseek-chat" },
  mistral: { providerId: "mistral", modelId: "mistral-medium-latest" },
  perplexity: { providerId: "perplexity", modelId: "perplexity-online-latest" },
  cohere: { providerId: "cohere", modelId: "command-r" },
};

// Backward compatibility function for legacy code
export async function callLLM(
  model: LLMModel,
  prompt: string,
  signal?: AbortSignal
): Promise<LLMCallResult> {
  console.warn(
    "callLLM is deprecated, please use callLLMWithProviderAndModel instead"
  );

  const mapping = LEGACY_MODEL_MAPPING[model];
  if (!mapping) {
    return {
      response: `Error: Unknown model '${model}'`,
      metrics: { latencyMs: 0 },
    };
  }

  try {
    return await callLLMWithProviderAndModel(
      mapping.providerId,
      mapping.modelId,
      prompt,
      signal
    );
  } catch (err: any) {
    // For backward compatibility, return error in response rather than throwing
    return {
      response: `Error: ${err.message}`,
      metrics: { latencyMs: 0 },
    };
  }
}

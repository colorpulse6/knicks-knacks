// OpenRouter API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

// --- Generic Helper for any model via OpenRouter ---
// This will be used for all our new providers (meta, nousresearch, microsoft, qwen, etc.)
export async function callOpenRouterGeneric(
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

      // Check for rate limit errors or provider errors that should be displayed to the user
      const isRateLimitError =
        response.status === 429 ||
        errorJson.error?.code === 429 ||
        (errorJson.error?.message &&
          (errorJson.error.message.includes("Rate limit exceeded") ||
            errorJson.error.message.includes("rate-limited") ||
            errorJson.error.message.includes("free-models-per-day")));

      const isProviderError =
        errorJson.error?.metadata?.raw ||
        (errorJson.error?.message && errorJson.error?.metadata);

      // Handle these as special responses, not errors
      if (isRateLimitError || isProviderError) {
        const provider =
          errorJson.error?.metadata?.provider_name || "OpenRouter";
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

// --- Helper for Claude (via OpenRouter) ---
export async function callOpenRouterClaude(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "claude-3-haiku-20240307" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  return callOpenRouterGeneric("anthropic", prompt, modelId, signal);
}

// --- Helper for DeepSeek (via OpenRouter) ---
export async function callOpenRouterDeepSeek(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "deepseek-chat" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  return callOpenRouterGeneric("deepseek", prompt, modelId, signal);
}

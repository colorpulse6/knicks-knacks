// Meta API implementation (placeholder - actual API details may differ)

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callMetaAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "llama-4-opus" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
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
  } catch (error) {
    throw handleApiError(error, "meta");
  }
}

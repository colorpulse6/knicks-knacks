// Anthropic Claude API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callAnthropicAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "claude-3-haiku-20240307" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
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
  } catch (error) {
    throw handleApiError(error, "anthropic");
  }
}

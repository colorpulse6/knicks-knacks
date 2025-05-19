// AI21 Labs (Jamba) API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callAI21API(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "jamba-mini" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
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
  } catch (error) {
    throw handleApiError(error, "ai21");
  }
}

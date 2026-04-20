// xAI API implementation (OpenAI-compatible)

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callXAIAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "grok-4-1-fast-non-reasoning", // Default model if not specified
  options?: { effort?: "low" | "medium" | "high"; isReasoning?: boolean },
  userKey?: string
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
    // Get API key, preferring client-provided key if available
    const apiKey = getApiKey("xai", process.env.XAI_API_KEY, userKey);

    const start = performance.now();
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
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
      let errorMsg = `xAI API error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        throw handleApiError(errorJson, "xai");
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
  } catch (error) {
    throw handleApiError(error, "xai");
  }
}

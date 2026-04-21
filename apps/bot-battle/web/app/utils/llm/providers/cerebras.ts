// Cerebras Cloud API implementation (OpenAI-compatible)
// Endpoint: https://api.cerebras.ai/v1/chat/completions
// Free tier: 30 RPM / 60K TPM, no credit card required

import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callCerebrasAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "llama3.1-8b", // Default to fastest/cheapest model
  options?: { userKey?: string; effort?: "low" | "medium" | "high"; isReasoning?: boolean }
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
    const apiKey = getApiKey("cerebras", process.env.CEREBRAS_API_KEY, options?.userKey);

    const start = performance.now();
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
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
      const errorMsg = `Cerebras API error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        throw handleApiError(errorJson, "cerebras");
      } catch {
        throw handleApiError(new Error(errorMsg), "cerebras");
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
    throw handleApiError(error, "cerebras");
  }
}

// OpenAI API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callOpenAIAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "gpt-3.5-turbo" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
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
        throw handleApiError(errorJson, "openai");
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
    throw handleApiError(error, "openai");
  }
}

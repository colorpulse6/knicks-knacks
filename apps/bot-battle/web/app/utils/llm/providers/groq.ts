// Groq LLM API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callGroqAPI(
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
        // const errorJson = await response.json();
        throw new APIError(errorMsg, "api_error");
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

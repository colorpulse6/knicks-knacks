// Cohere API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callCohereAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "command-r" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
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
  } catch (error) {
    throw handleApiError(error, "cohere");
  }
}

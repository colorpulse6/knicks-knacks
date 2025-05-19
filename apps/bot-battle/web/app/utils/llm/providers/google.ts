// Google Gemini API implementation

import { APIError, parseGeminiError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callGeminiAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "gemini-1.0-pro" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
    // Get API key, preferring client-provided key if available
    const apiKey = getApiKey("gemini", process.env.GEMINI_API_KEY);

    // Extract the base model name without version for API URL
    // (e.g., "gemini-1.5-pro-latest" → "gemini-1.5-pro")
    const baseModelName = modelId
      .replace(/-latest$/, "")
      .replace(/-\d{8}$/, "");

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
  } catch (error) {
    throw handleApiError(error, "google");
  }
}

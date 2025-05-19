// Common utility functions for LLM operations

import {
  APIError,
  parseGeminiError,
  parseGroqError,
  parseOpenAIError,
} from "../apiErrors";
import { getApiKey } from "./api-keys";
import { AdvancedLLMMetrics } from "./types";

// Export a utility function to handle API errors and identify invalid keys
export function handleApiError(error: any, provider: string): APIError {
  // First, check if it's already an APIError, return as-is
  if (error instanceof APIError) return error;

  try {
    // Handle provider-specific errors
    switch (provider.toLowerCase()) {
      case "openai":
        return parseOpenAIError(error);
      case "groq":
        return parseGroqError(error);
      case "google":
        return parseGeminiError(error);
      default:
        // For other providers, try to extract a useful message
        if (error?.error?.message) {
          return new APIError(error.error.message, "api_error");
        }
        if (error?.message) {
          return new APIError(error.message, "api_error");
        }
        return new APIError(
          `Error with ${provider} API: ${error.toString()}`,
          "api_error"
        );
    }
  } catch (e) {
    return new APIError(
      `Failed to parse ${provider} error: ${error}`,
      "parse_error"
    );
  }
}

// Helper for using Groq as a judge for response quality
export async function judgeWithGroq(
  prompt: string,
  response: string,
  signal?: AbortSignal
): Promise<AdvancedLLMMetrics> {
  // Get API key, preferring client-provided key if available
  const apiKey = getApiKey("groq", process.env.GROQ_API_KEY);

  const judgePrompt = `You are an expert LLM evaluator. Given the following prompt and response, rate the response on a scale of 1-5 for each metric: accuracy, clarity, relevance, creativity, toxicity, bias, and comprehensiveness. Return the result as a JSON object with keys: accuracy, clarity, relevance, creativity, toxicity, bias, comprehensiveness.\n\nPrompt: ${prompt}\nResponse: ${response}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: judgePrompt }],
      max_tokens: 256,
    }),
    signal,
  });

  if (!res.ok) {
    let errorMsg = `Groq judge API error: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      throw parseGroqError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse JSON from Groq's response
  try {
    const json = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return json;
  } catch {
    return {};
  }
}

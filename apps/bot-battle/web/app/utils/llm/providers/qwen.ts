// Qwen API implementation for premium models

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";

export async function callQwenAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "qwen3-235b-a22b" // Default model if not specified
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
    // Get API key, preferring client-provided key if available
    const apiKey = getApiKey("qwen", process.env.QWEN_API_KEY);

    const start = performance.now();

    // Format modelId for DashScope API if needed (convert from our registry format)
    const dashScopeModelId = formatModelIdForDashScope(modelId);

    // Qwen API endpoint via DashScope
    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-DashScope-SSE": "disable", // Disable server-sent events for simpler implementation
        },
        body: JSON.stringify({
          model: dashScopeModelId,
          input: {
            messages: [{ role: "user", content: prompt }],
          },
          parameters: {
            max_tokens: 2048,
            temperature: 0.7,
            result_format: "message",
          },
        }),
        signal,
      }
    );

    const latencyMs = performance.now() - start;

    if (!response.ok) {
      let errorMsg = `Qwen API error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMsg = `Qwen API error: ${errorJson.message || errorJson.code || response.statusText}`;
        throw new APIError(errorMsg, "api_error");
      } catch (e) {
        throw new APIError(errorMsg, "api_error");
      }
    }

    const data = await response.json();
    const message = data.output?.text || data.output?.message?.content || "";
    const usage = data.usage || {};
    const wordCount = message.split(/\s+/).filter(Boolean).length;
    const charCount = message.length;
    const outputTokens = usage.output_tokens;
    const inputTokens = usage.input_tokens;
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
    throw handleApiError(error, "qwen");
  }
}

// Helper function to convert from our model registry IDs to DashScope model IDs
function formatModelIdForDashScope(modelId: string): string {
  const modelMap: Record<string, string> = {
    "qwen3-235b-a22b": "qwen-3.5-235b-a22b",
    "qwen3-30b-a3b": "qwen-3.5-30b-a3b",
    "qwen3-32b": "qwen-3.5-32b",
    "qwen2.5-max": "qwen-max",
    // Add other models as needed
  };

  return modelMap[modelId] || modelId;
}

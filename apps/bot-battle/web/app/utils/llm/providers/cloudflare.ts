// Cloudflare Workers AI implementation (OpenAI-compatible endpoint)
// Requires both CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID env vars.
// Free tier: 10,000 Neurons/day — no credit card required.
// App-key only: end users cannot supply their own key through the single-input UI
// because two secrets are required (token + account ID).

import { APIError } from "../../apiErrors";
import { handleApiError } from "../utils";

export async function callCloudflareAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  try {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiToken || !accountId) {
      throw new APIError(
        "Cloudflare Workers AI requires both CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID to be set on the server. This provider does not support user-supplied keys.",
        "api_key_missing"
      );
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;

    const start = performance.now();
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
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
      const errorMsg = `Cloudflare Workers AI error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        throw handleApiError(errorJson, "cloudflare");
      } catch {
        throw handleApiError(new Error(errorMsg), "cloudflare");
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
    throw handleApiError(error, "cloudflare");
  }
}

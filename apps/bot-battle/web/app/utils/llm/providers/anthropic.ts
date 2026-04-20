// Anthropic Claude API implementation

import { APIError } from "../../apiErrors";
import { getApiKey } from "../api-keys";
import { handleApiError } from "../utils";
import { effortToBudgetTokens, Effort } from "../../../core/reasoning";

export async function callAnthropicAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "claude-3-haiku-20240307", // Default model if not specified
  options?: { effort?: Effort; isReasoning?: boolean }
): Promise<{
  response: string;
  thinking?: string;
  metrics: Record<string, number | undefined>;
}> {
  try {
    // Get API key, preferring client-provided key if available
    const apiKey = getApiKey("anthropic", process.env.ANTHROPIC_API_KEY);

    const isReasoning = options?.isReasoning && options?.effort;
    const budgetTokens = isReasoning
      ? effortToBudgetTokens(options!.effort!)
      : undefined;

    // Anthropic requires max_tokens > budget_tokens when thinking is enabled
    const maxTokens = budgetTokens ? Math.max(4096, budgetTokens + 1024) : 4096;

    const start = performance.now();
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
        ...(isReasoning && budgetTokens
          ? { thinking: { type: "enabled", budget_tokens: budgetTokens } }
          : {}),
      }),
      signal,
    });

    const latencyMs = performance.now() - start;

    if (!response.ok) {
      let errorMsg = `Anthropic API error: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMsg = `Anthropic API error: ${errorJson.error?.message || errorJson.type || response.statusText}`;
        throw new APIError(errorMsg, "api_error");
      } catch (e) {
        throw new APIError(errorMsg, "api_error");
      }
    }

    const data = await response.json();

    // Parse content blocks — thinking blocks and text blocks
    const contentBlocks: Array<{ type: string; thinking?: string; text?: string }> =
      data.content || [];

    const thinkingParts: string[] = [];
    const textParts: string[] = [];

    for (const block of contentBlocks) {
      if (block.type === "thinking" && block.thinking) {
        thinkingParts.push(block.thinking);
      } else if (block.type === "text" && block.text) {
        textParts.push(block.text);
      }
    }

    const message = textParts.join("\n\n") || "";
    const thinking = thinkingParts.length > 0 ? thinkingParts.join("\n\n") : undefined;

    const usage = data.usage || {};
    const wordCount = message.split(/\s+/).filter(Boolean).length;
    const charCount = message.length;
    const outputTokens: number | undefined = usage.output_tokens;
    const inputTokens: number | undefined = usage.input_tokens;
    const totalTokens =
      outputTokens !== undefined && inputTokens !== undefined
        ? outputTokens + inputTokens
        : undefined;
    const tokensPerSecond =
      outputTokens && latencyMs > 0
        ? outputTokens / (latencyMs / 1000)
        : undefined;

    // Anthropic extended thinking usage field — may be `thinking_tokens` per their docs
    // Defaulting to undefined if not present; UI will gracefully omit the metric
    const reasoningTokens: number | undefined = usage.thinking_tokens ?? undefined;
    const answerTokens: number | undefined = usage.output_tokens;

    return {
      response: message,
      thinking,
      metrics: {
        latencyMs: Math.round(latencyMs),
        inputTokens,
        outputTokens,
        totalTokens,
        tokensPerSecond,
        wordCount,
        charCount,
        reasoningTokens,
        answerTokens,
      },
    };
  } catch (error) {
    throw handleApiError(error, "anthropic");
  }
}

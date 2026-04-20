export const STREAMABLE_PROVIDERS = new Set([
  "openai",
  "xai",
  "deepseek",
  "groq",
  "mistral",
]);

interface OpenAIStreamDelta {
  choices?: Array<{ delta?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: { reasoning_tokens?: number };
  };
}

export function openAIStreamToNDJSON(
  providerResponse: Response,
  startedAt: number
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = providerResponse.body!.getReader();
      let buffer = "";
      let usage: OpenAIStreamDelta["usage"] | undefined;

      const emit = (obj: unknown) =>
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split("\n\n");
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            const line = block.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") continue;
            let parsed: OpenAIStreamDelta;
            try {
              parsed = JSON.parse(payload);
            } catch {
              continue;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) emit({ type: "chunk", delta });
            if (parsed.usage) usage = parsed.usage;
          }
        }

        const latencyMs = Date.now() - startedAt;
        const outputTokens = usage?.completion_tokens;
        const inputTokens = usage?.prompt_tokens;
        const totalTokens = usage?.total_tokens;
        const reasoningTokens =
          usage?.completion_tokens_details?.reasoning_tokens;
        const answerTokens = outputTokens;
        const tokensPerSecond =
          outputTokens && latencyMs > 0
            ? Number((outputTokens / (latencyMs / 1000)).toFixed(2))
            : undefined;

        emit({
          type: "done",
          metrics: {
            latencyMs,
            inputTokens,
            outputTokens,
            totalTokens,
            reasoningTokens,
            answerTokens,
            tokensPerSecond,
          },
        });
      } catch (err: any) {
        emit({ type: "error", error: err?.message ?? "stream failed" });
      } finally {
        controller.close();
      }
    },
  });
}

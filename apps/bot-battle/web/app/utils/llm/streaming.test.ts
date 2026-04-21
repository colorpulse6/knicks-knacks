import { describe, it, expect } from "vitest";
import { openAIStreamToNDJSON, STREAMABLE_PROVIDERS } from "./streaming";

function makeProviderResponse(ssePayloads: string[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(ctrl) {
      for (const p of ssePayloads) ctrl.enqueue(encoder.encode(p));
      ctrl.close();
    },
  });
  return new Response(stream, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

async function collectNDJSON(stream: ReadableStream<Uint8Array>): Promise<string[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let all = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    all += decoder.decode(value, { stream: true });
  }
  return all.split("\n").filter(Boolean);
}

describe("STREAMABLE_PROVIDERS", () => {
  it("includes all OpenAI-compatible streaming providers", () => {
    expect(STREAMABLE_PROVIDERS).toEqual(
      new Set(["openai", "xai", "deepseek", "groq", "mistral", "cerebras"])
    );
  });
});

describe("openAIStreamToNDJSON", () => {
  it("emits chunk events for each delta and a done event at end", async () => {
    const provider = makeProviderResponse([
      'data: {"choices":[{"delta":{"content":"Hello "}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"world"}}]}\n\n',
      'data: {"choices":[{"delta":{}}],"usage":{"prompt_tokens":10,"completion_tokens":2,"total_tokens":12}}\n\n',
      'data: [DONE]\n\n',
    ]);
    const startedAt = Date.now();
    const out = openAIStreamToNDJSON(provider, startedAt);
    const lines = await collectNDJSON(out);
    const events = lines.map((l) => JSON.parse(l));

    expect(events[0]).toEqual({ type: "chunk", delta: "Hello " });
    expect(events[1]).toEqual({ type: "chunk", delta: "world" });
    const last = events[events.length - 1];
    expect(last.type).toBe("done");
    expect(last.metrics.inputTokens).toBe(10);
    expect(last.metrics.outputTokens).toBe(2);
    expect(last.metrics.totalTokens).toBe(12);
    expect(typeof last.metrics.latencyMs).toBe("number");
  });

  it("ignores empty deltas", async () => {
    const provider = makeProviderResponse([
      'data: {"choices":[{"delta":{}}]}\n\n',
      'data: {"choices":[{"delta":{"content":"x"}}]}\n\n',
      'data: [DONE]\n\n',
    ]);
    const lines = await collectNDJSON(openAIStreamToNDJSON(provider, Date.now()));
    const events = lines.map((l) => JSON.parse(l));
    const chunks = events.filter((e) => e.type === "chunk");
    expect(chunks).toHaveLength(1);
    expect(chunks[0].delta).toBe("x");
  });
});

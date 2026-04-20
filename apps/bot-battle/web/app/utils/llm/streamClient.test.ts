import { describe, it, expect, vi, afterEach } from "vitest";
import { streamLLMResponse } from "./streamClient";

function mockNDJSONResponse(lines: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    start(ctrl) {
      for (const l of lines) ctrl.enqueue(encoder.encode(l));
      ctrl.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/x-ndjson" },
  });
}

function mockJSONResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("streamLLMResponse", () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it("dispatches onChunk per delta, then onDone when stream path", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockNDJSONResponse([
        '{"type":"chunk","delta":"Hi "}\n',
        '{"type":"chunk","delta":"there"}\n',
        '{"type":"done","metrics":{"latencyMs":42}}\n',
      ])
    );
    const chunks: string[] = [];
    let doneMetrics: any = null;
    await streamLLMResponse(
      { providerId: "openai", modelId: "x", prompt: "hi", stream: true },
      {
        onChunk: (d) => chunks.push(d),
        onDone: (m) => { doneMetrics = m; },
        onError: () => {},
      }
    );
    expect(chunks).toEqual(["Hi ", "there"]);
    expect(doneMetrics).toEqual({ latencyMs: 42 });
  });

  it("falls back to JSON: single onChunk with full response, then onDone", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockJSONResponse({ response: "answer", metrics: { latencyMs: 10 } })
    );
    const chunks: string[] = [];
    let doneMetrics: any = null;
    await streamLLMResponse(
      { providerId: "anthropic", modelId: "x", prompt: "hi", stream: false },
      {
        onChunk: (d) => chunks.push(d),
        onDone: (m) => { doneMetrics = m; },
        onError: () => {},
      }
    );
    expect(chunks).toEqual(["answer"]);
    expect(doneMetrics).toEqual({ latencyMs: 10 });
  });

  it("fires onError when NDJSON stream emits an error event", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      mockNDJSONResponse([
        '{"type":"chunk","delta":"partial"}\n',
        '{"type":"error","error":"upstream failure"}\n',
      ])
    );
    const chunks: string[] = [];
    let err: string | null = null;
    await streamLLMResponse(
      { providerId: "openai", modelId: "x", prompt: "hi", stream: true },
      { onChunk: (d) => chunks.push(d), onDone: () => {}, onError: (e) => { err = e; } }
    );
    expect(chunks).toEqual(["partial"]);
    expect(err).toBe("upstream failure");
  });

  it("fires onError for non-ok responses", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "bad key" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      })
    );
    let err: string | null = null;
    await streamLLMResponse(
      { providerId: "openai", modelId: "x", prompt: "hi", stream: true },
      { onChunk: () => {}, onDone: () => {}, onError: (e) => { err = e; } }
    );
    expect(err).toMatch(/bad key/);
  });
});

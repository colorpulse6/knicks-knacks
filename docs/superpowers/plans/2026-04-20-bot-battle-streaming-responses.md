# BotBattle Streaming Responses + Skeleton Loading — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add opt-in streaming responses (NDJSON over chunked HTTP) for OpenAI-compatible providers (OpenAI, xAI, DeepSeek, Groq, Mistral) with a blinking rust caret during streaming and a shared shimmer skeleton replacing the current "Loading…" text for both streaming and non-streaming providers.

**Architecture:** Server-side transformer converts each provider's OpenAI-format SSE stream to plain NDJSON. A unified client-side consumer (`streamLLMResponse`) reads either NDJSON or JSON based on response `content-type` — so one code path handles both streaming and fallback. A "Stream when possible" checkbox (default off, localStorage-persisted) controls whether the client sends `stream: true`. Non-streaming providers (Anthropic, Google, Qwen) are untouched in this pass.

**Tech Stack:** Next.js 15.3 App Router, React 18.3, Tailwind 4.0.5 (with editorial tokens already defined — `bg-rust`, `bg-paper`, etc.), Vitest 1.0, @testing-library/react 14.

**Spec:** `docs/superpowers/specs/2026-04-20-bot-battle-streaming-responses-design.md`

**Working directory (all paths relative to):** `apps/bot-battle/web`

**Baseline:** 41 tests pass. Registry has 8 providers, 17 models. Editorial theme + Groq free-tier feature already shipped.

---

## Decisions resolved during plan writing

Three advisory notes from the spec review:

1. **`openai.stream.ts` file:** Dropped from the file list. All streaming logic goes into `streaming.ts` (server helper) and `streamClient.ts` (client helper). Provider handlers stay unchanged — the streaming path calls the OpenAI-compatible endpoint directly using `STREAMABLE_PROVIDERS` config, reusing each provider's existing `getApiKey` and endpoint URL.
2. **`useStreamPreference` hook:** Lives in `app/utils/streamPreference.ts` as both a standalone getter (for SSR/init) and a React hook (for reactive reads). Keeps the toggle logic self-contained.
3. **`bg-rust` / `bg-paper` tokens:** Already defined in `globals.css` from the editorial theme work (Task 1 commit `cc06896`). No additional config needed.

---

### Task 1: NDJSON parser helper (TDD)

**Files:**
- Create: `web/app/utils/llm/ndjson.ts`
- Create: `web/app/utils/llm/ndjson.test.ts`

- [ ] **Step 1: Write failing tests**

Write to `app/utils/llm/ndjson.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseNDJSONStream, StreamEvent } from "./ndjson";

function toStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      for (const c of chunks) ctrl.enqueue(encoder.encode(c));
      ctrl.close();
    },
  });
}

async function collect(events: AsyncIterable<StreamEvent>): Promise<StreamEvent[]> {
  const out: StreamEvent[] = [];
  for await (const e of events) out.push(e);
  return out;
}

describe("parseNDJSONStream", () => {
  it("parses complete JSON lines", async () => {
    const s = toStream([
      '{"type":"chunk","delta":"Hello "}\n',
      '{"type":"chunk","delta":"world"}\n',
      '{"type":"done","metrics":{"latencyMs":100}}\n',
    ]);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([
      { type: "chunk", delta: "Hello " },
      { type: "chunk", delta: "world" },
      { type: "done", metrics: { latencyMs: 100 } },
    ]);
  });

  it("buffers lines split across chunks", async () => {
    const s = toStream([
      '{"type":"chunk","del',
      'ta":"split"}\n{"type":"done","metrics":{}}\n',
    ]);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toHaveLength(2);
    expect((events[0] as any).delta).toBe("split");
  });

  it("skips blank lines", async () => {
    const s = toStream(['\n', '{"type":"chunk","delta":"x"}\n', '\n']);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([{ type: "chunk", delta: "x" }]);
  });

  it("emits error event for malformed JSON", async () => {
    const s = toStream(['not json\n']);
    const events = await collect(parseNDJSONStream(s));
    expect(events[0].type).toBe("error");
  });

  it("handles a trailing line without newline", async () => {
    const s = toStream(['{"type":"chunk","delta":"tail"}']);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([{ type: "chunk", delta: "tail" }]);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn workspace @knicks-knacks/bot-battle-web test --run app/utils/llm/ndjson.test.ts
```

- [ ] **Step 3: Implement**

Write to `app/utils/llm/ndjson.ts`:

```ts
export type StreamEvent =
  | { type: "chunk"; delta: string }
  | { type: "done"; metrics: Record<string, number | undefined>; thinking?: string }
  | { type: "error"; error: string };

export async function* parseNDJSONStream(
  stream: ReadableStream<Uint8Array>
): AsyncIterable<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line) continue;
      yield parseLine(line);
    }
  }

  const trailing = buffer.trim();
  if (trailing) yield parseLine(trailing);
}

function parseLine(line: string): StreamEvent {
  try {
    const obj = JSON.parse(line);
    if (obj && typeof obj === "object" && "type" in obj) return obj as StreamEvent;
    return { type: "error", error: `Invalid event shape: ${line.slice(0, 80)}` };
  } catch {
    return { type: "error", error: `Invalid JSON: ${line.slice(0, 80)}` };
  }
}
```

- [ ] **Step 4: Run — expect 5/5 PASS (46 total)**

- [ ] **Step 5: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/utils/llm/ndjson.ts apps/bot-battle/web/app/utils/llm/ndjson.test.ts
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): add NDJSON stream parser helper"
```

---

### Task 2: Server-side OpenAI-SSE → NDJSON transformer (TDD)

**Files:**
- Create: `web/app/utils/llm/streaming.ts`
- Create: `web/app/utils/llm/streaming.test.ts`

This task implements the server helper that fetches from an OpenAI-compatible streaming endpoint and re-emits events as NDJSON.

- [ ] **Step 1: Write failing tests**

Write to `app/utils/llm/streaming.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
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
  it("includes the 5 OpenAI-compatible providers", () => {
    expect(STREAMABLE_PROVIDERS).toEqual(
      new Set(["openai", "xai", "deepseek", "groq", "mistral"])
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
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Write to `app/utils/llm/streaming.ts`:

```ts
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
```

- [ ] **Step 4: Run — expect 3/3 PASS (49 total)**

- [ ] **Step 5: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/utils/llm/streaming.ts apps/bot-battle/web/app/utils/llm/streaming.test.ts
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): add server-side OpenAI-SSE to NDJSON transformer"
```

---

### Task 3: `ResponseSkeleton` component (TDD)

**Files:**
- Create: `web/app/components/ResponseSkeleton.tsx`
- Create: `web/app/components/ResponseSkeleton.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResponseSkeleton } from "./ResponseSkeleton";

describe("ResponseSkeleton", () => {
  it("renders 3 shimmer bars", () => {
    const { container } = render(<ResponseSkeleton />);
    expect(container.querySelectorAll("[data-skeleton-bar]")).toHaveLength(3);
  });

  it("is accessible as a loading status", () => {
    render(<ResponseSkeleton />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Write to `app/components/ResponseSkeleton.tsx`:

```tsx
import React from "react";

const BAR_BASE =
  "h-[10px] rounded-sm bg-gradient-to-r from-rule-soft via-paper to-rule-soft bg-[length:200px_100%] animate-[shimmer_1.2s_linear_infinite]";

export const ResponseSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading response" className="space-y-2 py-1">
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "95%" }} />
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "87%" }} />
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "72%" }} />
  </div>
);
```

Also add the keyframes to `app/globals.css` (inside the `@theme inline` block or in a new `@keyframes` block at the top level):

```css
@keyframes shimmer {
  0%   { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
```

- [ ] **Step 4: Run — expect PASS (51 total)**

- [ ] **Step 5: Verify shimmer in dev server (optional sanity check)**

```bash
yarn workspace @knicks-knacks/bot-battle-web dev -p 3010
```
Temporarily render `<ResponseSkeleton />` in `page.tsx` to confirm it shimmers. Revert before commit.

- [ ] **Step 6: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/components/ResponseSkeleton.tsx apps/bot-battle/web/app/components/ResponseSkeleton.test.tsx apps/bot-battle/web/app/globals.css
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): add ResponseSkeleton with shimmer animation"
```

---

### Task 4: `streamPreference` hook + `StreamToggle` component (TDD)

**Files:**
- Create: `web/app/utils/streamPreference.ts`
- Create: `web/app/components/StreamToggle.tsx`
- Create: `web/app/components/StreamToggle.test.tsx`

- [ ] **Step 1: Write failing tests**

Write to `app/components/StreamToggle.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StreamToggle } from "./StreamToggle";
import { getStreamPreference } from "../utils/streamPreference";

describe("StreamToggle", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("renders an unchecked checkbox labeled 'Stream when possible' by default", () => {
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i }) as HTMLInputElement;
    expect(cb).toBeInTheDocument();
    expect(cb.checked).toBe(false);
  });

  it("reflects existing localStorage preference on mount", () => {
    localStorage.setItem("botbattle.stream", "on");
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i }) as HTMLInputElement;
    expect(cb.checked).toBe(true);
  });

  it("persists to localStorage on toggle", () => {
    render(<StreamToggle />);
    const cb = screen.getByRole("checkbox", { name: /stream when possible/i });
    fireEvent.click(cb);
    expect(localStorage.getItem("botbattle.stream")).toBe("on");
    fireEvent.click(cb);
    expect(localStorage.getItem("botbattle.stream")).toBe("off");
  });
});

describe("getStreamPreference", () => {
  beforeEach(() => localStorage.clear());
  it("returns false when unset", () => {
    expect(getStreamPreference()).toBe(false);
  });
  it("returns true when set to 'on'", () => {
    localStorage.setItem("botbattle.stream", "on");
    expect(getStreamPreference()).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement the hook**

Write to `app/utils/streamPreference.ts`:

```ts
"use client";
import { useEffect, useState } from "react";

const KEY = "botbattle.stream";

export function getStreamPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setStreamPreference(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {}
}

export function useStreamPreference(): [boolean, (on: boolean) => void] {
  const [on, setOn] = useState<boolean>(false);
  useEffect(() => setOn(getStreamPreference()), []);
  return [
    on,
    (next) => {
      setOn(next);
      setStreamPreference(next);
    },
  ];
}
```

- [ ] **Step 4: Implement the toggle component**

Write to `app/components/StreamToggle.tsx`:

```tsx
"use client";
import React from "react";
import { useStreamPreference } from "../utils/streamPreference";

export const StreamToggle: React.FC = () => {
  const [on, setOn] = useStreamPreference();
  return (
    <label className="flex items-center gap-2 text-xs text-ink-soft select-none cursor-pointer">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="accent-rust"
      />
      Stream when possible
    </label>
  );
};
```

- [ ] **Step 5: Run — expect 5/5 new tests PASS (56 total)**

- [ ] **Step 6: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/utils/streamPreference.ts apps/bot-battle/web/app/components/StreamToggle.tsx apps/bot-battle/web/app/components/StreamToggle.test.tsx
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): add Stream when possible toggle with localStorage persistence"
```

---

### Task 5: Client-side unified consumer `streamClient.ts` (TDD)

**Files:**
- Create: `web/app/utils/llm/streamClient.ts`
- Create: `web/app/utils/llm/streamClient.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
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
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Write to `app/utils/llm/streamClient.ts`:

```ts
import { parseNDJSONStream } from "./ndjson";

export interface LLMRequestBody {
  providerId: string;
  modelId: string;
  prompt: string;
  effort?: "low" | "medium" | "high";
  stream?: boolean;
}

export interface StreamHandlers {
  onChunk: (delta: string) => void;
  onDone: (metrics: Record<string, number | undefined>, thinking?: string) => void;
  onError: (message: string) => void;
}

export async function streamLLMResponse(
  body: LLMRequestBody,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e: any) {
    handlers.onError(e?.message ?? "Network error");
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error) msg = j.error;
    } catch {}
    handlers.onError(msg);
    return;
  }

  const ctype = res.headers.get("content-type") ?? "";

  if (ctype.includes("application/x-ndjson") && res.body) {
    for await (const ev of parseNDJSONStream(res.body)) {
      if (ev.type === "chunk") handlers.onChunk(ev.delta);
      else if (ev.type === "done") handlers.onDone(ev.metrics, ev.thinking);
      else handlers.onError(ev.error);
    }
    return;
  }

  // JSON fallback path — unified handling
  try {
    const data = await res.json();
    if (typeof data.response === "string") handlers.onChunk(data.response);
    handlers.onDone(data.metrics ?? {}, data.thinking);
  } catch (e: any) {
    handlers.onError(e?.message ?? "Invalid response");
  }
}
```

- [ ] **Step 4: Run — expect 4/4 PASS (60 total)**

- [ ] **Step 5: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/utils/llm/streamClient.ts apps/bot-battle/web/app/utils/llm/streamClient.test.ts
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): add unified streaming+JSON client consumer"
```

---

### Task 6: Wire streaming into `/api/llm/route.ts`

**Files:**
- Modify: `web/app/api/llm/route.ts`

- [ ] **Step 1: Read the current route handler**

Open `app/api/llm/route.ts`. Note the existing flow: validates body, checks model availability, calls `callLLMWithProviderAndModel`, returns JSON via `NextResponse.json`.

- [ ] **Step 2: Accept `stream` in request body**

Update the destructure near the top:

```ts
const { providerId, modelId, prompt, effort, stream } = body;
```

- [ ] **Step 3: Add imports at the top of `route.ts` (in the existing import block)**

```ts
import { STREAMABLE_PROVIDERS, openAIStreamToNDJSON } from "../../utils/llm/streaming";
import { getApiKey } from "../../utils/llm/api-keys";
import { LLM_REGISTRY } from "../../core/llm-registry";
```

**Important:** keep the existing body destructure that retains `isReasoning` for the non-streaming path. Do NOT remove `isReasoning` from the destructure — the streaming branch re-derives it from the registry, but the non-streaming path below still uses the body-supplied value.

- [ ] **Step 4: Branch on streaming-capable path**

After the availability check (which unblocks a valid provider/model), add — **before** the existing `callLLMWithProviderAndModel` call:

```ts
if (stream === true && STREAMABLE_PROVIDERS.has(providerId)) {
  const endpoint = PROVIDER_STREAM_ENDPOINTS[providerId];
  const envKeyName = PROVIDER_ENV_KEY[providerId];
  const apiKey = getApiKey(providerId, process.env[envKeyName]);
  const modelSpec = LLM_REGISTRY.find((p) => p.id === providerId)
    ?.models.find((m) => m.id === modelId);
  const isReasoning = modelSpec?.modelType === "reasoning";
  const startedAt = Date.now();
  const providerRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      ...(isReasoning && effort ? { reasoning: { effort } } : {}),
    }),
  });
  if (!providerRes.ok) {
    const text = await providerRes.text().catch(() => "");
    return NextResponse.json(
      { error: `${providerRes.status}: ${text.slice(0, 200)}` },
      { status: providerRes.status }
    );
  }
  const ndjson = openAIStreamToNDJSON(providerRes, startedAt);
  return new Response(ndjson, {
    headers: { "content-type": "application/x-ndjson" },
  });
}

// existing non-streaming path continues unchanged below
```

Add the endpoint/env-key tables near the top of the file:

```ts
const PROVIDER_STREAM_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  xai: "https://api.x.ai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
};
const PROVIDER_ENV_KEY: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  xai: "XAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
};
```

- [ ] **Step 5: Build + run full test suite**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn workspace @knicks-knacks/bot-battle-web build
yarn workspace @knicks-knacks/bot-battle-web test --run
```

60/60 pass, build clean. No new tests in this task — Task 5 covers the client consumer and Task 2 covers the streaming transformer.

- [ ] **Step 6: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/api/llm/route.ts
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): route streaming path for OpenAI-compatible providers"
```

---

### Task 7: Update `LLMResponsePanel` — skeleton + caret

**Files:**
- Modify: `web/app/components/LLMResponsePanel.tsx`
- Modify: `web/app/components/LLMResponsePanel.test.tsx`

- [ ] **Step 1: Add failing tests for new behavior**

Append to `LLMResponsePanel.test.tsx`:

```tsx
import { ResponseSkeleton } from "./ResponseSkeleton";

describe("LLMResponsePanel — loading/streaming states", () => {
  it("renders the skeleton when isLoading and no response yet", () => {
    const { container } = render(
      <LLMResponsePanel model="x" isLoading modelType="standard" />
    );
    expect(container.querySelectorAll("[data-skeleton-bar]")).toHaveLength(3);
  });

  it("renders a caret when isStreaming and response has content", () => {
    const { container } = render(
      <LLMResponsePanel
        model="x"
        modelType="standard"
        isStreaming
        response="partial"
      />
    );
    expect(container.querySelector("[data-caret]")).toBeInTheDocument();
  });

  it("does not render a caret when streaming is done", () => {
    const { container } = render(
      <LLMResponsePanel model="x" modelType="standard" response="done" />
    );
    expect(container.querySelector("[data-caret]")).toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect 3 fails**

- [ ] **Step 3: Update `LLMResponsePanel.tsx`**

Add to `LLMResponsePanelProps`:
```ts
isStreaming?: boolean;
```

Import at top:
```ts
import { ResponseSkeleton } from "./ResponseSkeleton";
```

Replace the current `isLoading` branch (which currently shows "Loading...") with:
```tsx
{isLoading && !response ? (
  <ResponseSkeleton />
) : (
  <>
    {/* existing metrics/tabs/response rendering */}
  </>
)}
```

Inside the body-rendering section where `{response}` is output, append the caret when streaming:
```tsx
{response}
{isStreaming && response && (
  <span
    data-caret
    aria-hidden
    className="inline-block w-[2px] h-[1.1em] bg-rust align-text-bottom ml-[1px] animate-[caret_1s_steps(1)_infinite]"
  />
)}
```

Add keyframes to `globals.css`:
```css
@keyframes caret {
  0%, 55% { opacity: 1; }
  56%, 100% { opacity: 0; }
}
```

- [ ] **Step 4: Run — 63/63 pass**

- [ ] **Step 5: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/components/LLMResponsePanel.tsx apps/bot-battle/web/app/components/LLMResponsePanel.test.tsx apps/bot-battle/web/app/globals.css
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): LLMResponsePanel renders skeleton + streaming caret"
```

---

### Task 8: Wire streaming into `page.tsx`

**Files:**
- Modify: `web/app/page.tsx`

- [ ] **Step 1: Read relevant sections of `page.tsx`**

The fetching flow is at lines ~52-95 (`fetchLLMResponse`) and ~133-230 (the `handleSubmit` with `models.forEach`, each iteration wrapped in try/catch around the await). The `LLMResponsePanel` render call is around line ~482.

**Keep (do not remove):**
- The body of `handleSubmit` above the forEach — the validation guard (`!usedPrompt || models.length === 0`), the initial loading-state `setResponses` (the one that seeds every selected model with `{ loading: true, response: "" }`), the `requestAnimationFrame` scroll-to-results call, and the comparative-analysis reset calls.
- The `effortPerModel` state and `setEffortPerModel`.
- Any `AbortController` wiring if present.

**Remove:**
- The `fetchLLMResponse` function (lines ~52-95) — no longer used after this task.
- The contents of the `models.forEach` async callback body — the existing try/catch around `await fetchLLMResponse(...)`, the `setResponses` calls inside the catch that format error messages. Replaced entirely by the streaming-aware implementation below.

- [ ] **Step 2: Replace `fetchLLMResponse` usage with `streamLLMResponse`**

At the top of the `forEach`, replace the current callback body with:

```tsx
import { streamLLMResponse } from "./utils/llm/streamClient";
import { getStreamPreference } from "./utils/streamPreference";

// inside handleSubmit, before the forEach:
const useStream = getStreamPreference();

// inside the forEach (replace the existing try/catch around fetchLLMResponse):
models.forEach((model) => {
  const modelKey = getModelKey(model);
  const provider = LLM_REGISTRY.find((p) => p.id === model.providerId);
  const spec = provider?.models.find((m) => m.id === model.modelId);
  const isReasoning = spec?.modelType === "reasoning";

  // Mark cell as streaming-in-progress so UI can render caret later
  setResponses((prev) => ({
    ...prev,
    [modelKey]: { ...prev[modelKey], isStreaming: useStream },
  }));

  streamLLMResponse(
    {
      providerId: model.providerId,
      modelId: model.modelId,
      prompt: usedPrompt,
      stream: useStream,
      ...(isReasoning && effortPerModel[modelKey] ? { effort: effortPerModel[modelKey] } : {}),
    },
    {
      onChunk: (delta) =>
        setResponses((prev) => {
          const cur = prev[modelKey];
          const prior = typeof cur?.response === "string" ? cur.response : "";
          return {
            ...prev,
            [modelKey]: {
              ...cur,
              loading: false,
              response: prior + delta,
              isStreaming: useStream,
            },
          };
        }),
      onDone: (metrics, thinking) =>
        setResponses((prev) => ({
          ...prev,
          [modelKey]: {
            ...prev[modelKey],
            loading: false,
            isStreaming: false,
            metrics,
            thinking,
          },
        })),
      onError: (err) =>
        setResponses((prev) => ({
          ...prev,
          [modelKey]: {
            ...prev[modelKey],
            loading: false,
            isStreaming: false,
            response:
              (typeof prev[modelKey]?.response === "string"
                ? prev[modelKey].response
                : "") +
              (prev[modelKey]?.response ? "\n\n" : "") +
              `⚠️ ${err}`,
          },
        })),
    }
  );
});
```

Delete the old `fetchLLMResponse` function (no longer used).

- [ ] **Step 3: Pass `isStreaming` to `LLMResponsePanel`**

In the grid render (around line 482), add the prop:

```tsx
<LLMResponsePanel
  model={displayName}
  isLoading={loading}
  isStreaming={responses[modelKey].isStreaming}
  response={response}
  /* ... existing props ... */
/>
```

The `ResponseData` type used for `responses` needs to include `isStreaming?: boolean` and `thinking?: string` — update the type definition near the top of `page.tsx`.

- [ ] **Step 4: Render `<StreamToggle />` next to the Run button**

Find the Run button in the prompt-panel area (around line 354). Restructure to:

```tsx
<div className="flex items-center gap-4 mt-4">
  <button type="submit" className="...">Run Benchmark</button>
  <StreamToggle />
</div>
```

Import at top: `import { StreamToggle } from "./components/StreamToggle";`

- [ ] **Step 5: Build + tests**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn workspace @knicks-knacks/bot-battle-web build
yarn workspace @knicks-knacks/bot-battle-web test --run
```

63/63 pass, build clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks add apps/bot-battle/web/app/page.tsx
git -C /Users/nichalasbarnes/Desktop/projects/knicks-knacks commit -m "feat(bot-battle): wire streaming client + StreamToggle into page"
```

---

### Task 9: Manual smoke test

- [ ] **Step 1: Start dev server**

```bash
cd /Users/nichalasbarnes/Desktop/projects/knicks-knacks
yarn workspace @knicks-knacks/bot-battle-web dev -p 3010
```

- [ ] **Step 2: Toggle off (default)** — run a benchmark with Claude Sonnet 4.6 (non-streaming provider). Confirm shimmer skeleton appears during wait, then full response swaps in. No caret.

- [ ] **Step 3: Toggle off** — run a benchmark with GPT-5.4 mini (streaming-capable provider). Confirm same behavior: skeleton → full response atomically. No caret. Same visual as step 2.

- [ ] **Step 4: Toggle on** — run a benchmark with GPT-5.4 mini. Confirm skeleton appears briefly, then text streams in chunk-by-chunk with a blinking rust caret trailing. Caret disappears when done. Metrics populate at end.

- [ ] **Step 5: Toggle on** — run with Claude Sonnet 4.6 (non-streaming). Confirm behavior matches step 2 — skeleton → full response. No caret (it's a non-streaming provider, so the JSON fallback path is used). This proves the unified consumer works.

- [ ] **Step 6: Toggle on** — run several models simultaneously, mix of streaming-capable and non-streaming. Each cell should progress independently; streaming cells show caret, non-streaming cells don't. No state crossover between cells.

- [ ] **Step 7: Reload page** — toggle state should persist (localStorage).

- [ ] **Step 8: Refresh check**

```bash
yarn workspace @knicks-knacks/bot-battle-web test --run
```
63/63 must still pass.

- [ ] **Step 9: If any issue is found, file a follow-up commit**

Only if needed — this task's commit is optional. Don't create an empty commit.

---

## Follow-ups (not implemented)

- Streaming for Anthropic (thinking-block SSE)
- Streaming for Google (`streamGenerateContent`)
- Streaming for Qwen (DashScope format)
- Per-model cancel button UI
- Incremental token counter during streaming
- Streaming the comparative-analysis response

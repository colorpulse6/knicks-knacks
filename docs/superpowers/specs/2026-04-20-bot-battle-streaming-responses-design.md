# BotBattle Streaming Responses + Skeleton Loading

**Date:** 2026-04-20
**Scope:** `apps/bot-battle/web/`
**Status:** Design approved, pending implementation plan

## Problem

Model responses currently arrive atomically after the provider finishes generating. For reasoning models or long outputs, users stare at a "Loading…" string for 10–60 seconds with no feedback. The app also has no indication *which* model is about to finish first — all cells look equally idle.

Streaming the response as it generates gives immediate feedback, lets users read the first paragraph before the rest arrives, and makes the benchmarking experience feel alive rather than atomic.

A full streaming overhaul across all eight providers is non-trivial (different protocols, different thinking-block semantics), so this design focuses on the subset that share the OpenAI-compatible streaming format and treats all other providers as non-streaming fallbacks. Non-streaming cells also get a proper loading skeleton in place of the existing "Loading…" text.

## Goals

1. Stream response text progressively for providers using the OpenAI-compatible `stream: true` protocol: OpenAI, xAI, DeepSeek, Groq, Mistral.
2. Non-streaming providers (Anthropic, Google, Qwen) continue to work exactly as today — no behavior change.
3. A shared loading skeleton (three shimmer bars) replaces the current "Loading…" text for both paths — streaming providers show it until the first chunk arrives, non-streaming providers show it for the full wait.
4. A blinking rust caret trails the text while streaming; removed when the stream ends.
5. Feature is opt-in behind a **"Stream when possible"** toggle, default off, persisted to `localStorage`.
6. If streaming fails mid-flight, the UI keeps whatever arrived and shows an inline error — no crash, no regression.

## Non-goals

- Streaming for Anthropic, Google, or Qwen (different protocols; logged as follow-up).
- Streaming of thinking tokens for reasoning models (Claude's thinking blocks, OpenAI's hidden reasoning tokens). Thinking still appears in the Thinking tab once the response is complete.
- Per-model cancel buttons beyond the existing `AbortController` wiring.
- Incremental token counts during streaming (providers only emit `usage` at stream end).
- Server-Sent Events (SSE) — we use plain NDJSON over chunked HTTP for simpler client handling.

## Design

### 1. Wire protocol

Client sends the existing `/api/llm` POST body with an optional field:

```ts
{ providerId, modelId, prompt, effort?, stream?: boolean }
```

When `stream` is `true` AND the target provider is in the streaming-capable set (OpenAI, xAI, DeepSeek, Groq, Mistral), the server returns a streaming HTTP response with `content-type: application/x-ndjson`. The body is a sequence of newline-delimited JSON objects:

```
{"type":"chunk","delta":"Variable-length "}
{"type":"chunk","delta":"lookbehind is "}
...
{"type":"done","metrics":{"latencyMs":14100,"inputTokens":45,"outputTokens":312,"tokensPerSecond":22.1,...}}
```

An error mid-stream emits one final line and closes the body:
```
{"type":"error","error":"provider timed out"}
```

When `stream` is `false` (or absent), or when the provider isn't streaming-capable, the server returns the current `application/json` shape: `{ response, metrics, thinking? }`. The client branches on the response `content-type`.

**Why NDJSON, not SSE:** NDJSON is simpler — plain chunked body, no `data:` prefix, no event framing, no EventSource API. Fits Next.js App Router's `ReadableStream` response idiomatically and gives us a tiny purpose-built parser rather than depending on the browser SSE implementation.

### 2. Server-side streaming handler

`app/api/llm/route.ts` branches on `stream`:

- `stream === true` AND provider is in `STREAMABLE_PROVIDERS = new Set(["openai","xai","deepseek","groq","mistral"])`:
  - Open the provider's streaming endpoint (all five accept `stream: true` in the request body and return OpenAI-style SSE chunks).
  - Construct a `ReadableStream<Uint8Array>` that:
    - Reads the provider's SSE response
    - Parses each `data: {...}` line
    - Emits an NDJSON `chunk` event per delta
    - Accumulates `usage` and token counts from the final SSE event
    - Emits a final `done` event with metrics
  - Return `new Response(stream, { headers: { "content-type": "application/x-ndjson" } })`.

- Otherwise: current JSON path, unchanged.

A shared helper `app/utils/llm/streaming.ts` contains:
- `openAIStreamToNDJSON(res: Response): ReadableStream` — takes a provider SSE `Response`, emits NDJSON chunks
- `parseNDJSON(stream: ReadableStream): AsyncIterable<StreamEvent>` — client-side parser

### 3. Client-side streaming consumer

`app/utils/llm/streamClient.ts` (new) exposes:

```ts
export async function streamLLMResponse(
  body: LLMRequestBody,
  handlers: {
    onChunk: (delta: string) => void;
    onDone: (metrics: Metrics, thinking?: string) => void;
    onError: (msg: string) => void;
  },
  signal?: AbortSignal
): Promise<void>
```

It POSTs to `/api/llm` with `stream: true`, inspects `content-type`:
- `application/x-ndjson` → reads the body via `response.body.getReader()`, parses newline-delimited lines, dispatches handlers
- `application/json` → parses the whole body, calls `onChunk(fullResponse)` then `onDone(metrics, thinking)`

The JSON fallback path means the client-side code path is unified — it handles streaming and non-streaming providers identically at the consumer level.

### 4. Client state wiring (`page.tsx`)

- New local state: `const streamPref = useStreamPreference()` — reads `localStorage["botbattle.stream"]`, returns `boolean`.
- `fetchLLMResponse` (existing) becomes `streamLLMResponse` when the toggle is on. State updates (via `setResponses`) happen on every `onChunk` so the response text grows progressively.
- `responses[key]` gains `isStreaming?: boolean` — set to `true` until `onDone` / `onError` fires.

### 5. Components

**`ResponseSkeleton.tsx`** (new):
- Three shimmer bars (95%, 87%, 72% widths), rendered inside the result cell body area.
- Pure CSS animation using Tailwind keyframes.

**`Caret.tsx`** (new or inline in `LLMResponsePanel`):
- Blinking `<span>` with `bg-rust`, 2px wide, `1.1em` tall. Appears at the tail of streaming response text.

**`StreamToggle.tsx`** (new):
- Checkbox + label "Stream when possible"
- Rendered adjacent to the Run Benchmark button in the prompt panel
- Mirrors `ThemeToggle` for persistence pattern; uses `localStorage["botbattle.stream"]`

**`LLMResponsePanel.tsx`** (modified):
- New props: `isStreaming?: boolean`
- If `isLoading && !response` → render `<ResponseSkeleton />` in place of the current "Loading…" text
- If `isStreaming && response` → render response text followed by `<Caret />`
- When both `response` is finalized and `!isStreaming` → current rendering (no caret)

### 6. Error handling

- **Stream aborts mid-flight:** `onError` called with a message; current partial response text is preserved; caret removed. An inline error banner renders below the response.
- **Stream succeeds but `usage` is missing:** `onDone` still fires with whatever metrics are available; missing fields render as `—`.
- **Network error before first chunk:** same as today — cell shows the error in place of the response.
- **User aborts via `AbortController`:** `onError` called with `"Aborted"`; cell shows partial text + note.
- **Toggle on, provider doesn't support streaming:** server returns JSON; client unified path handles it identically to streaming — user sees the skeleton swap to a full response at once (matches today's behavior for that provider).

### 7. Files touched

| File | Change |
|---|---|
| `web/app/api/llm/route.ts` | Branch on `stream` flag; construct streaming Response for compatible providers |
| `web/app/utils/llm/streaming.ts` | New — server-side SSE-to-NDJSON transformer |
| `web/app/utils/llm/streamClient.ts` | New — client NDJSON consumer that also handles JSON fallback |
| `web/app/utils/llm/providers/openai.stream.ts` | New — streaming variant (can be shared path or separate file; chooses what reads cleanest) |
| `web/app/utils/llm/index.ts` | Add streaming option to router signature |
| `web/app/components/ResponseSkeleton.tsx` | New — 3 shimmer bars |
| `web/app/components/StreamToggle.tsx` | New — "Stream when possible" checkbox with localStorage |
| `web/app/components/LLMResponsePanel.tsx` | Render skeleton while loading, caret while streaming |
| `web/app/page.tsx` | Read stream preference, wire streaming path, pass isStreaming prop |

### 8. Testing

- **Unit:** `parseNDJSON` — split lines across chunk boundaries, malformed JSON lines, error events, empty deltas
- **Unit:** `openAIStreamToNDJSON` — given a mock SSE `Response`, emits the expected NDJSON events (chunk + done)
- **Component:** `ResponseSkeleton` — renders 3 bars with distinct widths
- **Component:** `StreamToggle` — checkbox state, localStorage persistence, initial value reflects localStorage
- **Component:** `LLMResponsePanel` — renders skeleton when `isLoading && !response`; renders caret when `isStreaming && response`; renders plain text when `!isStreaming && response`
- **Integration:** given a mock `fetch` that returns a streaming NDJSON body, `streamLLMResponse` dispatches `onChunk` per chunk and `onDone` at end
- **Integration:** given a mock `fetch` that returns `application/json`, `streamLLMResponse` calls `onChunk` once with the full response then `onDone`
- Existing 41 tests continue to pass.

## Follow-ups (out of scope)

- Streaming for Anthropic (thinking-block event handling)
- Streaming for Google Gemini (`streamGenerateContent` REST endpoint)
- Streaming for Qwen (DashScope streaming format)
- Per-model cancel button UI
- Incremental token counter during streaming (requires provider emits partial `usage` objects — only a few do)
- Streaming the comparative-analysis response (separate route)

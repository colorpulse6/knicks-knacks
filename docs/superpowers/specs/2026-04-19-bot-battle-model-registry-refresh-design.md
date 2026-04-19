# Bot-Battle Model Registry Refresh + Reasoning UX

**Date:** 2026-04-19
**Scope:** `apps/bot-battle/web/`
**Status:** Design approved, pending implementation plan

## Problem

BotBattle's model registry was last updated around February 2025. Since then, every major provider has shipped a new generation: GPT-5 family, Claude 4.x, Gemini 3.1, Grok 4.20, Llama 4, DeepSeek V3.2, Qwen3.6. Reasoning models (o3/o4-mini, DeepSeek V3.2-Speciale, Claude extended thinking) have also become a first-class category and need dedicated UX — they run 10–20× slower and cost 5–20× more than standard models, which the current UI does not communicate.

Separately, the app has no way for users to verify that an API key they just entered actually works. Keys are stored in three synchronized locations (Zustand store, `apiKeyStore.ts` utility, localStorage); this fragility is out of scope for this refresh but flagged for a follow-up.

## Goals

1. Curate the registry down to ~18–20 current flagship models across 8 providers.
2. Add lifecycle metadata (`status`, `modelType`, `supportsReasoningEffort`, `lastVerified`) so future refreshes have a clear policy and stale entries are easy to spot.
3. Give reasoning models first-class UX: badge, effort selector, tabbed Answer/Thinking result cell, split token metrics.
4. Let users verify their API keys work via a per-provider "Test connection" button.

## Non-goals

These are known issues but deliberately out of scope for this cycle, to keep the refresh shippable. Each is a candidate follow-up:

- Consolidating API-key storage to a single source of truth
- Persisting benchmark results across refreshes
- Restructuring the model picker (search, collapsible provider groups)
- Migrating `fetch` usage to React Query (or removing the dependency)
- Fixing the header "API Settings" absolute-positioning layout on mobile

## Design

### 1. Registry schema extensions

`web/app/core/llm-registry.ts` — add four optional fields to `LLMModelSpec`. All existing entries remain valid; defaults apply when fields are omitted.

```ts
interface LLMModelSpec {
  // ...existing fields unchanged

  status?: "current" | "legacy" | "preview";   // default: "current"
  modelType?: "standard" | "reasoning";         // default: "standard"
  supportsReasoningEffort?: boolean;            // default: false
  lastVerified?: string;                        // ISO date (YYYY-MM-DD)
}
```

`status` and `modelType` are orthogonal. A model can be `legacy + standard` (GPT-4o kept for comparison) or `current + reasoning` (o3). `lastVerified` is a maintenance signal only — never surfaced in UI. Entries without it are assumed pre-refresh (untrusted).

### 2. Curation policy

To keep the registry maintainable across future refreshes:

1. A model earns `status: "current"` when it is the latest release in its tier from a major provider.
2. A model drops to `status: "legacy"` when a direct successor is released in the same tier from the same provider.
3. Legacy models are deleted entirely after 6 months unless there is a specific benchmarking reason to keep them.
4. `status: "preview"` is only applied to explicitly-preview models (e.g. Claude Mythos Preview). No defaulting to preview for unclear cases — omit the model until it is GA.

### 3. Registry content

Providers retained: OpenAI, Anthropic, Google, xAI (new), DeepSeek, Meta (via Groq), Mistral, Qwen.

Providers removed: Cohere, AI21, Nous Research, Microsoft (Phi), OpenRouter.

| Provider | Flagship | Mid/Fast | Reasoning | Legacy | Preview |
|---|---|---|---|---|---|
| OpenAI | GPT-5.4 Thinking | GPT-5 mini *(verify)* | o3, o4-mini | GPT-4o | — |
| Anthropic | Claude Opus 4.7 | Claude Haiku 4.5 | Claude Sonnet 4.6 *(extended thinking)* | Claude 3.5 Sonnet | Claude Mythos Preview |
| Google | Gemini 3.1 Pro | Gemini 3.1 Flash Live | — | — | — |
| xAI | Grok 4.20 | Grok 4 Fast/mini *(verify)* | *(reasoning variant if offered)* | — | — |
| DeepSeek | DeepSeek V3.2 | — | DeepSeek V3.2-Speciale | — | — |
| Meta *(via Groq)* | Llama 4 Maverick | Llama 4 Scout | — | — | — |
| Mistral | mistral-large-latest | Mistral Medium 3 *(verify)* | — | — | — |
| Qwen | Qwen3.6-Plus | *(verify Qwen3 fast variant)* | — | — | — |

GPT-5.4 Thinking is tagged `modelType: "reasoning"` despite also being OpenAI's flagship — the two fields are orthogonal.

Items marked *(verify)* have their IDs and pricing confirmed via WebFetch against provider documentation during implementation.

### 4. Reasoning model UX

**Badges** (`ModelSelector.tsx`). A new `ModelBadge.tsx` component renders a small pill next to the model name:

- `REASONING` — purple, for `modelType: "reasoning"`
- `LEGACY` — gray, for `status: "legacy"`
- `PREVIEW` — amber, for `status: "preview"`

`current + standard` has no badge (default state; keeps the picker quiet).

**Result cell** (`LLMResponsePanel.tsx`). For reasoning models, the cell gains:

- **Header:** model name + REASONING badge + effort selector dropdown (low/medium/high). Selector is hidden when `supportsReasoningEffort` is false.
- **Tab bar:** `Answer` | `Thinking (N tok)`. Default tab is Answer.
- **Content:** swaps per tab. Thinking tab shows the raw reasoning text if the provider streams it, otherwise a placeholder: *"Thinking not exposed by provider (N tokens used)"*.
- **Metrics row** (bottom): total time, split think/answer token counts, cost.

Standard (non-reasoning) cells are unchanged.

**Effort selector wiring:**

| Provider / model | Wire protocol |
|---|---|
| OpenAI o3, o4-mini | `reasoning: { effort: "low" \| "medium" \| "high" }` |
| Claude Sonnet 4.6 extended thinking | `thinking: { type: "enabled", budget_tokens: 1024 / 4096 / 16384 }` (maps to low/medium/high) |
| DeepSeek V3.2-Speciale | No user-facing effort; selector hidden |
| GPT-5.4 Thinking | OpenAI `reasoning.effort` pattern if supported; otherwise hidden |

### 5. API key verification

New route `POST /api/providers/test-key`:

- Request: `{ provider: string, key: string }`
- Handler: hits the provider's cheapest lightweight endpoint (typically the models-list endpoint). Returns `{ ok: true }` on 2xx, `{ ok: false, error: "..." }` on failure with a human-readable message.
- No caching; result is ephemeral per click.

UI addition (`ApiKeyInput.tsx`): a small "Test" button per provider section. On click, POSTs the current key value and renders ✓ green or ✗ red inline with the error string if present. Disabled while a test is in flight.

Key storage (the three-location sync) is explicitly not touched in this change.

### 6. Files touched

| File | Change |
|---|---|
| `web/app/core/llm-registry.ts` | Heavy rewrite — schema extensions + curated content |
| `web/app/utils/llm/providers/*.ts` | Reasoning support where applicable; delete files for removed providers |
| `web/app/api/llm/route.ts` | Thread reasoning params through to providers |
| `web/app/api/providers/test-key/route.ts` | New — key verification endpoint |
| `web/app/components/ModelBadge.tsx` | New — small pill renderer |
| `web/app/components/ModelSelector.tsx` | Render badges alongside model names |
| `web/app/components/LLMResponsePanel.tsx` | Tabbed layout for reasoning models, effort selector, split metrics |
| `web/app/components/ApiKeyInput.tsx` | Per-provider "Test" button |
| `web/app/settings/page.tsx` | Remove dropped providers; add xAI and Qwen input sections |

### 7. Testing

- **Unit:** new registry fields default correctly when omitted; curation spot-checks (every current model has `lastVerified` set).
- **Component:** `LLMResponsePanel` renders tabs only when `modelType === "reasoning"`; tab switching changes content; effort selector is hidden when `supportsReasoningEffort` is false.
- **Component:** `ModelBadge` renders correct color/text for each status/modelType combination.
- **Integration:** `/api/providers/test-key` returns `{ok:true}` for a mocked 200 response and `{ok:false, error}` for 401/403 responses — one test per retained provider.
- Existing provider unit tests updated where reasoning-token parsing was added.

## Follow-ups (out of scope)

- API key storage consolidation (single source of truth via Zustand `persist` middleware)
- Benchmark result persistence (localStorage or server-side)
- Model picker restructure (search, collapsible provider sections) — will be wanted if the curated list ever grows back past ~25
- React Query adoption or removal
- Header mobile layout fix (absolute-positioned "API Settings" link overflows on narrow viewports)

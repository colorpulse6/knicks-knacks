# BotBattle Model Registry Refresh + Reasoning UX — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh BotBattle's model registry to ~18-20 current flagship models across 8 providers, add lifecycle metadata, give reasoning models first-class UX (tabbed Answer/Thinking cell, effort selector, split token metrics), and add per-provider API key verification.

**Architecture:** Additive schema change to `LLMModelSpec` (new optional fields). Curated rewrite of `llm-registry.ts`. New `ModelBadge` component consumed by `ModelSelector`. `LLMResponsePanel` gains a tabbed sub-view rendered only when `modelType === "reasoning"`. New `/api/providers/test-key` route for verifying user-entered keys. API key storage plumbing is untouched (deliberate — follow-up).

**Tech Stack:** Next.js 15.3.1 App Router, React 18.3.1, Tailwind CSS 4.0.5, Zustand 4.4.0, Vitest 1.0.0, @testing-library/react 14.0.0, Radix UI primitives, Lucide icons, raw-fetch provider integrations.

**Spec:** `docs/superpowers/specs/2026-04-19-bot-battle-model-registry-refresh-design.md`

**Working directory (all paths relative to):** `apps/bot-battle/web`

---

## Research Adjustments (2026-04-20)

After Task 3 verified current model availability, the user approved these adjustments:

- **Meta provider dropped entirely.** Llama 4 Maverick is deprecated on Groq (March 2026); Scout is preview-only. Not worth the plumbing for this cycle. **Provider count: 7** (was 8): OpenAI, Anthropic, Google, xAI, DeepSeek, Mistral, Qwen.
- **DeepSeek V3.2-Speciale removed.** Endpoint expired December 2025 — only reachable via OpenRouter, which we dropped. DeepSeek provider offers just `deepseek-chat` (V3.2) as a standard (non-reasoning) model.
- **Claude 3.5 Sonnet legacy entry removed.** Anthropic retired it October 2025.
- **GPT-4o legacy entry removed.** Retired from ChatGPT April 2026; raw API status uncertain.
- **GPT-5.4 Thinking consolidated.** There is no separate API ID — it's `gpt-5.4` with `reasoning.effort` set. One entry in the registry, `modelType: "reasoning"`, `supportsReasoningEffort: true`.

**Resulting curated list (~15 models):**

| Provider | Models |
|---|---|
| OpenAI | gpt-5.4 (reasoning), gpt-5.4-mini, o3 (reasoning), o4-mini (reasoning) |
| Anthropic | claude-opus-4-7, claude-sonnet-4-6 (reasoning, extended thinking), claude-haiku-4-5, Claude Mythos Preview *(if accessible)* |
| Google | gemini-3.1-pro, gemini-3.1-flash-live |
| xAI | grok-4.20, grok-4.1-fast *(name pending verification during Task 7)* |
| DeepSeek | deepseek-chat (V3.2) |
| Mistral | mistral-large-latest, mistral-medium-3.1 |
| Qwen | qwen3.6-plus |

**Task impacts:**
- **Task 4:** Also delete `meta.ts` provider file; remove `META_API_KEY` env check.
- **Task 6:** Use the trimmed list above. Consult `docs/superpowers/plans/2026-04-19-bot-battle-model-ids-verified.md` for exact IDs, pricing, and context windows.
- **Task 15 (DeepSeek reasoning token parsing):** **SKIPPED** — no reasoning model for DeepSeek in this cycle. Provider still gets a light cleanup pass if needed.
- **Task 19:** Also purge `meta` / `metaapi` / `META_API_KEY` references.

---

## Preconditions

Vitest is installed in `devDependencies` but has no config file and no tests exist in the app. Task 1 sets up the harness before any TDD work begins.

---

### Task 1: Set up Vitest harness

**Files:**
- Create: `apps/bot-battle/web/vitest.config.ts`
- Create: `apps/bot-battle/web/test/setup.ts`
- Modify: `apps/bot-battle/web/package.json` (confirm `"test": "vitest"` script exists — it already does)

- [ ] **Step 1: Create vitest config**

Write to `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    include: ["app/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
  },
});
```

- [ ] **Step 2: Add missing dev dependencies**

Vitest with React needs `@vitejs/plugin-react` and `jsdom`. Add them:
```bash
yarn workspace @knicks-knacks/bot-battle-web add -D @vitejs/plugin-react jsdom @testing-library/jest-dom
```

- [ ] **Step 3: Create test setup file**

Write to `test/setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Write a smoke test**

Write to `app/__tests__/harness.test.ts`:
```ts
import { describe, it, expect } from "vitest";
describe("harness", () => {
  it("runs", () => { expect(1 + 1).toBe(2); });
});
```

- [ ] **Step 5: Run test to verify harness works**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run`
Expected: 1 test passes in `app/__tests__/harness.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/vitest.config.ts apps/bot-battle/web/test/setup.ts apps/bot-battle/web/app/__tests__/harness.test.ts apps/bot-battle/web/package.json
git commit -m "chore(bot-battle): set up vitest + testing-library harness"
```

---

### Task 2: Extend `LLMModelSpec` schema

**Files:**
- Modify: `apps/bot-battle/web/app/core/llm-registry.ts:8-22`
- Create: `apps/bot-battle/web/app/core/llm-registry.test.ts`

- [ ] **Step 1: Write failing test for schema defaults**

Write to `app/core/llm-registry.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import type { LLMModelSpec } from "./llm-registry";

describe("LLMModelSpec schema", () => {
  it("accepts new lifecycle fields", () => {
    const model: LLMModelSpec = {
      id: "test-model",
      displayName: "Test",
      contextWindow: 1000,
      costType: "userKeyRequired",
      status: "current",
      modelType: "reasoning",
      supportsReasoningEffort: true,
      lastVerified: "2026-04-19",
    };
    expect(model.status).toBe("current");
    expect(model.modelType).toBe("reasoning");
    expect(model.supportsReasoningEffort).toBe(true);
    expect(model.lastVerified).toBe("2026-04-19");
  });

  it("treats new fields as optional", () => {
    const model: LLMModelSpec = {
      id: "test",
      displayName: "Test",
      contextWindow: 1000,
      costType: "userKeyRequired",
    };
    expect(model.status).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — expect TS failure**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/core/llm-registry.test.ts`
Expected: Type error on `status`/`modelType`/`supportsReasoningEffort`/`lastVerified` — fields don't exist yet.

- [ ] **Step 3: Extend interface**

Edit `app/core/llm-registry.ts` interface `LLMModelSpec` (after existing fields, before closing brace):
```ts
  status?: "current" | "legacy" | "preview";
  modelType?: "standard" | "reasoning";
  supportsReasoningEffort?: boolean;
  lastVerified?: string;
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/core/llm-registry.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/core/llm-registry.ts apps/bot-battle/web/app/core/llm-registry.test.ts
git commit -m "feat(bot-battle): extend LLMModelSpec with lifecycle metadata"
```

---

### Task 3: Verify current model IDs and pricing

Before rewriting registry content, confirm the specifics for each model flagged `(verify)` in the spec. This is research only — no code changes this task.

**Models to verify** (produce a notes file capturing findings):

| Model | Check |
|---|---|
| OpenAI GPT-5.4 Thinking | Exact model ID, pricing per 1M tokens input/output, context window, whether it uses `reasoning.effort` parameter |
| OpenAI GPT-5 mini (or equivalent non-reasoning flagship) | Whether a non-reasoning GPT-5 exists; ID, pricing |
| OpenAI o3 / o4-mini | Latest IDs, pricing, reasoning effort levels |
| Anthropic Claude Opus 4.7 | `claude-opus-4-7` — confirm ID, pricing, context window (should be 1M) |
| Anthropic Claude Sonnet 4.6 | `claude-sonnet-4-6` — confirm ID, pricing, extended thinking `budget_tokens` valid range |
| Anthropic Claude Haiku 4.5 | `claude-haiku-4-5-20251001` — confirm ID, pricing |
| Anthropic Claude Mythos Preview | Official ID if public, pricing, availability |
| Google Gemini 3.1 Pro / 3.1 Flash Live | Exact API model IDs, pricing, whether Live requires WebSocket vs REST |
| xAI Grok 4.20 + any fast/mini variants | API endpoint, model IDs, pricing, whether xAI has a reasoning model |
| DeepSeek V3.2 + V3.2-Speciale | API endpoint, model IDs, reasoning token shape in response |
| Meta Llama 4 Maverick / Scout via Groq | Groq model IDs for each |
| Mistral Large / Medium 3 | `mistral-large-latest` confirmation, `mistral-medium-3` ID |
| Qwen3.6-Plus | API endpoint, model ID, auth method |

- [ ] **Step 1: WebFetch each provider's model/pricing documentation page**

For each provider listed, use WebFetch against the public docs page (platform.openai.com/docs/models, docs.anthropic.com/models, ai.google.dev/models, docs.x.ai, api-docs.deepseek.com, docs.mistral.ai, groq.com/docs/models, dashscope.console.aliyun.com for Qwen). Record findings.

- [ ] **Step 2: Capture findings**

Write to `docs/superpowers/plans/2026-04-19-bot-battle-model-ids-verified.md`:
```markdown
# Verified Model IDs — 2026-04-19

## OpenAI
- [model]: id=`...`, input=$.../1M, output=$.../1M, ctx=..., supportsReasoningEffort=true/false
...
```

- [ ] **Step 3: Commit the findings doc**

```bash
git add docs/superpowers/plans/2026-04-19-bot-battle-model-ids-verified.md
git commit -m "docs(bot-battle): record verified model IDs + pricing for refresh"
```

**Why this task exists:** The model IDs in the spec are the *shape*. Without verification, the plan author will guess and guessed IDs will 404 at runtime. This task produces the source-of-truth doc that Task 5 consumes.

---

### Task 4: Remove dropped provider files and registry entries

Providers to fully remove: Cohere, AI21, Nous Research, Microsoft, OpenRouter. Keep Qwen (user pulled it back in).

**Files:**
- Delete: `apps/bot-battle/web/app/utils/llm/providers/cohere.ts`
- Delete: `apps/bot-battle/web/app/utils/llm/providers/ai21.ts`
- Delete: `apps/bot-battle/web/app/utils/llm/providers/microsoft.ts`
- Delete: `apps/bot-battle/web/app/utils/llm/providers/openrouter.ts`
- Modify: `apps/bot-battle/web/app/utils/llm/providers/index.ts` (remove exports)
- Modify: `apps/bot-battle/web/app/utils/llm/index.ts` (remove routing for these providers)
- Modify: `apps/bot-battle/web/app/api/llm/route.ts:5-15,48-64` (remove OPENROUTER_BASED_PROVIDERS, HYBRID_PROVIDERS, env-key checks for removed providers)

- [ ] **Step 1: Delete provider files**

```bash
rm apps/bot-battle/web/app/utils/llm/providers/cohere.ts
rm apps/bot-battle/web/app/utils/llm/providers/ai21.ts
rm apps/bot-battle/web/app/utils/llm/providers/microsoft.ts
rm apps/bot-battle/web/app/utils/llm/providers/openrouter.ts
```

Note: There is no `nousresearch.ts` file currently — Nous entries in the registry are routed via OpenRouter. Removing OpenRouter provider file is sufficient.

- [ ] **Step 2: Update `providers/index.ts`**

Remove these lines:
```ts
export { callCohereAPI } from "./cohere";
export { callAI21API } from "./ai21";
export { callMicrosoftAPI } from "./microsoft";
export {
  callOpenRouterGeneric,
  callOpenRouterClaude,
  callOpenRouterDeepSeek,
} from "./openrouter";
```

- [ ] **Step 3: Update `app/utils/llm/index.ts` routing**

Open `app/utils/llm/index.ts`. Remove any `case "cohere"`, `case "ai21"`, `case "microsoft"`, `case "openrouter"`, `case "nousresearch"` branches from `callLLMWithProviderAndModel`. Read the file first — there may also be fallback logic referencing OpenRouter that needs to go.

- [ ] **Step 4: Simplify `api/llm/route.ts`**

In `apps/bot-battle/web/app/api/llm/route.ts`:
- Delete the `OPENROUTER_BASED_PROVIDERS` constant (lines 6–12) and the `HYBRID_PROVIDERS` constant (line 15).
- Delete the entire `if (OPENROUTER_BASED_PROVIDERS.includes(...))` block (~lines 67–78).
- Delete the entire `if (HYBRID_PROVIDERS.includes(...))` block (~lines 81–105).
- Delete env-key checks for removed providers: `OPENROUTER_API_KEY`, `COHERE_API_KEY`, `AI21_API_KEY`, `MICROSOFT_API_KEY` (these are in lines 48–64).
- Keep env-key checks for: GROQ, OPENAI, GEMINI/GOOGLE, ANTHROPIC, MISTRAL, META, DEEPSEEK, QWEN, plus add XAI.

- [ ] **Step 5: Add xAI env key check**

Add to the env-key check block in `route.ts`:
```ts
if (process.env.XAI_API_KEY) availableApiKeys.xai = true;
```

- [ ] **Step 6: Verify build**

Run: `yarn workspace @knicks-knacks/bot-battle-web build`
Expected: Success. If TypeScript errors reference removed symbols elsewhere (registry still has Cohere/AI21/etc. entries), that's OK — Task 6 rewrites the registry which will resolve them. For now, either leave these build errors OR stub out the calls temporarily. Prefer: combine this task's commit with Task 6 if the build breaks here.

- [ ] **Step 7: Commit (together with Task 6 if build failed)**

If build succeeds:
```bash
git add -u apps/bot-battle/web/app/utils/llm apps/bot-battle/web/app/api/llm/route.ts
git commit -m "refactor(bot-battle): drop OpenRouter/Cohere/AI21/Microsoft providers"
```

If build failed, continue to Task 6 and commit both together.

---

### Task 5: Define curation invariant tests for the registry

Write tests that the rewritten registry (Task 6) must satisfy. Tests fail until Task 6 completes.

**Files:**
- Modify: `apps/bot-battle/web/app/core/llm-registry.test.ts`

- [ ] **Step 1: Add invariant tests**

Append to `llm-registry.test.ts`:
```ts
import { LLM_REGISTRY } from "./llm-registry";

describe("LLM_REGISTRY curation invariants", () => {
  const ALLOWED_PROVIDER_IDS = [
    "openai", "anthropic", "google", "xai",
    "deepseek", "meta", "mistral", "qwen",
  ];

  it("only includes allowed providers", () => {
    const ids = LLM_REGISTRY.map(p => p.id);
    for (const id of ids) {
      expect(ALLOWED_PROVIDER_IDS).toContain(id);
    }
  });

  it("every model has lastVerified set", () => {
    for (const provider of LLM_REGISTRY) {
      for (const m of provider.models) {
        expect(m.lastVerified, `${provider.id}/${m.id} missing lastVerified`)
          .toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("every model has a status", () => {
    for (const provider of LLM_REGISTRY) {
      for (const m of provider.models) {
        expect(m.status, `${provider.id}/${m.id} missing status`).toBeDefined();
      }
    }
  });

  it("reasoning models have modelType set", () => {
    // spot check: o3, Sonnet 4.6, DeepSeek V3.2-Speciale must be reasoning
    const reasoningIds = [
      "openai:o3",
      "openai:o4-mini",
      "anthropic:claude-sonnet-4-6",
      "deepseek:deepseek-v3.2-speciale",
    ];
    for (const compositeId of reasoningIds) {
      const [providerId, modelId] = compositeId.split(":");
      const provider = LLM_REGISTRY.find(p => p.id === providerId);
      const model = provider?.models.find(m => m.id === modelId);
      expect(model, `${compositeId} missing from registry`).toBeDefined();
      expect(model?.modelType).toBe("reasoning");
    }
  });

  it("registry size is in curated range", () => {
    const count = LLM_REGISTRY.reduce((sum, p) => sum + p.models.length, 0);
    expect(count).toBeGreaterThanOrEqual(15);
    expect(count).toBeLessThanOrEqual(25);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/core/llm-registry.test.ts`
Expected: Failures — current registry has Cohere/AI21/etc., no `lastVerified` fields, count is ~50.

- [ ] **Step 3: Do not commit yet**

These tests will pass after Task 6. Continue.

---

### Task 6: Rewrite `llm-registry.ts` content

**Files:**
- Modify: `apps/bot-battle/web/app/core/llm-registry.ts:33-end`

Consume the verified model IDs from `docs/superpowers/plans/2026-04-19-bot-battle-model-ids-verified.md` (Task 3 output).

- [ ] **Step 1: Replace `LLM_REGISTRY` export with curated content**

The registry should contain exactly 8 providers: openai, anthropic, google, xai, deepseek, meta, mistral, qwen. Each model entry MUST include:
- Existing fields (id, displayName, contextWindow, cost, costType, capabilities, description)
- New fields: `status`, `modelType` (default "standard"), `supportsReasoningEffort` (default false), `lastVerified: "2026-04-19"`

Target shape (fill with verified values from Task 3):

```ts
export const LLM_REGISTRY: LLMProviderSpec[] = [
  {
    id: "openai",
    displayName: "OpenAI",
    apiKeyProviderName: "OpenAI",
    apiKeyLink: "https://platform.openai.com/api-keys",
    providerWebsite: "https://openai.com",
    models: [
      // GPT-5.4 Thinking — flagship + reasoning
      { id: "<verified>", displayName: "GPT-5.4 Thinking", contextWindow: /*verified*/,
        cost: { /*verified*/ }, costType: "userKeyRequired",
        status: "current", modelType: "reasoning", supportsReasoningEffort: true,
        lastVerified: "2026-04-19",
        capabilities: ["text","code","json","tool_use","reasoning","long_context"],
        description: "..." },
      // GPT-5 mini (or equivalent mid-tier non-reasoning if exists)
      { id: "<verified>", displayName: "GPT-5 mini", /* ... */
        status: "current", modelType: "standard", lastVerified: "2026-04-19" },
      // o3 — reasoning
      { id: "o3", displayName: "o3", /* ... */
        status: "current", modelType: "reasoning", supportsReasoningEffort: true,
        lastVerified: "2026-04-19" },
      // o4-mini — reasoning
      { id: "o4-mini", displayName: "o4-mini", /* ... */
        status: "current", modelType: "reasoning", supportsReasoningEffort: true,
        lastVerified: "2026-04-19" },
      // GPT-4o — legacy, kept for comparison
      { id: "gpt-4o", displayName: "GPT-4o", /* ... */
        status: "legacy", modelType: "standard", lastVerified: "2026-04-19" },
    ],
  },
  {
    id: "anthropic",
    displayName: "Anthropic",
    // ...
    models: [
      // Claude Opus 4.7 — flagship
      { id: "claude-opus-4-7", displayName: "Claude Opus 4.7",
        status: "current", modelType: "standard", lastVerified: "2026-04-19", /* ... */ },
      // Claude Sonnet 4.6 — extended thinking capable
      { id: "claude-sonnet-4-6", displayName: "Claude Sonnet 4.6",
        status: "current", modelType: "reasoning", supportsReasoningEffort: true,
        lastVerified: "2026-04-19", /* ... */ },
      // Claude Haiku 4.5 — fast/cheap
      { id: "claude-haiku-4-5-20251001", displayName: "Claude Haiku 4.5",
        status: "current", modelType: "standard", lastVerified: "2026-04-19", /* ... */ },
      // Claude Mythos Preview
      { id: "<verified>", displayName: "Claude Mythos Preview",
        status: "preview", modelType: "standard", lastVerified: "2026-04-19", /* ... */ },
      // Claude 3.5 Sonnet — legacy
      { id: "claude-3-5-sonnet-20241022", displayName: "Claude 3.5 Sonnet",
        status: "legacy", modelType: "standard", lastVerified: "2026-04-19", /* ... */ },
    ],
  },
  // ... google, xai, deepseek, meta, mistral, qwen
];
```

See spec Section 3 for the full table of what to include per provider. Every model must have a concrete description, accurate context window, and pricing (copied from verified findings doc).

- [ ] **Step 2: Run invariant tests — expect PASS**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/core/llm-registry.test.ts`
Expected: All tests pass (schema + curation invariants).

- [ ] **Step 3: Run typecheck + build**

Run: `yarn workspace @knicks-knacks/bot-battle-web build`
Expected: Success. Failures here likely mean downstream code references deleted provider symbols (callCohereAPI etc.) — fix by removing the references.

- [ ] **Step 4: Commit**

```bash
git add apps/bot-battle/web/app/core/llm-registry.ts apps/bot-battle/web/app/core/llm-registry.test.ts
git commit -m "feat(bot-battle): rewrite registry with 2026 flagship models"
```

If Task 4 build failed, include those changes in this commit with message:
```bash
git commit -m "refactor(bot-battle): drop deprecated providers, rewrite registry with 2026 flagships"
```

---

### Task 7: Add xAI provider integration

**Files:**
- Create: `apps/bot-battle/web/app/utils/llm/providers/xai.ts`
- Modify: `apps/bot-battle/web/app/utils/llm/providers/index.ts`
- Modify: `apps/bot-battle/web/app/utils/llm/index.ts` (add `case "xai"` routing)

- [ ] **Step 1: Create `xai.ts` modeled on `openai.ts`**

xAI's API is OpenAI-compatible. Copy the structure of `openai.ts` and change:
- Endpoint: `https://api.x.ai/v1/chat/completions`
- `getApiKey("xai", process.env.XAI_API_KEY)`
- Function name: `callXAIAPI`
- Error messages reference "xAI"

Confirm endpoint path against xAI docs during Task 3 verification.

- [ ] **Step 2: Export from `providers/index.ts`**

Add: `export { callXAIAPI } from "./xai";`

- [ ] **Step 3: Wire into `utils/llm/index.ts`**

Add a `case "xai"` branch in `callLLMWithProviderAndModel` that calls `callXAIAPI(prompt, signal, modelId)`.

- [ ] **Step 4: Smoke test via dev server** *(manual)*

```bash
yarn workspace @knicks-knacks/bot-battle-web dev
```
In the settings page, paste a valid xAI key, select Grok 4.20, submit a prompt, confirm response.

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/utils/llm
git commit -m "feat(bot-battle): add xAI provider integration"
```

---

### Task 8: Build `ModelBadge` component

**Files:**
- Create: `apps/bot-battle/web/app/components/ModelBadge.tsx`
- Create: `apps/bot-battle/web/app/components/ModelBadge.test.tsx`

- [ ] **Step 1: Write failing test**

Write to `app/components/ModelBadge.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModelBadge } from "./ModelBadge";

describe("ModelBadge", () => {
  it("renders REASONING for reasoning modelType", () => {
    render(<ModelBadge modelType="reasoning" status="current" />);
    expect(screen.getByText("REASONING")).toBeInTheDocument();
  });

  it("renders LEGACY for legacy status", () => {
    render(<ModelBadge modelType="standard" status="legacy" />);
    expect(screen.getByText("LEGACY")).toBeInTheDocument();
  });

  it("renders PREVIEW for preview status", () => {
    render(<ModelBadge modelType="standard" status="preview" />);
    expect(screen.getByText("PREVIEW")).toBeInTheDocument();
  });

  it("renders REASONING first when both reasoning and legacy", () => {
    const { container } = render(<ModelBadge modelType="reasoning" status="legacy" />);
    const badges = container.querySelectorAll("[data-badge]");
    expect(badges[0]).toHaveAttribute("data-badge", "reasoning");
    expect(badges[1]).toHaveAttribute("data-badge", "legacy");
  });

  it("renders nothing for current + standard", () => {
    const { container } = render(<ModelBadge modelType="standard" status="current" />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/components/ModelBadge.test.tsx`
Expected: FAIL (component not found).

- [ ] **Step 3: Implement `ModelBadge`**

Write to `app/components/ModelBadge.tsx`:
```tsx
import React from "react";

type Status = "current" | "legacy" | "preview";
type ModelType = "standard" | "reasoning";

interface ModelBadgeProps {
  status?: Status;
  modelType?: ModelType;
}

const PILL = "inline-block text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ml-1.5";

export const ModelBadge: React.FC<ModelBadgeProps> = ({ status, modelType }) => {
  const pills: React.ReactNode[] = [];
  if (modelType === "reasoning") {
    pills.push(<span key="r" data-badge="reasoning" className={`${PILL} bg-purple-600 text-white`}>REASONING</span>);
  }
  if (status === "legacy") {
    pills.push(<span key="l" data-badge="legacy" className={`${PILL} bg-gray-400 text-white`}>LEGACY</span>);
  }
  if (status === "preview") {
    pills.push(<span key="p" data-badge="preview" className={`${PILL} bg-amber-500 text-white`}>PREVIEW</span>);
  }
  if (pills.length === 0) return null;
  return <>{pills}</>;
};
```

- [ ] **Step 4: Run test — expect PASS**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/components/ModelBadge.test.tsx`
Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/ModelBadge.tsx apps/bot-battle/web/app/components/ModelBadge.test.tsx
git commit -m "feat(bot-battle): add ModelBadge component"
```

---

### Task 9: Wire `ModelBadge` into `ModelSelector`

**Files:**
- Modify: `apps/bot-battle/web/app/components/ModelSelector.tsx`

- [ ] **Step 1: Read the file**

Read `app/components/ModelSelector.tsx`. Identify where each model's display name is rendered (likely inside a `map` over provider.models).

- [ ] **Step 2: Import ModelBadge**

Add near top: `import { ModelBadge } from "./ModelBadge";`

- [ ] **Step 3: Render badge next to each model name**

Wherever `{model.displayName}` is rendered, change to:
```tsx
{model.displayName}
<ModelBadge status={model.status} modelType={model.modelType} />
```

- [ ] **Step 4: Manual verification**

```bash
yarn workspace @knicks-knacks/bot-battle-web dev
```
Navigate to the selector. Confirm: GPT-4o shows LEGACY, o3 shows REASONING, Claude Mythos Preview shows PREVIEW, current standard models show no badge.

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/ModelSelector.tsx
git commit -m "feat(bot-battle): render ModelBadge in ModelSelector"
```

---

### Task 10: Build `EffortSelector` component

**Files:**
- Create: `apps/bot-battle/web/app/components/EffortSelector.tsx`
- Create: `apps/bot-battle/web/app/components/EffortSelector.test.tsx`

- [ ] **Step 1: Write failing tests**

Write to `app/components/EffortSelector.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EffortSelector, effortToBudgetTokens } from "./EffortSelector";

describe("EffortSelector", () => {
  it("renders low/medium/high options", () => {
    render(<EffortSelector value="medium" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("medium");
    expect(select.querySelectorAll("option").length).toBe(3);
  });

  it("fires onChange with new value", () => {
    const onChange = vi.fn();
    render(<EffortSelector value="medium" onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "high" } });
    expect(onChange).toHaveBeenCalledWith("high");
  });
});

describe("effortToBudgetTokens", () => {
  it("maps low/medium/high to 1024/4096/16384", () => {
    expect(effortToBudgetTokens("low")).toBe(1024);
    expect(effortToBudgetTokens("medium")).toBe(4096);
    expect(effortToBudgetTokens("high")).toBe(16384);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

Write to `app/components/EffortSelector.tsx`:
```tsx
import React from "react";

export type Effort = "low" | "medium" | "high";

const BUDGET_MAP: Record<Effort, number> = {
  low: 1024,
  medium: 4096,
  high: 16384,
};

export function effortToBudgetTokens(effort: Effort): number {
  return BUDGET_MAP[effort];
}

interface Props {
  value: Effort;
  onChange: (e: Effort) => void;
}

export const EffortSelector: React.FC<Props> = ({ value, onChange }) => (
  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
    Effort:
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Effort)}
      className="text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-700"
    >
      <option value="low">low</option>
      <option value="medium">medium</option>
      <option value="high">high</option>
    </select>
  </label>
);
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/EffortSelector.tsx apps/bot-battle/web/app/components/EffortSelector.test.tsx
git commit -m "feat(bot-battle): add EffortSelector + effort-to-budget-tokens map"
```

---

### Task 11: Build reasoning result cell (tabs + split metrics) in `LLMResponsePanel`

**Files:**
- Modify: `apps/bot-battle/web/app/components/LLMResponsePanel.tsx`
- Create: `apps/bot-battle/web/app/components/LLMResponsePanel.test.tsx`

Extend the props to carry reasoning data. Render the tabbed Answer/Thinking UI only when the model is a reasoning model.

- [ ] **Step 1: Extend `LLMResponsePanelProps`**

In `LLMResponsePanel.tsx`, expand the interface:
```ts
interface LLMResponsePanelProps {
  model: string;
  modelType?: "standard" | "reasoning";
  status?: "current" | "legacy" | "preview";
  supportsReasoningEffort?: boolean;
  effort?: "low" | "medium" | "high";
  onEffortChange?: (e: "low"|"medium"|"high") => void;
  isLoading?: boolean;
  response?: string | React.ReactNode;
  thinking?: string;            // raw reasoning text, if provider streamed it
  metrics?: Record<string, string | number | undefined>;
  // New metric keys expected: reasoningTokens, answerTokens
}
```

- [ ] **Step 2: Write failing tests**

Write to `app/components/LLMResponsePanel.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LLMResponsePanel } from "./LLMResponsePanel";

describe("LLMResponsePanel", () => {
  it("standard models: no tabs rendered", () => {
    render(<LLMResponsePanel model="gpt-5-mini" modelType="standard" response="hi" />);
    expect(screen.queryByRole("tab", { name: /thinking/i })).toBeNull();
  });

  it("reasoning models: tabs for Answer and Thinking", () => {
    render(
      <LLMResponsePanel
        model="o3"
        modelType="reasoning"
        response="the answer"
        thinking="step 1 step 2"
        metrics={{ reasoningTokens: 500, answerTokens: 20 }}
      />
    );
    expect(screen.getByRole("tab", { name: /answer/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /thinking/i })).toBeInTheDocument();
  });

  it("default tab is Answer; Thinking tab shows thinking on click", () => {
    render(
      <LLMResponsePanel
        model="o3" modelType="reasoning"
        response="the answer" thinking="internal scratch"
      />
    );
    expect(screen.getByText("the answer")).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: /thinking/i }));
    expect(screen.getByText("internal scratch")).toBeVisible();
  });

  it("Thinking tab shows placeholder when thinking not provided", () => {
    render(
      <LLMResponsePanel
        model="deepseek-v3.2-speciale"
        modelType="reasoning"
        response="answer"
        metrics={{ reasoningTokens: 412 }}
      />
    );
    fireEvent.click(screen.getByRole("tab", { name: /thinking/i }));
    expect(screen.getByText(/not exposed/i)).toBeInTheDocument();
    expect(screen.getByText(/412 tokens used/i)).toBeInTheDocument();
  });

  it("hides effort selector when supportsReasoningEffort is false", () => {
    render(<LLMResponsePanel model="r1" modelType="reasoning" response="a" />);
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
```

- [ ] **Step 3: Run — expect FAIL**

- [ ] **Step 4: Implement**

Refactor `LLMResponsePanel` so that when `modelType === "reasoning"`:
- Render the `EffortSelector` in the header (guarded by `supportsReasoningEffort`)
- Render a tab bar with two tabs (`role="tablist"`, each tab has `role="tab"`)
- Active tab content is swapped based on state
- Standard models render the existing layout unchanged

Key implementation points:
```tsx
const [tab, setTab] = useState<"answer" | "thinking">("answer");
const isReasoning = modelType === "reasoning";
// ...
{isReasoning && (
  <div role="tablist" className="flex border-b border-gray-200 dark:border-gray-700">
    <button role="tab" aria-selected={tab === "answer"}
      onClick={() => setTab("answer")}
      className={`px-3 py-1.5 text-sm ${tab === "answer" ? "border-b-2 border-purple-600 font-semibold" : "opacity-60"}`}>
      Answer
    </button>
    <button role="tab" aria-selected={tab === "thinking"}
      onClick={() => setTab("thinking")}
      className={...}>
      Thinking{metrics?.reasoningTokens ? ` (${metrics.reasoningTokens} tok)` : ""}
    </button>
  </div>
)}
```

For the thinking tab placeholder:
```tsx
{tab === "thinking" && (
  thinking
    ? <pre className="text-xs font-mono opacity-80">{thinking}</pre>
    : <p className="text-sm italic opacity-70">
        Thinking not exposed by provider ({metrics?.reasoningTokens ?? 0} tokens used)
      </p>
)}
```

Add a split-metrics row for reasoning models showing reasoningTokens and answerTokens alongside existing metrics.

- [ ] **Step 5: Run — expect PASS**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run app/components/LLMResponsePanel.test.tsx`

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/app/components/LLMResponsePanel.tsx apps/bot-battle/web/app/components/LLMResponsePanel.test.tsx
git commit -m "feat(bot-battle): add tabbed reasoning UX to LLMResponsePanel"
```

---

### Task 12: Thread reasoning params through `/api/llm` route

**Files:**
- Modify: `apps/bot-battle/web/app/api/llm/route.ts`
- Modify: `apps/bot-battle/web/app/utils/llm/index.ts`

Accept `effort?: "low"|"medium"|"high"` in the POST body. Pass through to provider handlers via a shared options object.

- [ ] **Step 1: Update request handler**

In `route.ts`, destructure `effort` from the body:
```ts
const { providerId, modelId, prompt, effort } = body;
```

- [ ] **Step 2: Pass to `callLLMWithProviderAndModel`**

Update the signature of `callLLMWithProviderAndModel` in `utils/llm/index.ts` to accept an options bag:
```ts
interface LLMCallOptions {
  signal?: AbortSignal;
  effort?: "low" | "medium" | "high";
}
```

Route `effort` down to each provider handler that accepts it (OpenAI o3/o4-mini/GPT-5.4, Anthropic Sonnet 4.6).

- [ ] **Step 3: Update client `fetchLLMResponse`**

In `app/page.tsx` (or wherever `fetchLLMResponse` lives), add `effort` to the POST body when the selected model is a reasoning model. Pull the effort value from local state (one per model).

- [ ] **Step 4: Manual verify via dev server**

- [ ] **Step 5: Commit**

```bash
git add -u apps/bot-battle/web/app
git commit -m "feat(bot-battle): thread reasoning effort param through /api/llm"
```

---

### Task 13: OpenAI provider — reasoning support

**Files:**
- Modify: `apps/bot-battle/web/app/utils/llm/providers/openai.ts`

For reasoning models (`o3`, `o4-mini`, `gpt-5.4-thinking`):
- Use the `/v1/responses` endpoint (not `/v1/chat/completions`) if required by the model — confirm during Task 3 verification
- Include `reasoning: { effort }` in the body
- Parse reasoning tokens from `usage.reasoning_tokens` and return them as `metrics.reasoningTokens`
- Return `thinking` field if the API exposes reasoning text (likely no — OpenAI hides it)

- [ ] **Step 1: Update `callOpenAIAPI` signature**

```ts
export async function callOpenAIAPI(
  prompt: string,
  signal?: AbortSignal,
  modelId: string = "gpt-4.1",
  options?: { effort?: "low" | "medium" | "high"; isReasoning?: boolean },
): Promise<...>
```

- [ ] **Step 2: Branch on `isReasoning`**

If `options?.isReasoning`, use the reasoning request shape (endpoint, body params per OpenAI docs verified in Task 3). Otherwise use existing chat-completions path.

- [ ] **Step 3: Parse reasoning tokens**

```ts
const reasoningTokens = usage.reasoning_tokens;  // or whatever the verified shape shows
return { response, metrics: { ..., reasoningTokens, answerTokens: outputTokens } };
```

- [ ] **Step 4: Have `utils/llm/index.ts` pass `isReasoning` based on `modelType`**

In the router, look up `getModelSpec(providerId, modelId).modelType` and pass `isReasoning: modelType === "reasoning"` plus `effort`.

- [ ] **Step 5: Smoke test with o3 via dev server**

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/app/utils/llm/providers/openai.ts apps/bot-battle/web/app/utils/llm/index.ts
git commit -m "feat(bot-battle): OpenAI reasoning model support (o3, o4-mini, GPT-5.4)"
```

---

### Task 14: Anthropic provider — extended thinking support

**Files:**
- Modify: `apps/bot-battle/web/app/utils/llm/providers/anthropic.ts`

For Claude Sonnet 4.6 when `isReasoning`:
- Include `thinking: { type: "enabled", budget_tokens: effortToBudgetTokens(effort) }` in the body
- Parse thinking content from the response. Claude returns content blocks; reasoning comes as `{type: "thinking", thinking: "..."}`.
- Return `thinking` (raw reasoning string) and `reasoningTokens` in metrics

- [ ] **Step 1: Read current `anthropic.ts`**

- [ ] **Step 2: Add `options?: { effort?, isReasoning? }` parameter**

- [ ] **Step 3: Conditionally include `thinking` param and parse response blocks**

Use `effortToBudgetTokens` imported from `components/EffortSelector` — or better, extract it to `app/core/reasoning.ts` and import there. Prefer extraction (DRY) since the provider file shouldn't depend on a component.

- [ ] **Step 4: Refactor: move `effortToBudgetTokens` to `app/core/reasoning.ts`**

Move `effortToBudgetTokens` (and the `Effort` type) out of `EffortSelector.tsx` and into `app/core/reasoning.ts`. Update imports in `EffortSelector.tsx`, its test, and the new anthropic provider code.

- [ ] **Step 5: Smoke test with Claude Sonnet 4.6 via dev server**

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/app/utils/llm/providers/anthropic.ts apps/bot-battle/web/app/core/reasoning.ts apps/bot-battle/web/app/components/EffortSelector.tsx apps/bot-battle/web/app/components/EffortSelector.test.tsx
git commit -m "feat(bot-battle): Anthropic extended thinking support (Sonnet 4.6)"
```

---

### Task 15: DeepSeek provider — reasoning token parsing

**Files:**
- Modify: `apps/bot-battle/web/app/utils/llm/providers/deepseek.ts`

DeepSeek V3.2-Speciale exposes reasoning tokens in `usage.reasoning_tokens` (verify exact shape during Task 3). No user-facing effort parameter.

- [ ] **Step 1: Read current `deepseek.ts`**

- [ ] **Step 2: Parse reasoning tokens into metrics**

- [ ] **Step 3: Return `thinking` if available (check DeepSeek API spec)**

- [ ] **Step 4: Smoke test**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/utils/llm/providers/deepseek.ts
git commit -m "feat(bot-battle): DeepSeek reasoning token parsing (V3.2-Speciale)"
```

---

### Task 16: Build `/api/providers/test-key` route

**Files:**
- Create: `apps/bot-battle/web/app/api/providers/test-key/route.ts`
- Create: `apps/bot-battle/web/app/core/provider-verification-endpoints.ts`
- Create: `apps/bot-battle/web/app/core/provider-verification-endpoints.test.ts`
- Create: `apps/bot-battle/web/app/api/providers/test-key/route.test.ts`

- [ ] **Step 1: Write verification-endpoint table (TDD)**

Write to `provider-verification-endpoints.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { PROVIDER_VERIFICATION } from "./provider-verification-endpoints";

describe("PROVIDER_VERIFICATION", () => {
  const required = ["openai","anthropic","google","xai","deepseek","meta","mistral","qwen"];
  it.each(required)("has a verification spec for %s", (id) => {
    expect(PROVIDER_VERIFICATION[id]).toBeDefined();
    expect(PROVIDER_VERIFICATION[id].url).toMatch(/^https:/);
  });
});
```

- [ ] **Step 2: Implement the table**

Write to `provider-verification-endpoints.ts`:
```ts
export interface ProviderVerificationSpec {
  url: string;
  method: "GET" | "POST";
  authHeader: (key: string) => Record<string, string>;
  body?: unknown;
}

export const PROVIDER_VERIFICATION: Record<string, ProviderVerificationSpec> = {
  openai: {
    url: "https://api.openai.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  anthropic: {
    // Anthropic supports /v1/models (verify during Task 3)
    url: "https://api.anthropic.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ "x-api-key": k, "anthropic-version": "2023-06-01" }),
  },
  google: {
    url: "https://generativelanguage.googleapis.com/v1beta/models",
    method: "GET",
    // Google uses ?key=... query param; url built with key appended in handler
    authHeader: () => ({}),
  },
  xai: {
    url: "https://api.x.ai/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  deepseek: {
    url: "https://api.deepseek.com/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  meta: {
    // Meta models are used via Groq — verify against Groq
    url: "https://api.groq.com/openai/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  mistral: {
    url: "https://api.mistral.ai/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
  qwen: {
    // verify during Task 3 — DashScope endpoint
    url: "https://dashscope.aliyuncs.com/compatible-mode/v1/models",
    method: "GET",
    authHeader: (k) => ({ Authorization: `Bearer ${k}` }),
  },
};
```

- [ ] **Step 3: Run verification-table tests — expect PASS**

- [ ] **Step 4: Write route handler test**

Write to `app/api/providers/test-key/route.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

function makeReq(body: unknown) {
  return new Request("http://local/api/providers/test-key", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/providers/test-key", () => {
  const realFetch = global.fetch;
  beforeEach(() => { global.fetch = vi.fn(); });
  afterEach(() => { global.fetch = realFetch; });

  it("returns 400 when provider missing", async () => {
    const res = await POST(makeReq({ key: "x" }) as any);
    expect(res.status).toBe(400);
  });

  it("returns ok:true on 2xx from provider", async () => {
    (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
    const res = await POST(makeReq({ provider: "openai", key: "sk-..." }) as any);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returns ok:false with error on 401", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false, status: 401,
      text: async () => "invalid api key"
    });
    const res = await POST(makeReq({ provider: "openai", key: "bad" }) as any);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it("returns ok:false for unknown provider", async () => {
    const res = await POST(makeReq({ provider: "bogus", key: "x" }) as any);
    const json = await res.json();
    expect(json.ok).toBe(false);
  });
});
```

- [ ] **Step 5: Implement route**

Write to `route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_VERIFICATION } from "@/core/provider-verification-endpoints";

export async function POST(req: NextRequest) {
  const { provider, key } = await req.json();
  if (!provider || !key) {
    return NextResponse.json({ ok: false, error: "Missing provider or key" }, { status: 400 });
  }
  const spec = PROVIDER_VERIFICATION[provider];
  if (!spec) {
    return NextResponse.json({ ok: false, error: `Unknown provider: ${provider}` });
  }

  // Google uses query-param auth
  const url = provider === "google" ? `${spec.url}?key=${encodeURIComponent(key)}` : spec.url;
  try {
    const resp = await fetch(url, { method: spec.method, headers: spec.authHeader(key) });
    if (resp.ok) return NextResponse.json({ ok: true });
    const body = await resp.text().catch(() => "");
    return NextResponse.json({
      ok: false,
      error: `${resp.status}: ${body.slice(0, 200) || resp.statusText}`,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "network error" });
  }
}
```

- [ ] **Step 6: Run tests — expect PASS**

- [ ] **Step 7: Commit**

```bash
git add apps/bot-battle/web/app/api/providers apps/bot-battle/web/app/core/provider-verification-endpoints.ts apps/bot-battle/web/app/core/provider-verification-endpoints.test.ts
git commit -m "feat(bot-battle): add POST /api/providers/test-key with per-provider verification"
```

---

### Task 17: Add "Test" button to `ApiKeyInput`

**Files:**
- Modify: `apps/bot-battle/web/app/components/ApiKeyInput.tsx`
- Create: `apps/bot-battle/web/app/components/ApiKeyInput.test.tsx`

- [ ] **Step 1: Write failing test for Test button**

Write to `ApiKeyInput.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ApiKeyInput } from "./ApiKeyInput";

describe("ApiKeyInput — Test connection", () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it("renders a Test button per provider", () => {
    // pick whatever props ApiKeyInput requires — adjust per current API
    render(<ApiKeyInput provider="openai" label="OpenAI" />);
    expect(screen.getByRole("button", { name: /test/i })).toBeInTheDocument();
  });

  it("POSTs to /api/providers/test-key and shows success", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ok: true })
    });
    render(<ApiKeyInput provider="openai" label="OpenAI" initialKey="sk-x" />);
    fireEvent.click(screen.getByRole("button", { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/works/i)).toBeInTheDocument());
  });

  it("shows error message on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ok: false, error: "401: invalid" })
    });
    render(<ApiKeyInput provider="openai" label="OpenAI" initialKey="bad" />);
    fireEvent.click(screen.getByRole("button", { name: /test/i }));
    await waitFor(() => expect(screen.getByText(/401/)).toBeInTheDocument());
  });
});
```

Adjust props in test to match actual `ApiKeyInput` signature — read the component first.

- [ ] **Step 2: Read current `ApiKeyInput.tsx`**

- [ ] **Step 3: Add button + result state**

Add a "Test" button next to the password input. Local state: `testStatus: "idle" | "testing" | "ok" | "error"` and `testMessage: string`. Click handler POSTs to `/api/providers/test-key` with `{ provider, key: currentInputValue }`.

UI:
```tsx
<button
  type="button"
  disabled={testStatus === "testing"}
  onClick={runTest}
  className="text-xs px-2 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
>
  {testStatus === "testing" ? "Testing…" : "Test"}
</button>
{testStatus === "ok" && <span className="text-green-600 text-xs ml-2">✓ Works</span>}
{testStatus === "error" && <span className="text-red-600 text-xs ml-2">✗ {testMessage}</span>}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/web/app/components/ApiKeyInput.tsx apps/bot-battle/web/app/components/ApiKeyInput.test.tsx
git commit -m "feat(bot-battle): add Test-connection button to ApiKeyInput"
```

---

### Task 18: Update `/settings` page — add xAI, remove dropped providers

**Files:**
- Modify: `apps/bot-battle/web/app/settings/page.tsx`

- [ ] **Step 1: Read current `settings/page.tsx`**

- [ ] **Step 2: Remove provider sections for Cohere, AI21, Microsoft, OpenRouter**

Delete the `ApiKeyInput` instances for these providers.

- [ ] **Step 3: Add xAI section**

Add:
```tsx
<ApiKeyInput provider="xai" label="xAI (Grok)" />
```

- [ ] **Step 4: Confirm Qwen section exists** (it should from the audit)

- [ ] **Step 5: Smoke test via dev server**

Confirm: the settings page shows exactly 8 provider sections (OpenAI, Anthropic, Google, xAI, DeepSeek, Meta, Mistral, Qwen). Each has a working Test button.

- [ ] **Step 6: Commit**

```bash
git add apps/bot-battle/web/app/settings/page.tsx
git commit -m "feat(bot-battle): settings page covers refreshed provider list"
```

---

### Task 19: Also remove keys from `apiKeyStore.ts` and `api-keys.ts` for dropped providers

**Files:**
- Modify: `apps/bot-battle/web/app/utils/apiKeyStore.ts`
- Modify: `apps/bot-battle/web/app/utils/llm/api-keys.ts`
- Modify: `apps/bot-battle/web/app/providers/ApiKeyProvider.tsx`

Dropped provider IDs (`cohere`, `ai21`, `microsoft`, `openrouter`, `nousresearch`) should no longer appear anywhere. Add `xai`.

- [ ] **Step 1: Grep for references**

Run: `grep -rn "cohere\|ai21\|microsoft\|openrouter\|nousresearch" apps/bot-battle/web/app --include="*.ts" --include="*.tsx"`

- [ ] **Step 2: Remove each reference** (keep only those inside test files that are being deleted)

- [ ] **Step 3: Add xai wherever the provider list is enumerated**

- [ ] **Step 4: Run full test suite**

Run: `yarn workspace @knicks-knacks/bot-battle-web test --run`
Expected: all tests pass.

- [ ] **Step 5: Run build**

Run: `yarn workspace @knicks-knacks/bot-battle-web build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add -u apps/bot-battle/web/app
git commit -m "chore(bot-battle): purge dropped-provider references, add xai to key stores"
```

---

### Task 20: Full-app smoke test + README update

- [ ] **Step 1: Run dev server**

```bash
yarn workspace @knicks-knacks/bot-battle-web dev
```

- [ ] **Step 2: Manual test matrix** (record findings inline)

For each curated model, verify in the browser:
- Model appears in the picker with the correct badge (or no badge for current+standard)
- Submit a short prompt
- Response returns successfully
- Metrics row shows tokens / latency / cost
- For reasoning models: Answer tab shows answer, Thinking tab shows thinking or placeholder, effort selector changes budget when applicable, reasoning/answer token split appears

Models to test (at minimum one per provider):
GPT-5.4 Thinking, GPT-5 mini, o3, GPT-4o (legacy), Claude Opus 4.7, Claude Sonnet 4.6 (test effort low vs high), Claude Haiku 4.5, Claude Mythos Preview, Gemini 3.1 Pro, Grok 4.20, DeepSeek V3.2, DeepSeek V3.2-Speciale, Llama 4 Maverick, Mistral Large, Qwen3.6-Plus.

- [ ] **Step 3: Test each provider's key verification**

On the settings page, clear each key, paste a valid one, click Test. Confirm ✓ Works. Then paste a bogus key, click Test, confirm red error message.

- [ ] **Step 4: Update app README**

Modify `apps/bot-battle/README.md` to reflect the curated provider list.

- [ ] **Step 5: Commit**

```bash
git add apps/bot-battle/README.md
git commit -m "docs(bot-battle): update README for refreshed provider list"
```

---

## Follow-ups (not implemented — logged for next cycle)

- Consolidate API key storage to a single source of truth (Zustand `persist` middleware, delete parallel `apiKeyStore.ts` + `api-keys.ts`)
- Persist benchmark results across page refreshes
- Restructure model picker (search, collapsible provider sections) — deferred until the list grows past ~25
- Migrate `fetch` calls to React Query or remove the dependency
- Fix `layout.tsx` absolute-positioned "API Settings" link for mobile viewports

# Verified Model IDs — 2026-04-20

Research cutoff: 2026-04-20. Sources listed per-model. All prices are USD per 1M tokens unless noted otherwise.

---

## OpenAI

### GPT-5.4 Thinking

> Note: "GPT-5.4 Thinking" is the ChatGPT-facing name for GPT-5.4 with reasoning effort enabled. There is **no separate API model ID** called `gpt-5.4-thinking`. The standard `gpt-5.4` model supports reasoning via the `reasoning.effort` parameter. Task 6 should treat these as one model in the registry.

- **API model ID:** `gpt-5.4` (snapshot: `gpt-5.4-2026-03-05`)
- **Context window:** 1,050,000 tokens input; 128,000 tokens max output
- **Cost:** $2.50 input / $15.00 output per 1M tokens (cached input: $0.25/M)
- **Reasoning:** Supports `reasoning.effort`: `none` (default), `low`, `medium`, `high`, `xhigh`
- **Streams thinking?** Not confirmed — reasoning is internal; no explicit streaming of thinking blocks documented
- **Usage field for reasoning tokens:** `usage.reasoning_tokens` (reasoning tokens are billed separately at higher effort levels; cost scales ~3–5x at `xhigh` vs `low`)
- **Sources:**
  - https://developers.openai.com/api/docs/models/gpt-5.4
  - https://developers.openai.com/api/docs/pricing
  - https://www.nxcode.io/resources/news/gpt-5-4-api-developer-guide-reasoning-computer-use-2026
  - https://openrouter.ai/openai/gpt-5.4
- **Notes:** Pro variant (`gpt-5.4-pro`) exists at $30/$180 per 1M. Long-context pricing doubles input cost above 272K tokens in a single request. Released 2026-03-05.

---

### GPT-5.4 mini

- **API model ID:** `gpt-5.4-mini`
- **Context window:** 400,000 tokens input; 128,000 tokens max output
- **Cost:** $0.75 input / $4.50 output per 1M tokens
- **Reasoning:** Inherits `reasoning.effort` support from GPT-5.4 family (confirm at integration time)
- **Streams thinking?** Unknown
- **Usage field for reasoning tokens:** Unknown — follow same pattern as `gpt-5.4`
- **Sources:**
  - https://developers.openai.com/api/docs/models (models list page)
  - https://developers.openai.com/api/docs/pricing
- **Notes:** Described as "strongest mini model yet for coding, computer use, and subagents." Nano variant also exists (`gpt-5.4-nano`, $0.20/$1.25).

---

### o3

- **API model ID:** `o3` (also seen as `openai/o3` on OpenRouter)
- **Context window:** 200,000 tokens
- **Cost:** $2.00 input / $8.00 output per 1M tokens
- **Reasoning:** Supports `reasoning.effort`: `low`, `medium`, `high` — used as `"reasoning": {"effort": "medium"}` in request body
- **Streams thinking?** No — reasoning tokens are internal
- **Usage field for reasoning tokens:** `reasoning_tokens` tracked separately in usage response (platform shows prompt / reasoning / completion breakdown)
- **Sources:**
  - https://openrouter.ai/openai/o3
  - https://platform.openai.com/docs/guides/reasoning (search result)
  - https://community.openai.com/t/o1s-reasoning-effort-parameter/1062308
- **Notes:** Dedicated reasoning model; slower but stronger than GPT-5.4 for math/logic/science. Max output tokens: 100,000.

---

### o4-mini

- **API model ID:** `o4-mini` (also seen as `openai/o4-mini` on OpenRouter)
- **Context window:** 200,000 tokens
- **Cost:** $1.10 input / $4.40 output per 1M tokens
- **Reasoning:** Supports `reasoning.effort`: `low`, `medium`, `high`
- **Streams thinking?** No — reasoning tokens are internal
- **Usage field for reasoning tokens:** `reasoning_tokens` tracked separately in usage response
- **Sources:**
  - https://openrouter.ai/openai/o4-mini
  - https://pricepertoken.com/pricing-page/model/openai-o4-mini
  - https://developers.openai.com/api/docs/guides/reasoning (search result)
- **Notes:** Released April 16, 2025. Roughly half the cost of o3; good cost/performance tradeoff for reasoning tasks.

---

### gpt-4o (legacy)

- **API model ID:** `gpt-4o` (latest snapshot: `gpt-4o-2024-11-20`)
- **Context window:** 128,000 tokens
- **Cost:** $2.50 input / $10.00 output per 1M tokens
- **Reasoning:** No reasoning/thinking capability
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://openrouter.ai/openai/gpt-4o
  - https://developers.openai.com/api/docs/deprecations
  - https://pricepertoken.com/pricing-page/model/openai-gpt-4o-2024-11-20
- **Notes:** **RETIRED from ChatGPT on April 3, 2026**. Status in the raw API as of April 20 is ambiguous — OpenAI's deprecation page does not list it as deprecated from the API endpoint yet, but it is in a transition period. Task 6 should flag this for human review before including in production registry. Recommend replacing with `gpt-5.4-mini` for comparable use cases.

---

## Anthropic

### Claude Opus 4.7

- **API model ID:** `claude-opus-4-7`
- **Context window:** 1,000,000 tokens; max output 128,000 tokens
- **Cost:** $5.00 input / $25.00 output per 1M tokens
- **Reasoning (Extended Thinking):** Supports **Adaptive Thinking** (Yes); does **not** support Extended Thinking
- **Streams thinking?** Adaptive Thinking: streaming of thinking blocks is supported
- **Usage field for reasoning tokens:** `usage.cache_read_input_tokens` / standard usage; thinking tokens billed as output tokens
- **Sources:**
  - https://platform.claude.com/docs/en/about-claude/models/overview
  - https://platform.claude.com/docs/en/about-claude/model-deprecations
- **Notes:** Flagship model as of April 2026. Active; retirement not before April 16, 2027. Training data cutoff Jan 2026. New tokenizer vs. prior Opus models.

---

### Claude Sonnet 4.6

- **API model ID:** `claude-sonnet-4-6`
- **Context window:** 1,000,000 tokens; max output 64,000 tokens
- **Cost:** $3.00 input / $15.00 output per 1M tokens
- **Reasoning (Extended Thinking):** Yes (Extended Thinking supported) + Adaptive Thinking (Yes)
- **Streams thinking?** Yes — extended thinking content is streamed as thinking blocks
- **Usage field for reasoning tokens:** Thinking tokens billed at output token rates; usage response includes breakdown
- **Sources:**
  - https://platform.claude.com/docs/en/about-claude/models/overview
- **Notes:** Active; retirement not before February 17, 2027. Best speed/intelligence tradeoff in Anthropic lineup.

---

### Claude Haiku 4.5

- **API model ID:** `claude-haiku-4-5-20251001` (alias: `claude-haiku-4-5`)
- **Context window:** 200,000 tokens; max output 64,000 tokens
- **Cost:** $1.00 input / $5.00 output per 1M tokens
- **Reasoning (Extended Thinking):** Yes (Extended Thinking supported); does **not** support Adaptive Thinking
- **Streams thinking?** Yes
- **Usage field for reasoning tokens:** Thinking tokens billed at output rates
- **Sources:**
  - https://platform.claude.com/docs/en/about-claude/models/overview
- **Notes:** Active; retirement not before October 15, 2026. Fastest Anthropic model.

---

### Claude Mythos Preview

- **API model ID:** `anthropic.claude-mythos-preview` (AWS Bedrock ID confirmed; Anthropic API direct ID unknown — access is invitation-only)
- **Context window:** 1,000,000 tokens; max output 128,000 tokens
- **Cost:** Not publicly listed — check Amazon Bedrock Pricing page; no self-serve pricing published
- **Reasoning:** Yes (reasoning capability confirmed per Bedrock model card)
- **Streams thinking?** Unknown
- **Usage field for reasoning tokens:** Unknown
- **Sources:**
  - https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-mythos-preview.html
  - https://anthropic.com/glasswing (Project Glasswing)
  - https://red.anthropic.com/2026/mythos-preview/
- **Notes:** **Gated invitation-only** research preview. Launched April 7, 2026. Focused on defensive cybersecurity, autonomous coding, long-running agents. Available via AWS Bedrock (us-east-1 only), Vertex AI, and Microsoft Foundry — but only for approved organizations. Task 6 should conditionally include this and gate it behind an env flag.

---

### Claude 3.5 Sonnet (legacy)

- **API model ID:** `claude-3-5-sonnet-20241022` (June 2024 snapshot: `claude-3-5-sonnet-20240620`)
- **Context window:** 200,000 tokens
- **Cost:** $3.00 input / $15.00 output per 1M tokens
- **Reasoning:** No extended thinking
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://platform.claude.com/docs/en/about-claude/model-deprecations
- **Notes:** **RETIRED October 28, 2025.** Both `claude-3-5-sonnet-20240620` and `claude-3-5-sonnet-20241022` are retired. Requests will fail. Task 6 must remove this from the registry or mark it clearly as retired/removed.

---

## Google

### Gemini 3.1 Pro

- **API model ID:** `gemini-3.1-pro-preview`
- **Context window:** 1,048,576 tokens (1M); max output 65,536 tokens
- **Cost:**
  - Prompts ≤200k tokens: $2.00 input / $12.00 output per 1M tokens
  - Prompts >200k tokens: $4.00 input / $18.00 output per 1M tokens
  - Batch: 50% discount on above
  - Caching: $0.20/M for contexts under 200k
- **Reasoning:** Unknown — not explicitly documented as a reasoning model; no `reasoning.effort` equivalent mentioned
- **Streams thinking?** Unknown
- **Usage field for reasoning tokens:** Unknown
- **Sources:**
  - https://ai.google.dev/gemini-api/docs/models
  - https://ai.google.dev/pricing
  - https://openrouter.ai/google/gemini-3.1-pro-preview
  - https://devtk.ai/en/models/gemini-3-1-pro/
- **Notes:** Status: Preview (as of April 15, 2026 doc update). Previously `gemini-3-pro-preview` was shut down March 9, 2026 and now points to `gemini-3.1-pro-preview`. Some sources report context expanded to 2M tokens — official spec says 1M; use 1M as authoritative.

---

### Gemini 3.1 Flash Live

- **API model ID:** `gemini-3.1-flash-live-preview`
- **Context window:** 131,072 tokens input; 65,536 tokens max output
- **Cost:**
  - Text input: $0.75/M; Audio input: $3.00/M or $0.005/min; Image/Video input: $1.00/M or $0.002/min
  - Text output: $4.50/M; Audio output: $12.00/M or $0.018/min
- **Reasoning:** N/A — this is a real-time audio/dialogue model, not a reasoning model
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-live-preview
  - https://ai.google.dev/pricing
  - https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-live/
- **Notes:** Status: New Preview. Launched ~March 26, 2026. Low-latency real-time dialogue; audio-to-audio. Knowledge cutoff January 2025. Multimodal (text, images, audio, video input). This is a Live API model — integration differs from standard Gemini Chat API.

---

## xAI

### Grok 4.20

- **API model ID:** `grok-4.20-0309-reasoning` (reasoning variant) / `grok-4.20-0309-non-reasoning` (non-reasoning variant) / `grok-4.20-multi-agent-0309` (multi-agent variant)
- **Context window:** 2,000,000 tokens
- **Cost:** $2.00 input / $6.00 output per 1M tokens (all three variants share same pricing); cached input: $0.20/M
- **Reasoning:** Yes — `grok-4.20-0309-reasoning` is the thinking variant; reasoning support is baked into model ID selection rather than a parameter
- **Streams thinking?** Unknown
- **Usage field for reasoning tokens:** Unknown
- **Sources:**
  - https://docs.x.ai/docs/models
- **Notes:** Three variants of 4.20 exist (reasoning, non-reasoning, multi-agent). xAI knowledge cutoff for Grok 3/4 is November 2024. Does not support `logprobs`.

---

### Grok 4.1 Fast (fast variant)

- **API model ID:** `grok-4-1-fast-reasoning` / `grok-4-1-fast-non-reasoning`
- **Context window:** 2,000,000 tokens
- **Cost:** $0.20 input / $0.50 output per 1M tokens; cached input: $0.05/M
- **Reasoning:** `grok-4-1-fast-reasoning` is the thinking variant
- **Streams thinking?** Unknown
- **Usage field for reasoning tokens:** Unknown
- **Sources:**
  - https://docs.x.ai/docs/models
- **Notes:** This is xAI's fast/cheap tier. The task spec referred to "Grok 4 Fast/mini" — the closest match in official docs is `grok-4-1-fast`. No separate "mini" model found. Task 6 should confirm whether "Grok 4 Fast" maps to `grok-4-1-fast` or a different ID.

---

## DeepSeek

### DeepSeek V3.2

- **API model ID:** `deepseek-chat`
- **Context window:** 128,000 tokens (128K)
- **Cost:** $0.028 input (cache hit) / $0.28 input (cache miss) / $0.42 output per 1M tokens
- **Reasoning:** No — this is the non-thinking mode of V3.2
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://api-docs.deepseek.com
  - https://api-docs.deepseek.com/quick_start/pricing
- **Notes:** Default output is 4K tokens; max output 8K tokens. Supports FIM completion. Both `deepseek-chat` and `deepseek-reasoner` correspond to the V3.2 model family.

---

### DeepSeek V3.2-Speciale (reasoning)

- **API model ID:** Served via temporary endpoint `https://api.deepseek.com/v3.2_speciale_expires_on_20251215` — **expired December 15, 2025**. No standard model ID confirmed for ongoing access. OpenRouter lists it as `deepseek/deepseek-v3.2-speciale`.
- **Context window:** 163,840 tokens
- **Cost:** $0.40 input / $1.20 output per 1M tokens (per OpenRouter)
- **Reasoning:** Yes — high-compute reasoning variant; supports `reasoning` parameter; returns `reasoning_details` array
- **Streams thinking?** Likely yes (reasoning details streamed)
- **Usage field for reasoning tokens:** `reasoning_details` array in response
- **Sources:**
  - https://api-docs.deepseek.com/news/news251201
  - https://openrouter.ai/deepseek/deepseek-v3.2-speciale
  - https://pricepertoken.com/pricing-page/model/deepseek-deepseek-v3.2-speciale
- **Notes:** **CRITICAL FLAG FOR TASK 6**: The official DeepSeek API endpoint for V3.2-Speciale expired December 15, 2025. It may be accessible via OpenRouter (`deepseek/deepseek-v3.2-speciale`) but direct DeepSeek API access is unconfirmed post-expiry. Task 6 must verify current availability before adding to production registry. The standard reasoning model via DeepSeek API is `deepseek-reasoner` (maps to V3.2 reasoning mode).

---

## Meta (via Groq)

### Llama 4 Maverick

- **API model ID:** `meta-llama/llama-4-maverick-17b-128e-instruct`
- **Context window:** 128,000 tokens
- **Cost:** $0.50 input / $0.77 output per 1M tokens
- **Reasoning:** No dedicated reasoning mode
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://console.groq.com/docs/model/meta-llama/llama-4-maverick-17b-128e-instruct
  - https://openrouter.ai/meta-llama/llama-4-maverick
- **Notes:** **DEPRECATED on Groq as of March 9, 2026** — replaced by `openai/gpt-oss-120b`. Groq emailed users February 20, 2026 announcing the deprecation. Model may still be callable but is officially unsupported by Groq. Task 6 should either remove from registry, swap to `openai/gpt-oss-120b`, or route via a different provider (e.g. Together, OpenRouter) where Maverick is still active.

---

### Llama 4 Scout

- **API model ID:** `meta-llama/llama-4-scout-17b-16e-instruct`
- **Context window:** 131,072 tokens (128K); max output 8,192 tokens
- **Cost:** $0.11 input / $0.34 output per 1M tokens
- **Reasoning:** No dedicated reasoning mode
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://console.groq.com/docs/model/meta-llama/llama-4-scout-17b-16e-instruct
- **Notes:** Status: **Preview** on Groq — "should not be used in production environments as they may be discontinued at short notice." ~750 tokens/sec on Groq. Supports multimodal (text + up to 5 images). 17B active params, 16 experts.

---

## Mistral

### mistral-large-latest

- **API model ID:** `mistral-large-latest` (alias pointing to `mistral-large-2512`)
- **Context window:** 262,144 tokens (262K)
- **Cost:** $0.50 input / $1.50 output per 1M tokens
- **Reasoning:** No dedicated reasoning/thinking mode
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://openrouter.ai/mistralai/mistral-large-2512
  - Search results: https://pricepertoken.com/pricing-page/model/mistral-ai-mistral-large-2512
  - https://www.helicone.ai/llm-cost/provider/mistral/model/mistral-large-latest
- **Notes:** The underlying model is `mistral-large-2512` (released December 1, 2025). Sparse MoE architecture: 41B active params / 675B total. Apache 2.0 license. Some sources cite $2/$6 pricing for an older Mistral Large variant with 128K context — the 2512 version at $0.50/$1.50 with 262K context is the current one.

---

### Mistral Medium 3

- **API model ID:** `mistral-medium-3`
- **Context window:** 131,072 tokens (128K)
- **Cost:** $0.40 input / $2.00 output per 1M tokens
- **Reasoning:** No dedicated reasoning/thinking mode
- **Streams thinking?** N/A
- **Usage field for reasoning tokens:** N/A
- **Sources:**
  - https://openrouter.ai/mistralai/mistral-medium-3
  - https://pricepertoken.com/pricing-page/model/mistral-ai-mistral-medium-3
- **Notes:** Released May 7, 2025. Enterprise-grade. Mistral Medium 3.1 also exists (`mistral-medium-3.1` on OpenRouter) — Task 6 should confirm if they want 3.0 or 3.1.

---

## Qwen

### Qwen3.6-Plus

- **API model ID:** `qwen3.6-plus` (DashScope / Alibaba Cloud Bailian); OpenRouter: `qwen/qwen3.6-plus`
- **Context window:** 1,000,000 tokens; max output 65,536 tokens
- **Cost:**
  - DashScope (Alibaba Cloud): ~$0.276/M input (≤256K), $1.101/M input (>256K), $1.65/M output
  - OpenRouter: $0.325/M input / $1.95/M output
- **Reasoning:** Yes — supports `reasoning` parameter; returns `reasoning_details` array (OpenRouter pattern); hybrid linear attention + sparse MoE architecture
- **Streams thinking?** Likely yes
- **Usage field for reasoning tokens:** `reasoning_details` array (OpenRouter pattern)
- **API endpoint (DashScope international):** `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- **Sources:**
  - https://openrouter.ai/qwen/qwen3.6-plus
  - https://www.aimadetools.com/blog/how-to-use-qwen-3-6-api/
  - https://tokencost.app/blog/qwen3-6-plus-pricing-benchmarks
  - https://dev.to/siddhesh_surve/qwen-36-plus-just-dropped-the-1m-context-ai-changing-the-vibe-coding-game-978
- **Notes:** Released April 2, 2026. BotBattle will likely integrate via OpenRouter or DashScope international endpoint. DashScope pricing is for the Alibaba Cloud Bailian platform; international pricing may differ — verify at signup. OpenRouter pricing ($0.325/$1.95) is the most straightforward integration point.

---

## Summary Table

| Provider | Model | API Model ID | Context | Input $/M | Output $/M | Reasoning |
|---|---|---|---|---|---|---|
| OpenAI | GPT-5.4 Thinking | `gpt-5.4` | 1.05M | $2.50 | $15.00 | `reasoning.effort` (none/low/med/high/xhigh) |
| OpenAI | GPT-5.4 mini | `gpt-5.4-mini` | 400K | $0.75 | $4.50 | Likely yes (confirm) |
| OpenAI | o3 | `o3` | 200K | $2.00 | $8.00 | `reasoning.effort` (low/med/high) |
| OpenAI | o4-mini | `o4-mini` | 200K | $1.10 | $4.40 | `reasoning.effort` (low/med/high) |
| OpenAI | gpt-4o (legacy) | `gpt-4o` | 128K | $2.50 | $10.00 | No — **RETIRED from ChatGPT April 3, 2026; API status uncertain** |
| Anthropic | Claude Opus 4.7 | `claude-opus-4-7` | 1M | $5.00 | $25.00 | Adaptive Thinking only |
| Anthropic | Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M | $3.00 | $15.00 | Extended + Adaptive Thinking |
| Anthropic | Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | 200K | $1.00 | $5.00 | Extended Thinking |
| Anthropic | Claude Mythos Preview | `anthropic.claude-mythos-preview` | 1M | unknown | unknown | Yes — invite-only |
| Anthropic | Claude 3.5 Sonnet (legacy) | `claude-3-5-sonnet-20241022` | 200K | $3.00 | $15.00 | No — **RETIRED Oct 28, 2025** |
| Google | Gemini 3.1 Pro | `gemini-3.1-pro-preview` | 1M | $2.00–$4.00 | $12.00–$18.00 | Unknown |
| Google | Gemini 3.1 Flash Live | `gemini-3.1-flash-live-preview` | 131K | $0.75 (text) | $4.50 (text) | N/A — real-time audio |
| xAI | Grok 4.20 | `grok-4.20-0309-reasoning` | 2M | $2.00 | $6.00 | Yes — per model ID variant |
| xAI | Grok 4.1 Fast | `grok-4-1-fast-reasoning` | 2M | $0.20 | $0.50 | Yes — per model ID variant |
| DeepSeek | DeepSeek V3.2 | `deepseek-chat` | 128K | $0.28 (miss) | $0.42 | No |
| DeepSeek | DeepSeek V3.2-Speciale | `deepseek/deepseek-v3.2-speciale` (OR) | 164K | $0.40 | $1.20 | Yes — **official endpoint expired Dec 15, 2025** |
| Meta/Groq | Llama 4 Maverick | `meta-llama/llama-4-maverick-17b-128e-instruct` | 128K | $0.50 | $0.77 | No — **DEPRECATED on Groq March 9, 2026** |
| Meta/Groq | Llama 4 Scout | `meta-llama/llama-4-scout-17b-16e-instruct` | 128K | $0.11 | $0.34 | No — Preview status |
| Mistral | mistral-large-latest | `mistral-large-latest` → `mistral-large-2512` | 262K | $0.50 | $1.50 | No |
| Mistral | Mistral Medium 3 | `mistral-medium-3` | 128K | $0.40 | $2.00 | No |
| Qwen | Qwen3.6-Plus | `qwen3.6-plus` | 1M | $0.276–$0.325 | $1.65–$1.95 | Yes |

---

## Flags for Task 6

1. **gpt-4o**: Retired from ChatGPT April 3, 2026; API availability uncertain. Verify before including in registry.
2. **Claude 3.5 Sonnet**: RETIRED October 28, 2025 — remove from registry.
3. **DeepSeek V3.2-Speciale**: Official DeepSeek API endpoint expired December 15, 2025. Only available via OpenRouter or third-party providers. Verify if direct DeepSeek API access should be used.
4. **Llama 4 Maverick**: Deprecated on Groq March 9, 2026. Decide: remove, swap to `openai/gpt-oss-120b` on Groq, or route via a provider where Maverick is still active.
5. **Llama 4 Scout**: Preview status on Groq — not recommended for production.
6. **GPT-5.4 Thinking vs gpt-5.4**: No separate `gpt-5.4-thinking` model ID exists in the API. "GPT-5.4 Thinking" is a ChatGPT label. Consolidate to one registry entry for `gpt-5.4`.
7. **Grok 4.1 Fast**: The spec asked for "Grok 4 Fast/mini" — nearest match is `grok-4-1-fast-*`. Confirm naming intent with stakeholder.
8. **Claude Mythos Preview**: Pricing unknown; invite-only access. Gate behind env flag in registry.
9. **Mistral Medium 3.1**: A newer 3.1 variant exists alongside 3.0. Confirm which to include.
10. **Gemini 3.1 Pro context**: Some sources claim 2M token context; official docs say 1M. Use 1M until Google confirms otherwise.

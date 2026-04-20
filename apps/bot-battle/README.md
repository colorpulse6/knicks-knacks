# BotBattle

Side-by-side benchmarking for modern LLM APIs. See `/web` for the Next.js frontend implementation.

## Providers (as of 2026-04-20)

Curated flagship-tier coverage. Users provide their own API keys — no server-side fallback required.

| Provider | Models |
|---|---|
| **OpenAI** | GPT-5.4 *(reasoning)*, GPT-5.4 mini, o3 *(reasoning)*, o4-mini *(reasoning)* |
| **Anthropic** | Claude Opus 4.7, Claude Sonnet 4.6 *(extended thinking)*, Claude Haiku 4.5 |
| **Google** | Gemini 3.1 Pro, Gemini 3.1 Flash Live |
| **xAI** | Grok 4.20 *(reasoning variant)*, Grok 4.1 Fast |
| **DeepSeek** | DeepSeek V3.2 |
| **Mistral** | Mistral Large, Mistral Medium 3 |
| **Qwen** *(Alibaba)* | Qwen3.6-Plus |

Reasoning models show an effort selector (low/medium/high) and separate Answer/Thinking tabs in the result cell.

## Structure
- `/web` — Next.js 15 + React 18 + Tailwind 4 frontend
- `/tests` — app-specific integration tests

See `/web/README.md` for dev setup.

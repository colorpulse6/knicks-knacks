# BotBattle

Side-by-side benchmarking for modern LLM APIs. See `/web` for the Next.js frontend implementation.

## Providers (as of 2026-04-21)

Curated flagship-tier coverage. Users provide their own API keys — no server-side fallback required for paid providers. Free-tier providers (marked *) work with BotBattle's shared app key.

| Provider | Models | Notes |
|---|---|---|
| **OpenAI** | GPT-5.4 *(reasoning)*, GPT-5.4 mini, o3 *(reasoning)*, o4-mini *(reasoning)* | User key required |
| **Anthropic** | Claude Opus 4.7, Claude Sonnet 4.6 *(extended thinking)*, Claude Haiku 4.5 | User key required |
| **Google** | Gemini 3.1 Pro, Gemini 3.1 Flash Live | User key required |
| **xAI** | Grok 4.20 *(reasoning variant)*, Grok 4.1 Fast | User key required |
| **DeepSeek** | DeepSeek V3.2 | User key required |
| **Mistral** | Mistral Large, Mistral Medium 3 | User key required |
| **Qwen** *(Alibaba)* | Qwen3.6-Plus | User key required |
| **Groq** * | Llama 4 Scout, Llama 3.3 70B, Qwen3 32B | Free via app key; 30 RPM shared |
| **Cerebras** * | Llama 3.3 70B, Llama 3.1 8B | Free via app key; ~1,000 tok/sec |
| **Cloudflare Workers AI** * | Llama 3.3 70B FP8, Qwen 2.5 Coder 32B, Kimi K2.5 | App-key only; requires server env vars |

Reasoning models show an effort selector (low/medium/high) and separate Answer/Thinking tabs in the result cell.

## Structure
- `/web` — Next.js 15 + React 18 + Tailwind 4 frontend
- `/tests` — app-specific integration tests

See `/web/README.md` for dev setup.

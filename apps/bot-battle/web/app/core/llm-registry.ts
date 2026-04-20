export interface ModelCost {
  inputPerMillionTokens?: number;
  outputPerMillionTokens?: number;
  currency?: string; // e.g., "USD"
  notes?: string; // e.g., "Pricing per 1K tokens for some models, check notes."
}

export interface LLMModelSpec {
  id: string; // API Model ID, unique within provider
  displayName: string;
  contextWindow: number;
  cost?: ModelCost;
  costType: "free" | "appKeyPermissive" | "userKeyOptional" | "userKeyRequired";
  // 'free': No key needed, or always uses a free public tier.
  // 'appKeyPermissive': App *can* use its own key (user not billed on app's account). If user provides *their* key for this provider, it's used (user billed).
  // 'userKeyOptional': App *might* have a limited fallback. User key preferred for full access. Costs depend on key used.
  // 'userKeyRequired': User *must* provide their API key. No app fallback.
  requiresOpenAIKey?: boolean; // True if the model (e.g., via OpenRouter) uses OpenAI infrastructure or an OpenAI-compatible key.
  capabilities?: string[]; // List of capabilities like "text", "image", "code", "json", "tool_use", etc.
  description?: string;
  notes?: string; // General notes about the model or its usage.
  status?: "current" | "legacy" | "preview";
  modelType?: "standard" | "reasoning";
  supportsReasoningEffort?: boolean;
  lastVerified?: string;
}

export interface LLMProviderSpec {
  id: string; // Unique provider ID (lowercase, e.g., "openai", "anthropic")
  displayName: string; // User-friendly provider name
  apiKeyProviderName: string; // The name of the entity the API key is for (e.g. "OpenAI", "Groq", "OpenRouter")
  apiKeyLink?: string; // URL to get an API key
  providerWebsite?: string; // Link to the provider's main website
  models: LLMModelSpec[];
}

// Claude Mythos Preview OMITTED: invite-only research preview, no public Anthropic API ID,
// no self-serve pricing. AWS Bedrock ID (anthropic.claude-mythos-preview) is gated to
// approved organizations only. Include only after access is granted and pricing is known.
export const LLM_REGISTRY: LLMProviderSpec[] = [
  {
    id: "openai",
    displayName: "OpenAI",
    apiKeyProviderName: "OpenAI",
    apiKeyLink: "https://platform.openai.com/api-keys",
    providerWebsite: "https://openai.com",
    models: [
      {
        id: "gpt-5.4",
        displayName: "GPT-5.4",
        contextWindow: 1050000,
        cost: {
          inputPerMillionTokens: 2.5,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Snapshot: gpt-5.4-2026-03-05. Cached input: $0.25/1M. Supports reasoning.effort: none/low/medium/high/xhigh. Long-context pricing doubles input above 272K tokens. Released 2026-03-05.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "long_context",
        ],
        description:
          "OpenAI's flagship model supporting reasoning effort levels. Strong across coding, math, and complex instruction following with a 1M+ token context window.",
        status: "current",
        modelType: "reasoning",
        supportsReasoningEffort: true,
        lastVerified: "2026-04-20",
      },
      {
        id: "gpt-5.4-mini",
        displayName: "GPT-5.4 mini",
        contextWindow: 400000,
        cost: {
          inputPerMillionTokens: 0.75,
          outputPerMillionTokens: 4.5,
          currency: "USD",
          notes:
            "Strongest mini model yet for coding, computer use, and subagents. Nano variant also exists (gpt-5.4-nano, $0.20/$1.25).",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "long_context",
        ],
        description:
          "OpenAI's fast and cost-effective model in the GPT-5.4 family with a 400K token context window. Strong at coding, computer use, and subagents.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "o3",
        displayName: "OpenAI o3",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 8.0,
          currency: "USD",
          notes:
            "Reasoning tokens tracked separately (usage.reasoning_tokens). Max output tokens: 100,000. Supports reasoning.effort: low/medium/high.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "long_context",
        ],
        description:
          "OpenAI's dedicated reasoning model for math, logic, and science. Slower but stronger than GPT-5.4 on complex multi-step problems.",
        status: "current",
        modelType: "reasoning",
        supportsReasoningEffort: true,
        lastVerified: "2026-04-20",
      },
      {
        id: "o4-mini",
        displayName: "OpenAI o4-mini",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 1.1,
          outputPerMillionTokens: 4.4,
          currency: "USD",
          notes:
            "Cached input: $0.275/1M. Max output tokens: 100,000. Supports reasoning.effort: low/medium/high. Released April 16, 2025.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "long_context",
        ],
        description:
          "Faster, cost-efficient reasoning model from OpenAI. Roughly half the cost of o3 with strong performance on reasoning tasks.",
        status: "current",
        modelType: "reasoning",
        supportsReasoningEffort: true,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "anthropic",
    displayName: "Anthropic",
    apiKeyProviderName: "Anthropic",
    apiKeyLink: "https://console.anthropic.com/settings/keys",
    providerWebsite: "https://www.anthropic.com",
    models: [
      {
        id: "claude-opus-4-7",
        displayName: "Claude Opus 4.7",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 5.0,
          outputPerMillionTokens: 25.0,
          currency: "USD",
          notes:
            "Max output: 128K tokens. Supports Adaptive Thinking (thinking tokens billed as output). Training data cutoff Jan 2026. Active until at least April 16, 2027.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "long_context",
        ],
        description:
          "Anthropic's flagship model as of April 2026. Supports Adaptive Thinking with streaming of thinking blocks. 1M token context window.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "claude-sonnet-4-6",
        displayName: "Claude Sonnet 4.6",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 3.0,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Max output: 64K tokens. Supports Extended Thinking and Adaptive Thinking (thinking tokens billed as output). Active until at least February 17, 2027.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "long_context",
        ],
        description:
          "Best speed/intelligence tradeoff in Anthropic's lineup. Supports Extended Thinking with streamed thinking blocks. 1M token context window.",
        status: "current",
        modelType: "reasoning",
        supportsReasoningEffort: true,
        lastVerified: "2026-04-20",
      },
      {
        id: "claude-haiku-4-5-20251001",
        displayName: "Claude Haiku 4.5",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 1.0,
          outputPerMillionTokens: 5.0,
          currency: "USD",
          notes:
            "Max output: 64K tokens. Alias: claude-haiku-4-5. Supports Extended Thinking (no Adaptive Thinking). Active until at least October 15, 2026.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "long_context",
        ],
        description:
          "Anthropic's fastest and most cost-efficient model. Supports Extended Thinking. 200K token context window.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "google",
    displayName: "Google AI (Gemini)",
    apiKeyProviderName: "Google AI",
    apiKeyLink: "https://aistudio.google.com/app/apikey",
    providerWebsite: "https://ai.google.dev/",
    models: [
      {
        id: "gemini-3.1-pro-preview",
        displayName: "Gemini 3.1 Pro",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 12.0,
          currency: "USD",
          notes:
            "Pricing for prompts <=200K tokens. For prompts >200K: $4.00/1M input, $18.00/1M output. Batch: 50% discount. Caching: $0.20/M under 200K. Official context is 1M (some sources report 2M — use 1M until confirmed). Status: Preview as of April 2026.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "audio",
          "video",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "long_context",
        ],
        description:
          "Google's latest flagship model. Handles complex reasoning across code, math, and STEM with a 1M token context window. Preview status as of April 2026.",
        status: "preview",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "gemini-3.1-flash-live-preview",
        displayName: "Gemini 3.1 Flash Live",
        contextWindow: 131072,
        cost: {
          inputPerMillionTokens: 0.75,
          outputPerMillionTokens: 4.5,
          currency: "USD",
          notes:
            "Text input: $0.75/M; Audio input: $3.00/M or $0.005/min; Image/Video: $1.00/M or $0.002/min. Text output: $4.50/M; Audio output: $12.00/M or $0.018/min. Real-time audio/dialogue model — Live API integration differs from standard chat API. Launched ~March 26, 2026.",
        },
        costType: "appKeyPermissive",
        capabilities: [
          "text",
          "image",
          "audio",
          "video",
          "code",
          "json",
          "multilingual",
        ],
        description:
          "Google's low-latency real-time dialogue model supporting audio-to-audio and multimodal inputs. Uses the Live API, not standard chat API. Free via BotBattle's shared key.",
        status: "preview",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "xai",
    displayName: "xAI",
    apiKeyProviderName: "xAI",
    apiKeyLink: "https://console.x.ai/",
    providerWebsite: "https://x.ai",
    models: [
      {
        id: "grok-4.20-0309-reasoning",
        displayName: "Grok 4.20",
        contextWindow: 2000000,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 6.0,
          currency: "USD",
          notes:
            "Cached input: $0.20/M. Three variants exist: grok-4.20-0309-reasoning (thinking), grok-4.20-0309-non-reasoning, grok-4.20-multi-agent-0309 — all share same pricing. Knowledge cutoff: November 2024. Does not support logprobs.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "long_context",
        ],
        description:
          "xAI's flagship reasoning model with a 2M token context window. Reasoning is baked into the model ID variant rather than a parameter.",
        status: "current",
        modelType: "reasoning",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "grok-4-1-fast-non-reasoning",
        displayName: "Grok 4.1 Fast",
        contextWindow: 2000000,
        cost: {
          inputPerMillionTokens: 0.2,
          outputPerMillionTokens: 0.5,
          currency: "USD",
          notes:
            "Cached input: $0.05/M. Fast/cheap tier from xAI. Reasoning variant also available: grok-4-1-fast-reasoning.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "long_context",
        ],
        description:
          "xAI's fast and cost-efficient model with a 2M token context window. Excellent price-to-performance ratio for high-throughput workloads.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "deepseek",
    displayName: "DeepSeek AI",
    apiKeyProviderName: "DeepSeek AI",
    apiKeyLink: "https://platform.deepseek.com/api-keys",
    providerWebsite: "https://deepseek.ai/",
    models: [
      {
        id: "deepseek-chat",
        displayName: "DeepSeek V3.2",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.28,
          outputPerMillionTokens: 0.42,
          currency: "USD",
          notes:
            "Cache hit input: $0.028/1M. Default output 4K tokens; max output 8K. Supports FIM completion. deepseek-chat maps to the V3.2 model family (non-thinking mode).",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use"],
        description:
          "DeepSeek's V3.2 conversational model. Strong at coding and technical tasks at a very competitive price point.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "mistral",
    displayName: "Mistral AI",
    apiKeyProviderName: "Mistral AI",
    apiKeyLink: "https://console.mistral.ai/api-keys/",
    providerWebsite: "https://mistral.ai",
    models: [
      {
        id: "mistral-large-latest",
        displayName: "Mistral Large",
        contextWindow: 262144,
        cost: {
          inputPerMillionTokens: 0.5,
          outputPerMillionTokens: 1.5,
          currency: "USD",
          notes:
            "Points to mistral-large-2512 (released December 2025). Sparse MoE: 41B active / 675B total params. Apache 2.0 license.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "long_context",
        ],
        description:
          "Mistral's top-tier model for high-complexity tasks with a 262K context window. Strong multilingual and coding support.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "mistral-medium-3",
        displayName: "Mistral Medium 3",
        contextWindow: 131072,
        cost: {
          inputPerMillionTokens: 0.4,
          outputPerMillionTokens: 2.0,
          currency: "USD",
          notes:
            "Released May 7, 2025. Enterprise-grade multimodal performance. EUR pricing also available.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "long_context",
        ],
        description:
          "Enterprise-grade Mistral model balancing frontier-class multimodal performance with cost efficiency. 128K context window.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "qwen",
    displayName: "Qwen (Alibaba)",
    apiKeyProviderName: "Qwen",
    apiKeyLink: "https://dashscope.console.aliyun.com/apiKey",
    providerWebsite: "https://qwenlm.github.io/",
    models: [
      {
        id: "qwen3.6-plus",
        displayName: "Qwen3.6-Plus",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 0.325,
          outputPerMillionTokens: 1.95,
          currency: "USD",
          notes:
            "OpenRouter pricing ($0.325/$1.95). DashScope international pricing: ~$0.276/M input (<=256K), $1.101/M input (>256K), $1.65/M output. Integrate via OpenRouter or DashScope international endpoint. Released April 2, 2026.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "multilingual",
          "long_context",
        ],
        description:
          "Alibaba's latest flagship model with 1M token context window. Hybrid linear attention + sparse MoE architecture with reasoning support.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
  {
    id: "groq",
    displayName: "Groq",
    apiKeyProviderName: "Groq",
    apiKeyLink: "https://console.groq.com/keys",
    providerWebsite: "https://groq.com",
    models: [
      {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        displayName: "Llama 4 Scout",
        contextWindow: 131072,
        cost: {
          inputPerMillionTokens: 0,
          outputPerMillionTokens: 0,
          currency: "USD",
          notes:
            "Free via BotBattle's shared Groq key. Groq list price: $0.11/$0.34 per 1M tokens. Shared rate limit: 30 RPM / 14,400 req/day. Preview status on Groq as of April 2026.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "tool_use"],
        description:
          "Meta's Llama 4 Scout (17B, 16 experts MoE) served on Groq's fast inference hardware. Free via BotBattle's shared key — no API key needed.",
        status: "preview",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "llama-3.3-70b-versatile",
        displayName: "Llama 3.3 70B",
        contextWindow: 131072,
        cost: {
          inputPerMillionTokens: 0,
          outputPerMillionTokens: 0,
          currency: "USD",
          notes:
            "Free via BotBattle's shared Groq key. Groq list price: $0.59/$0.79 per 1M tokens. Shared rate limit: 30 RPM / 14,400 req/day. Production model.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "tool_use"],
        description:
          "Meta's Llama 3.3 70B Versatile served on Groq's LPU hardware at up to 280 tokens/sec. Free via BotBattle's shared key — no API key needed.",
        status: "current",
        modelType: "standard",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
      {
        id: "qwen/qwen3-32b",
        displayName: "Qwen3 32B",
        contextWindow: 131072,
        cost: {
          inputPerMillionTokens: 0,
          outputPerMillionTokens: 0,
          currency: "USD",
          notes:
            "Free via BotBattle's shared Groq key. Groq list price: $0.29/$0.59 per 1M tokens. Shared rate limit: 30 RPM / 14,400 req/day. Preview status on Groq as of April 2026. Reasoning mode toggled via thinking budget parameter.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "tool_use", "reasoning"],
        description:
          "Alibaba's Qwen3 32B reasoning model served on Groq. Supports hybrid thinking mode. Free via BotBattle's shared key — no API key needed.",
        status: "preview",
        modelType: "reasoning",
        supportsReasoningEffort: false,
        lastVerified: "2026-04-20",
      },
    ],
  },
];

// Helper function to get a specific model's spec
export function getModelSpec(
  providerId: string,
  modelId: string
): LLMModelSpec | undefined {
  const provider = LLM_REGISTRY.find((p) => p.id === providerId.toLowerCase());
  if (!provider) return undefined;
  return provider.models.find((m) => m.id === modelId);
}

// Helper function to get all models from a provider
export function getProviderModels(providerId: string): LLMModelSpec[] {
  const provider = LLM_REGISTRY.find((p) => p.id === providerId.toLowerCase());
  return provider ? provider.models : [];
}

// Helper function to check if a model is available based on API keys
export function isModelAvailable(
  providerId: string,
  modelId: string,
  availableApiKeys: Record<string, boolean>
): { available: boolean; reason?: string } {
  const modelSpec = getModelSpec(providerId, modelId);

  // If model not found in registry, it's not available
  if (!modelSpec) {
    return { available: false, reason: "Model not found in registry" };
  }

  // Check availability based on costType
  switch (modelSpec.costType) {
    case "free":
      // Free models are always available
      return { available: true };

    case "appKeyPermissive":
      // App can use its own key, so these are available
      return { available: true };

    case "userKeyOptional":
      // Check if user key is available, but model may still work with app fallback
      if (availableApiKeys[providerId]) {
        return { available: true };
      }
      // It might still work with app fallback, mark as available
      return {
        available: true,
        reason: "May have limited functionality without API key",
      };

    case "userKeyRequired":
      // These models require a user key to function
      if (availableApiKeys[providerId]) {
        return { available: true };
      }
      return {
        available: false,
        reason: `Requires ${LLM_REGISTRY.find((p) => p.id === providerId)?.apiKeyProviderName || providerId} API key`,
      };

    default:
      // Default to unavailable for unknown cost types
      return { available: false, reason: "Unknown availability" };
  }
}

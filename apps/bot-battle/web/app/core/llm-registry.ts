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
}

export interface LLMProviderSpec {
  id: string; // Unique provider ID (lowercase, e.g., "openai", "anthropic")
  displayName: string; // User-friendly provider name
  apiKeyProviderName: string; // The name of the entity the API key is for (e.g. "OpenAI", "Groq", "OpenRouter")
  apiKeyLink?: string; // URL to get an API key
  providerWebsite?: string; // Link to the provider's main website
  models: LLMModelSpec[];
}

export const LLM_REGISTRY: LLMProviderSpec[] = [
  {
    id: "openai",
    displayName: "OpenAI",
    apiKeyProviderName: "OpenAI",
    apiKeyLink: "https://platform.openai.com/api-keys",
    providerWebsite: "https://openai.com",
    models: [
      {
        id: "gpt-4.1",
        displayName: "GPT-4.1",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 2.7,
          outputPerMillionTokens: 10.8,
          currency: "USD",
          notes:
            "Cached input: $0.675 / 1M tokens. Fine-tuning: Training $13.50/1M, Input $5.40/1M, Output $21.60/1M. Knowledge cutoff: June 2024.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "long_context",
          "reasoning",
        ],
        description:
          "OpenAI's smartest model for complex tasks, with major gains in coding and instruction following. Features a 1M token context window.",
      },
      {
        id: "gpt-4.1-mini",
        displayName: "GPT-4.1 mini",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 0.4,
          outputPerMillionTokens: 1.6,
          currency: "USD",
          notes:
            "Cached input: $0.10 / 1M tokens. Fine-tuning: Training $5.00/1M, Input $0.80/1M, Output $3.20/1M. Knowledge cutoff: June 2024.",
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
          "Affordable OpenAI model balancing speed and intelligence with a 1M token context window.",
      },
      {
        id: "gpt-4.1-nano",
        displayName: "GPT-4.1 nano",
        contextWindow: 1000000,
        cost: {
          inputPerMillionTokens: 0.1,
          outputPerMillionTokens: 0.4,
          currency: "USD",
          notes:
            "Cached input: $0.025 / 1M tokens. Fine-tuning: Training $1.50/1M, Input $0.20/1M, Output $0.80/1M. Knowledge cutoff: June 2024.",
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
          "Fastest, most cost-effective OpenAI model for low-latency tasks with a 1M token context window.",
      },
      {
        id: "gpt-4o",
        displayName: "GPT-4o",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 5.0,
          outputPerMillionTokens: 20.0,
          currency: "USD",
          notes:
            "Text pricing. Cached input (Text): $2.50/1M. Audio input: $40.00/1M, Audio output: $80.00/1M. Fine-tuning (Text): Training $25.00/1M, Input $3.75/1M, Output $15.00/1M. Knowledge cutoff: Oct 2023.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "audio_input",
          "audio_output",
          "code",
          "json",
          "tool_use",
          "multilingual",
        ],
        description:
          "OpenAI's flagship multimodal model, natively processing text, audio, and image inputs and outputs. Rapid response times.",
      },
      {
        id: "gpt-4o-mini",
        displayName: "GPT-4o mini",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.6,
          outputPerMillionTokens: 2.4,
          currency: "USD",
          notes:
            "Text pricing. Cached input (Text): $0.30/1M. Audio input: $10.00/1M, Audio output: $20.00/1M. Fine-tuning available. Knowledge cutoff: July 2024 (Azure).",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "audio_input",
          "audio_output",
          "code",
          "json",
          "tool_use",
          "multilingual",
        ],
        description:
          "A smaller, faster, and more cost-effective version of GPT-4o, supporting multimodal inputs and outputs.",
      },
      // {
      //   id: "o3",
      //   displayName: "OpenAI o3",
      //   contextWindow: 200000,
      //   cost: {
      //     inputPerMillionTokens: 10.0,
      //     outputPerMillionTokens: 40.0,
      //     currency: "USD",
      //     notes:
      //       "Cached input: $2.50 / 1M tokens. Max output tokens: 100,000. Supports reasoning effort settings.",
      //   },
      //   costType: "userKeyRequired",
      //   capabilities: [
      //     "text",
      //     "image",
      //     "code",
      //     "json",
      //     "tool_use",
      //     "reasoning",
      //     "long_context",
      //   ],
      //   description:
      //     "OpenAI's most powerful reasoning model with leading performance on coding, math, science, and vision. Ideal for complex, multi-step problems.",
      // },
      {
        id: "o4-mini",
        displayName: "OpenAI o4-mini",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 1.1,
          outputPerMillionTokens: 4.4,
          currency: "USD",
          notes:
            "Cached input: $0.275 / 1M tokens. Reinforcement fine-tuning: Training $100.00/hour, Input $4.00/1M, Output $16.00/1M. Max output tokens: 100,000.",
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
          "A faster, cost-efficient reasoning model from OpenAI, delivering strong performance on math, coding, and vision. Optimized for high-throughput.",
      },
      {
        id: "gpt-3.5-turbo",
        displayName: "GPT-3.5 Turbo",
        contextWindow: 16385,
        cost: {
          inputPerMillionTokens: 0.5,
          outputPerMillionTokens: 1.5,
          currency: "USD",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use"],
        description: "Fast and cost-effective model for a variety of tasks.",
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
        id: "claude-3-7-sonnet-20250219",
        displayName: "Claude 3.7 Sonnet",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 3.0,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Cache Writes: $3.75/MTok, Cache Hits: $0.30/MTok. Training data cut-off: Nov 2024.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "extended_thinking",
          "reasoning",
          "long_context",
        ],
        description:
          "Anthropic's most intelligent model with visible step-by-step reasoning and toggleable extended thinking. Top-tier benchmark performance.",
      },
      {
        id: "claude-3-5-sonnet-20241022",
        displayName: "Claude 3.5 Sonnet",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 3.0,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Cache Writes: $3.75/MTok, Cache Hits: $0.30/MTok. Training data cut-off: Apr 2024.",
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
          "Anthropic's hard-working model offering a strong balance of intelligence and speed for enterprise workloads.",
      },
      {
        id: "claude-3-5-haiku-20241022",
        displayName: "Claude 3.5 Haiku",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 0.8,
          outputPerMillionTokens: 4.0,
          currency: "USD",
          notes:
            "Cache Writes: $1.00/MTok, Cache Hits: $0.08/MTok. Training data cut-off: July 2024.",
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
          "Anthropic's fastest and most cost-effective model in the Claude 3.5 family, offering intelligence at blazing speeds.",
      },
      {
        id: "claude-3-opus-20240229",
        displayName: "Claude 3 Opus",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 15.0,
          outputPerMillionTokens: 75.0,
          currency: "USD",
          notes:
            "Cache Writes: $18.75/MTok, Cache Hits: $1.50/MTok. Training data cut-off: Aug 2023.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "reasoning",
          "long_context",
        ],
        description:
          "Anthropic's most powerful Claude 3 model for complex analysis, longer tasks, and higher-order math and coding.",
      },
      {
        id: "claude-3-haiku-20240307",
        displayName: "Claude 3 Haiku",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 0.25,
          outputPerMillionTokens: 1.25,
          currency: "USD",
          notes:
            "Cache Writes: $0.30/MTok, Cache Hits: $0.03/MTok. Training data cut-off: Aug 2023.",
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
          "Anthropic's fastest and most compact Claude 3 model for near-instant responsiveness and quick, accurate targeted performance.",
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
        id: "gemini-2.5-pro-preview-05-06",
        displayName: "Gemini 2.5 Pro Preview",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 1.25,
          outputPerMillionTokens: 10.0,
          currency: "USD",
          notes:
            "Pricing for prompts <=200K tokens. For prompts >200K: $2.50/1M input, $15.00/1M output (output includes thinking tokens). Context caching and Grounding with Google Search available. Knowledge cutoff: Jan 2025.",
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
          "grounding",
          "long_context",
          "thinking_model",
          "reasoning",
        ],
        description:
          "Google's state-of-the-art thinking model, capable of reasoning over complex problems in code, math, STEM, and analyzing large datasets with long context.",
      },
      {
        id: "gemini-2.5-flash-preview-04-17",
        displayName: "Gemini 2.5 Flash Preview",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 0.15,
          outputPerMillionTokens: 0.6,
          currency: "USD",
          notes:
            "Pricing for text/image/video input and Non-thinking output. Audio input: $1.00/1M. Thinking output: $3.50/1M. Context caching and Grounding with Google Search available.",
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
          "grounding",
          "long_context",
          "thinking_model",
        ],
        description:
          "Google's best model for price-performance, offering well-rounded capabilities. Model thinks as needed or with a configured budget. Best for low latency, high volume tasks that require thinking.",
      },
      {
        id: "gemini-2.0-flash",
        displayName: "Gemini 2.0 Flash",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 0.1,
          outputPerMillionTokens: 0.4,
          currency: "USD",
          notes:
            "Pricing for text/image/video input. Audio input: $0.70/1M. Context caching, Grounding with Google Search, and Live API available.",
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
          "grounding",
          "live_api",
          "long_context",
        ],
        description:
          "A versatile and cost-effective multimodal model from Google, supporting live API interactions with next generation features and speed.",
      },
      {
        id: "gemini-2.0-flash-lite",
        displayName: "Gemini 2.0 Flash-Lite",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 0.05,
          outputPerMillionTokens: 0.2,
          currency: "USD",
          notes:
            "Optimized for cost efficiency and low latency. Pricing for text/image/video input.",
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
          "Google's lightweight Gemini 2.0 model optimized for cost efficiency and low latency for high volume tasks.",
      },
      {
        id: "gemini-1.5-pro",
        displayName: "Gemini 1.5 Pro",
        contextWindow: 2000000,
        cost: {
          inputPerMillionTokens: 1.25,
          outputPerMillionTokens: 5.0,
          currency: "USD",
          notes:
            "Pricing for prompts <=128K tokens. For prompts >128K: $2.50/1M input, $10.00/1M output. Context caching and Grounding with Google Search available.",
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
          "grounding",
          "long_context",
          "reasoning",
        ],
        description:
          "Google's highest intelligence Gemini 1.5 series model, with a breakthrough 2 million token context window. Excels at complex coding and reasoning.",
      },
      {
        id: "gemini-1.5-flash",
        displayName: "Gemini 1.5 Flash",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 0.075,
          outputPerMillionTokens: 0.3,
          currency: "USD",
          notes:
            "Pricing for prompts <=128K tokens. For prompts >128K: $0.15/1M input, $0.60/1M output. Context caching and Grounding with Google Search available. Optimized for speed and cost.",
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
          "grounding",
          "long_context",
        ],
        description:
          "Fast and efficient multimodal model from Google, optimized for diverse, repetitive tasks with a 1 million token context window.",
      },
      {
        id: "gemini-1.5-flash-8b",
        displayName: "Gemini 1.5 Flash-8B",
        contextWindow: 1048576,
        cost: {
          inputPerMillionTokens: 0.0375,
          outputPerMillionTokens: 0.15,
          currency: "USD",
          notes:
            "Pricing for prompts <=128K tokens. For prompts >128K: $0.075/1M input, $0.30/1M output. Context caching and Grounding with Google Search available.",
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
          "grounding",
          "long_context",
        ],
        description:
          "A smaller, highly cost-effective version of Gemini 1.5 Flash, suitable for high-volume, lower complexity tasks with a large context window.",
      },
      {
        id: "gemini-2.0-flash-exp:free",
        displayName: "Gemini 2.0 Flash Exp (Free)",
        contextWindow: 30720,
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "Free tier access to Google's Gemini 2.0 Flash Exp model via OpenRouter.",
      },
      {
        id: "gemini-2.5-pro-exp-03-25:free",
        displayName: "Gemini 2.5 Pro Exp (Free)",
        contextWindow: 128000,
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "reasoning"],
        description:
          "Free tier access to Google's Gemini 2.5 Pro Experimental model via OpenRouter. More powerful than the Flash variant with better reasoning.",
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
        id: "llama3-8b-8192",
        displayName: "Llama 3 8B (via Groq)",
        contextWindow: 8192,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes:
            "Currently free within Groq's developer limits with an API key.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "Meta's Llama 3 8B model, served with high speed on Groq LPU™.",
      },
      {
        id: "llama3-70b-8192",
        displayName: "Llama 3 70B (via Groq)",
        contextWindow: 8192,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes:
            "Currently free within Groq's developer limits with an API key.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "Meta's Llama 3 70B model, served with high speed on Groq LPU™.",
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
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 6.0,
          currency: "USD",
          notes:
            "EUR pricing also available. Top-tier reasoning for high-complexity tasks. `mistral-large-latest` points to `mistral-large-2411` (Knowledge cutoff Nov 2024).",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "reasoning",
          "long_context",
        ],
        description:
          "Mistral's top-tier reasoning model for high-complexity tasks and sophisticated problems. Strong multilingual and coding support.",
      },
      {
        id: "mistral-medium-latest",
        displayName: "Mistral Medium 3",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.4,
          outputPerMillionTokens: 2.0,
          currency: "USD",
          notes:
            "EUR pricing also available. `mistral-medium-latest` points to `mistral-medium-2505` (Knowledge cutoff May 2025).",
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
          "State-of-the-art Mistral model balancing frontier-class multimodal performance with size and pricing. Cost-efficient for enterprise.",
      },
      {
        id: "mistral-small-latest",
        displayName: "Mistral Small 3.1",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.1,
          outputPerMillionTokens: 0.3,
          currency: "USD",
          notes:
            "EUR pricing also available. Apache 2.0 license. `mistral-small-latest` points to `mistral-small-2503` (Knowledge cutoff March 2025).",
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
          "A multimodal leader in the small models category from Mistral. SOTA, multilingual, and Apache 2.0 licensed.",
      },
      {
        id: "pixtral-large-latest",
        displayName: "Pixtral Large",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 6.0,
          currency: "USD",
          notes:
            "EUR pricing also available. `pixtral-large-latest` points to `pixtral-large-2411` (Knowledge cutoff Nov 2024).",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "image",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "reasoning",
          "long_context",
        ],
        description:
          "Mistral's vision-capable large model with frontier reasoning capabilities. Multimodal and multilingual.",
      },
      {
        id: "mistral-saba-latest",
        displayName: "Mistral Saba",
        contextWindow: 32000,
        cost: {
          inputPerMillionTokens: 0.2,
          outputPerMillionTokens: 0.6,
          currency: "USD",
          notes:
            "EUR pricing also available. `mistral-saba-latest` points to `mistral-saba-2502` (Knowledge cutoff Feb 2025).",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "json", "tool_use", "multilingual"],
        description:
          "A powerful and efficient Mistral model custom-trained for languages from the Middle East and South Asia.",
      },
      {
        id: "ministral-8b-latest",
        displayName: "Ministral 8B",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.1,
          outputPerMillionTokens: 0.1,
          currency: "USD",
          notes:
            "EUR pricing also available for `Ministral 8B 24.10`. `ministral-8b-latest` points to `ministral-8b-2410` (Knowledge cutoff Oct 2024).",
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
          "Powerful Mistral edge model with extremely high performance/price ratio, suitable for on-device use cases.",
      },
      {
        id: "ministral-3b-latest",
        displayName: "Ministral 3B",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.04,
          outputPerMillionTokens: 0.04,
          currency: "USD",
          notes:
            "EUR pricing also available for `Ministral 3B 24.10`. `ministral-3b-latest` points to `ministral-3b-2410` (Knowledge cutoff Oct 2024).",
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
          "Mistral's most efficient edge model, offering unprecedented performance for resource-constrained environments.",
      },
      {
        id: "mistral-embed",
        displayName: "Mistral Embed",
        contextWindow: 8000,
        cost: {
          inputPerMillionTokens: 0.1,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes:
            "EUR pricing also available. Output is a vector representation. Knowledge cutoff Dec 2023.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "embeddings", "multilingual"],
        description:
          "Mistral's state-of-the-art semantic model for extracting representations of text extracts, useful for RAG.",
      },
      {
        id: "mistral-ocr-latest",
        displayName: "Mistral OCR",
        contextWindow: 0,
        cost: {
          inputPerMillionTokens: 0.5,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes:
            "Pricing is $1.00 per 1000 pages (approx. $0.50/1M tokens if 1 page ~2k tokens). Output is extracted text. `mistral-ocr-latest` points to version from March 2025.",
        },
        costType: "userKeyRequired",
        capabilities: ["image", "text_extraction"],
        description:
          "Mistral's OCR service that enables users to extract interleaved text and images from documents.",
      },
    ],
  },
  {
    id: "cohere",
    displayName: "Cohere",
    apiKeyProviderName: "Cohere",
    apiKeyLink: "https://dashboard.cohere.com/api-keys",
    providerWebsite: "https://cohere.com",
    models: [
      {
        id: "command-r-plus",
        displayName: "Command R+",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 3.0,
          outputPerMillionTokens: 9.0,
          currency: "USD",
          notes:
            "Optimized for RAG, tool use, and multilingual tasks. Latest version `command-r-plus-08-2024`.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "rag",
          "long_context",
          "reasoning",
        ],
        description:
          "Cohere's most performant model, specializing in agentic AI, tool use, complex RAG workflows, and multilingual applications.",
      },
      {
        id: "command-r",
        displayName: "Command R",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 0.5,
          outputPerMillionTokens: 1.5,
          currency: "USD",
          notes:
            "Optimized for conversational interaction, long context tasks, RAG and tool use. Latest version `command-r-08-2024`.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "multilingual",
          "rag",
          "long_context",
        ],
        description:
          "A scalable Cohere model balancing high performance with accuracy for production applications, strong in RAG, tool use, and 10 key languages.",
      },
    ],
  },
  {
    id: "ai21",
    displayName: "AI21 Labs",
    apiKeyProviderName: "AI21 Labs",
    apiKeyLink: "https://studio.ai21.com/account/api-key",
    providerWebsite: "https://www.ai21.com",
    models: [
      {
        id: "jamba-large",
        displayName: "Jamba Large 1.6",
        contextWindow: 256000,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 8.0,
          currency: "USD",
          notes:
            "Points to `jamba-large-1.6-2025-03`. Knowledge cutoff: March 5th, 2024.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "json",
          "tool_use",
          "multilingual",
          "long_context",
          "rag",
        ],
        description:
          "AI21's most powerful Jamba model with a 256K context window, built on a hybrid Mamba-Transformer architecture. Excels at long context tasks, RAG, and enterprise deployment.",
      },
      {
        id: "jamba-mini",
        displayName: "Jamba Mini 1.6",
        contextWindow: 256000,
        cost: {
          inputPerMillionTokens: 0.2,
          outputPerMillionTokens: 0.4,
          currency: "USD",
          notes:
            "Points to `jamba-mini-1.6-2025-03`. Knowledge cutoff: March 5th, 2024.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "json",
          "tool_use",
          "multilingual",
          "long_context",
          "rag",
        ],
        description:
          "An efficient and lightweight Jamba model from AI21 with a 256K context window, offering a balance of performance and cost for a wide range of tasks.",
      },
    ],
  },
  {
    id: "openrouter",
    displayName: "OpenRouter",
    apiKeyProviderName: "OpenRouter",
    apiKeyLink: "https://openrouter.ai/keys",
    providerWebsite: "https://openrouter.ai",
    models: [
      {
        id: "anthropic/claude-3-haiku-20240307",
        displayName: "Claude 3 Haiku (via OpenRouter)",
        contextWindow: 200000,
        cost: {
          inputPerMillionTokens: 0.25,
          outputPerMillionTokens: 1.25,
          currency: "USD",
          notes:
            "Via OpenRouter, prices may vary. OpenRouter adds a small markup.",
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
          "Anthropic's Claude 3 Haiku via OpenRouter. Fast and efficient model for quick responses.",
      },
      {
        id: "deepseek/deepseek-chat",
        displayName: "DeepSeek Chat (via OpenRouter)",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 0.5,
          outputPerMillionTokens: 2.5,
          currency: "USD",
          notes:
            "Via OpenRouter, prices may vary. OpenRouter adds a small markup.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use"],
        description:
          "DeepSeek's conversational model via OpenRouter. Strong at coding and technical tasks.",
      },
    ],
  },
  {
    id: "meta",
    displayName: "Meta AI (Llama)",
    apiKeyProviderName: "OpenRouter",
    apiKeyLink: "https://openrouter.ai/keys",
    providerWebsite: "https://ai.meta.com/llama/",
    models: [
      {
        id: "llama-3.3-8b-instruct:free",
        displayName: "Llama 3.3 8B Instruct",
        contextWindow: 16384,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "Meta's Llama 3.3 8B Instruct. Fast and efficient instruction-following model with solid capabilities.",
      },
      {
        id: "llama-4-maverick:free",
        displayName: "Llama 4 Maverick",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "reasoning"],
        description:
          "Meta's latest Llama 4 model. Powerful reasoning and instruction-following capabilities.",
      },
      {
        id: "llama-3-opus-70b",
        displayName: "Llama 3 Opus 70B",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 5.0,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Premium model requiring Meta API key or via OpenRouter. Higher costs reflect excellent performance.",
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
          "Meta's flagship Llama 3 Opus model with exceptional reasoning capabilities and long context window. Premium model requiring API key.",
      },
      {
        id: "llama-4-opus",
        displayName: "Llama 4 Opus",
        contextWindow: 128000,
        cost: {
          inputPerMillionTokens: 8.0,
          outputPerMillionTokens: 24.0,
          currency: "USD",
          notes:
            "Premium model requiring Meta API key. Top-tier performance in the Llama family.",
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
          "Meta's most powerful Llama 4 model with top-tier reasoning, multilingual, and coding capabilities. API key required.",
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
        id: "deepseek-coder-33b-instruct",
        displayName: "DeepSeek Coder 33B Instruct",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 1.0,
          outputPerMillionTokens: 5.0,
          currency: "USD",
          notes: "Premium model requiring DeepSeek API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use", "reasoning"],
        description:
          "DeepSeek's powerful coding model, optimized for code generation, understanding, and explanation with top-tier benchmark performance.",
      },
      {
        id: "deepseek-v2",
        displayName: "DeepSeek V2",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 8.0,
          currency: "USD",
          notes: "Premium model requiring DeepSeek API key.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "multilingual",
        ],
        description:
          "DeepSeek's flagship large language model with advanced reasoning capabilities and strong performance across a wide range of tasks.",
      },
      {
        id: "deepseek-llm-67b-chat",
        displayName: "DeepSeek LLM 67B Chat",
        contextWindow: 16384,
        cost: {
          inputPerMillionTokens: 0.8,
          outputPerMillionTokens: 3.2,
          currency: "USD",
          notes: "Premium model requiring DeepSeek API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "reasoning", "multilingual"],
        description:
          "A well-balanced DeepSeek model offering strong performance for general purpose tasks and technical content generation.",
      },
      {
        id: "deepseek-prover-v2:free",
        displayName: "DeepSeek Prover V2",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "math", "reasoning"],
        description:
          "DeepSeek's specialized model for mathematical proofs and reasoning.",
      },
      {
        id: "deepseek-v3-base:free",
        displayName: "DeepSeek V3 Base",
        contextWindow: 16384,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "DeepSeek's V3 base model. General purpose text and code generation.",
      },
    ],
  },
  {
    id: "nousresearch",
    displayName: "Nous Research",
    apiKeyProviderName: "OpenRouter",
    apiKeyLink: "https://openrouter.ai/keys",
    providerWebsite: "https://nousresearch.com/",
    models: [
      {
        id: "deephermes-3-mistral-24b-preview:free",
        displayName: "DeepHermes 3 Mistral 24B Preview",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "reasoning"],
        description:
          "Nous Research's DeepHermes 3 based on Mistral 24B. Powerful open-source model with great reasoning.",
      },
    ],
  },
  {
    id: "microsoft",
    displayName: "Microsoft (Phi)",
    apiKeyProviderName: "OpenRouter",
    apiKeyLink: "https://openrouter.ai/keys",
    providerWebsite:
      "https://www.microsoft.com/en-us/research/blog/phi-4-towards-reasoning-in-small-language-models/",
    models: [
      {
        id: "phi-4-reasoning-plus:free",
        displayName: "Phi 4 Reasoning Plus",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json", "reasoning"],
        description:
          "Microsoft's Phi-4 model specialized for reasoning tasks. Small but powerful.",
      },
      {
        id: "phi-4-vision",
        displayName: "Phi 4 Vision",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 1.0,
          outputPerMillionTokens: 3.0,
          currency: "USD",
          notes:
            "Premium model with multimodal capabilities. Requires Microsoft API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "image", "code", "json", "reasoning"],
        description:
          "Microsoft's Phi-4 model with vision capabilities for image understanding and reasoning. Requires API key.",
      },
      {
        id: "phi-4-advanced",
        displayName: "Phi 4 Advanced",
        contextWindow: 65536,
        cost: {
          inputPerMillionTokens: 2.0,
          outputPerMillionTokens: 6.0,
          currency: "USD",
          notes:
            "Microsoft's most advanced Phi model with enhanced capabilities. Requires API key.",
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
          "Microsoft's most capable Phi-4 model with advanced reasoning, tool use, and a large context window. API key required.",
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
        id: "qwen3-235b-a22b",
        displayName: "Qwen3 235B A22B",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 5.0,
          outputPerMillionTokens: 15.0,
          currency: "USD",
          notes:
            "Premium model requiring Qwen API key. Most powerful Qwen model available.",
        },
        costType: "userKeyRequired",
        capabilities: [
          "text",
          "code",
          "json",
          "tool_use",
          "reasoning",
          "multilingual",
        ],
        description:
          "The most powerful mixture-of-experts language model in the Qwen family, offering exceptional performance on complex tasks.",
      },
      {
        id: "qwen3-30b-a3b",
        displayName: "Qwen3 30B A3B",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 1.0,
          outputPerMillionTokens: 3.0,
          currency: "USD",
          notes: "Premium model requiring Qwen API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use", "multilingual"],
        description:
          "A compact and high-performance Mixture of Experts (MoE) model, balancing power and efficiency.",
      },
      {
        id: "qwen3-32b",
        displayName: "Qwen3 32B",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 1.2,
          outputPerMillionTokens: 3.6,
          currency: "USD",
          notes: "Premium model requiring Qwen API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use", "multilingual"],
        description:
          "The most powerful dense model in the Qwen3 family, offering strong performance for general purpose tasks.",
      },
      {
        id: "qwen2.5-max",
        displayName: "Qwen2.5 Max",
        contextWindow: 32768,
        cost: {
          inputPerMillionTokens: 3.0,
          outputPerMillionTokens: 9.0,
          currency: "USD",
          notes: "Premium model requiring Qwen API key.",
        },
        costType: "userKeyRequired",
        capabilities: ["text", "code", "json", "tool_use", "multilingual"],
        description:
          "The most powerful language model in the Qwen2.5 series, delivering exceptional performance across a wide range of tasks.",
      },
      {
        id: "qwen3-1.7b:free",
        displayName: "Qwen3 1.7B (Free)",
        contextWindow: 8192,
        cost: {
          inputPerMillionTokens: 0.0,
          outputPerMillionTokens: 0.0,
          currency: "USD",
          notes: "Free tier via OpenRouter. May have usage limits.",
        },
        costType: "appKeyPermissive",
        capabilities: ["text", "code", "json"],
        description:
          "Alibaba's Qwen3 1.7B model. Very small but effective general purpose model.",
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

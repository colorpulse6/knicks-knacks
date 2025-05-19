// Type definitions for LLM functionality

export type LLMModel =
  | "claude"
  | "gemini"
  | "groq"
  | "deepseek"
  | "mistral"
  | "perplexity"
  | "cohere"
  | "openrouter"
  | "openai";

export interface AdvancedLLMMetrics {
  accuracy?: number;
  clarity?: number;
  relevance?: number;
  creativity?: number;
  toxicity?: number;
  bias?: number;
  comprehensiveness?: number;
}

export interface LLMCallResult {
  response: string;
  metrics: {
    latencyMs: number;
    tokensPerSecond?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    wordCount?: number;
    charCount?: number;
    accuracy?: number;
    clarity?: number;
    relevance?: number;
    creativity?: number;
    toxicity?: number;
    bias?: number;
    comprehensiveness?: number;
    [key: string]: string | number | undefined;
  };
}

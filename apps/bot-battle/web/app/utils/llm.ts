// Utility functions to call LLM APIs for BotBattle
// Each function should call its respective API and return a normalized response

import {
  APIError,
  parseGeminiError,
  parseGroqError,
  parseOpenAIError,
} from "./apiErrors";

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

// --- Helper for Groq as Judge ---
async function judgeWithGroq(
  prompt: string,
  response: string,
  signal?: AbortSignal
): Promise<AdvancedLLMMetrics> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const judgePrompt = `You are an expert LLM evaluator. Given the following prompt and response, rate the response on a scale of 1-5 for each metric: accuracy, clarity, relevance, creativity, toxicity, bias, and comprehensiveness. Return the result as a JSON object with keys: accuracy, clarity, relevance, creativity, toxicity, bias, comprehensiveness.\n\nPrompt: ${prompt}\nResponse: ${response}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: judgePrompt }],
      max_tokens: 256,
    }),
    signal,
  });

  if (!res.ok) {
    let errorMsg = `Groq judge API error: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      throw parseGroqError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Try to parse JSON from Groq's response
  try {
    const json = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return json;
  } catch {
    return {};
  }
}

// --- Helper for Groq (LLaMA, Mixtral) ---
async function callGroqAPI(
  prompt: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const start = performance.now();
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Groq API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      throw parseGroqError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

// --- Helper for Gemini ---
async function callGeminiAPI(
  prompt: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const start = performance.now();
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `Gemini API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      throw parseGeminiError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  // Gemini's response structure
  const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Gemini does not provide token usage in the response
  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      wordCount: message.split(/\s+/).length,
      charCount: message.length,
    },
  };
}

// --- Helper for OpenAI ---
async function callOpenAIAPI(
  prompt: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const start = performance.now();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenAI API error: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      throw parseOpenAIError(errorJson);
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const charCount = message.length;
  const outputTokens = usage.completion_tokens;
  const inputTokens = usage.prompt_tokens;
  const totalTokens = usage.total_tokens;
  const tokensPerSecond =
    outputTokens && latencyMs > 0
      ? outputTokens / (latencyMs / 1000)
      : undefined;

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens,
      outputTokens,
      totalTokens,
      tokensPerSecond,
      wordCount,
      charCount,
    },
  };
}

async function callOpenRouterClaude(
  prompt: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const start = performance.now();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bot-battle.com",
        "X-Title": "Bot Battle",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal,
    }
  );

  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenRouter Claude error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount: message.split(/\s+/).filter(Boolean).length,
      charCount: message.length,
    },
  };
}

// --- Helper for OpenRouter (DeepSeek) ---
async function callOpenRouterDeepSeek(
  prompt: string,
  signal?: AbortSignal
): Promise<{ response: string; metrics: Record<string, number | undefined> }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const start = performance.now();
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://bot-battle.com",
        "X-Title": "Bot Battle",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
      signal,
    }
  );
  console.log("OPEN ROUTER RESPONSE: ", response);
  const latencyMs = performance.now() - start;

  if (!response.ok) {
    let errorMsg = `OpenRouter API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errorMsg += ` - ${errorJson.error?.message || JSON.stringify(errorJson)}`;
      throw new APIError(errorMsg, "api_error");
    } catch (e) {
      throw new APIError(errorMsg, "api_error");
    }
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || "";
  const usage = data.usage || {};

  return {
    response: message,
    metrics: {
      latencyMs: Math.round(latencyMs),
      inputTokens: usage.prompt_tokens,
      outputTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      tokensPerSecond:
        usage.completion_tokens && latencyMs > 0
          ? usage.completion_tokens / (latencyMs / 1000)
          : undefined,
      wordCount: message.split(/\s+/).filter(Boolean).length,
      charCount: message.length,
    },
  };
}

export async function callLLM(
  model: LLMModel,
  prompt: string,
  signal?: AbortSignal
): Promise<LLMCallResult> {
  let result: {
    response: string;
    metrics: Record<string, number | undefined>;
  } = { response: "", metrics: { latencyMs: 0 } };
  try {
    switch (model) {
      case "groq":
        result = await callGroqAPI(prompt, signal);
        break;
      case "gemini":
        result = await callGeminiAPI(prompt, signal);
        break;
      case "deepseek":
        result = await callOpenRouterDeepSeek(prompt, signal);
        break;
      case "openrouter":
      case "openai":
        result = await callOpenAIAPI(prompt, signal);
        break;
      case "claude":
        result = await callOpenRouterClaude(prompt, signal);
        break;
      case "mistral":
        result.response = "[Mistral response placeholder]";
        break;
      case "perplexity":
        result.response = "[Perplexity response placeholder]";
        break;
      case "cohere":
        result.response = "[Cohere response placeholder]";
        break;
      default:
        result.response = "[Unknown model]";
    }
  } catch (err: any) {
    result.response = `Error: ${err.message}`;
  }

  // Run Groq judge for ALL models with non-empty response
  if (result.response && result.response.trim().length > 0) {
    try {
      const advMetrics = await judgeWithGroq(prompt, result.response, signal);
      result.metrics = { ...result.metrics, ...advMetrics };
    } catch {
      // If judge fails, ignore
    }
  }

  return {
    response: result.response,
    metrics: result.metrics as LLMCallResult["metrics"],
  };
}

// Main LLM module entry point - exports the entire API

// Re-export types
export * from "./types";

// Re-export constants
export * from "./constants";

// Re-export API key management
export * from "./api-keys";

// Re-export utility functions
export * from "./utils";

// Re-export provider implementations
export * from "./providers";

import { getModelSpec } from "../../core/llm-registry";
import { APIError } from "../apiErrors";
import { LEGACY_MODEL_MAPPING } from "./constants";
import { LLMCallResult, LLMModel } from "./types";
import { judgeWithGroq } from "./utils";
import {
  callAnthropicAPI,
  callGeminiAPI,
  callGroqAPI,
  callMistralAPI,
  callOpenAIAPI,
  callQwenAPI,
  callDeepSeekAPI,
} from "./providers";

// Main function to call any LLM with providerId and modelId
export async function callLLMWithProviderAndModel(
  providerId: string,
  modelId: string,
  prompt: string,
  signal?: AbortSignal
): Promise<LLMCallResult> {
  // Validate that the providerId and modelId combination exists in the registry
  const modelSpec = getModelSpec(providerId, modelId);
  if (!modelSpec) {
    throw new APIError(
      `Model ${providerId}/${modelId} not found in registry`,
      "model_not_found"
    );
  }

  let result: {
    response: string;
    metrics: Record<string, number | undefined>;
  } = { response: "", metrics: { latencyMs: 0 } };

  try {
    // Route to appropriate API based on providerId
    switch (providerId.toLowerCase()) {
      case "openai":
        // Call OpenAI API with the specific model
        result = await callOpenAIAPI(prompt, signal, modelId);
        break;
      case "anthropic":
        // Call Anthropic API directly with the specific model
        result = await callAnthropicAPI(prompt, signal, modelId);
        break;
      case "groq":
        // Call Groq API with the specific model
        result = await callGroqAPI(prompt, signal, modelId);
        break;
      case "google":
        // Call Google/Gemini API directly
        result = await callGeminiAPI(prompt, signal, modelId);
        break;
      case "mistral":
        // Call Mistral API with the specific model
        result = await callMistralAPI(prompt, signal, modelId);
        break;
      case "qwen":
        // Call Qwen API directly
        result = await callQwenAPI(prompt, signal, modelId);
        break;
      case "deepseek":
        // Call DeepSeek API directly
        result = await callDeepSeekAPI(prompt, signal, modelId);
        break;
      default:
        throw new APIError(
          `Provider ${providerId} not implemented yet`,
          "provider_not_implemented"
        );
    }
  } catch (err: any) {
    // Re-throw any errors
    throw err;
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

// Backward compatibility function for legacy code
export async function callLLM(
  model: LLMModel,
  prompt: string,
  signal?: AbortSignal
): Promise<LLMCallResult> {
  console.warn(
    "callLLM is deprecated, please use callLLMWithProviderAndModel instead"
  );

  const mapping = LEGACY_MODEL_MAPPING[model];
  if (!mapping) {
    return {
      response: `Error: Unknown model '${model}'`,
      metrics: { latencyMs: 0 },
    };
  }

  try {
    return await callLLMWithProviderAndModel(
      mapping.providerId,
      mapping.modelId,
      prompt,
      signal
    );
  } catch (err: any) {
    // For backward compatibility, return error in response rather than throwing
    return {
      response: `Error: ${err.message}`,
      metrics: { latencyMs: 0 },
    };
  }
}

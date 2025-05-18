import { NextRequest, NextResponse } from "next/server";
import { callLLMWithProviderAndModel } from "../../utils/llm";
import { isModelAvailable, getModelSpec } from "../../core/llm-registry";

// Providers that use OpenRouter under the hood
const OPENROUTER_BASED_PROVIDERS = [
  "openrouter",
  "nousresearch",
  "qwen",
  "deepseek",
  "google",
];

// Providers that can use OpenRouter for free models or direct API for premium models
const HYBRID_PROVIDERS = ["meta", "microsoft"];

export async function POST(req: NextRequest) {
  try {
    console.log("LLM API route called");

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { providerId, modelId, prompt } = body;

    if (!providerId || !modelId || !prompt) {
      console.log("Missing required fields:", {
        providerId,
        modelId,
        promptLength: prompt?.length,
      });
      return NextResponse.json(
        { error: "Missing required fields: providerId, modelId, and prompt" },
        { status: 400 }
      );
    }

    console.log(`Processing request for ${providerId}/${modelId}`);

    // Check if model is available with server-side keys
    // We create an availableApiKeys object with the server keys
    const availableApiKeys: Record<string, boolean> = {};

    // Check if we have server environment keys for each provider
    if (process.env.GROQ_API_KEY) availableApiKeys.groq = true;
    if (process.env.OPENAI_API_KEY) availableApiKeys.openai = true;
    if (process.env.GEMINI_API_KEY) availableApiKeys.google = true;
    if (process.env.OPENROUTER_API_KEY) {
      // Make OpenRouter API key available for all OpenRouter-based providers
      availableApiKeys.openrouter = true;

      // The app's OpenRouter key should work for all these providers
      OPENROUTER_BASED_PROVIDERS.forEach((provider) => {
        availableApiKeys[provider] = true;
      });
    }
    if (process.env.ANTHROPIC_API_KEY) availableApiKeys.anthropic = true;
    if (process.env.MISTRAL_API_KEY) availableApiKeys.mistral = true;
    if (process.env.COHERE_API_KEY) availableApiKeys.cohere = true;
    if (process.env.AI21_API_KEY) availableApiKeys.ai21 = true;
    if (process.env.META_API_KEY) availableApiKeys.meta = true;
    if (process.env.MICROSOFT_API_KEY) availableApiKeys.microsoft = true;

    // Special case for OpenRouter-based providers with appKeyPermissive models
    if (OPENROUTER_BASED_PROVIDERS.includes(providerId.toLowerCase())) {
      const modelSpec = getModelSpec(providerId, modelId);
      if (modelSpec?.costType === "appKeyPermissive") {
        // For free models, we'll mark them as available if we have the app's OpenRouter key
        if (process.env.OPENROUTER_API_KEY) {
          console.log(
            `Using app's OpenRouter API key for ${providerId}/${modelId}`
          );
          availableApiKeys[providerId] = true;
        }
      }
    }

    // Special case for hybrid providers (Meta, Microsoft) that can use OpenRouter for free models
    if (HYBRID_PROVIDERS.includes(providerId.toLowerCase())) {
      const modelSpec = getModelSpec(providerId, modelId);
      if (
        modelSpec?.costType === "appKeyPermissive" &&
        modelId.includes(":free")
      ) {
        // For free models, we'll use OpenRouter
        if (process.env.OPENROUTER_API_KEY) {
          console.log(
            `Using app's OpenRouter API key for free model ${providerId}/${modelId}`
          );
          availableApiKeys[providerId] = true;
        }
      } else if (modelSpec?.costType === "userKeyRequired") {
        // For premium models, check if we have the provider's own API key
        const providerApiKey =
          process.env[`${providerId.toUpperCase()}_API_KEY`];
        if (providerApiKey) {
          console.log(
            `Using ${providerId}'s API key for premium model ${modelId}`
          );
          availableApiKeys[providerId] = true;
        }
      }
    }

    // Check model availability
    const { available, reason } = isModelAvailable(
      providerId,
      modelId,
      availableApiKeys
    );

    if (!available) {
      console.log(`Model ${providerId}/${modelId} is not available: ${reason}`);
      return NextResponse.json(
        {
          error: `This model is not available: ${reason || "No API key provided"}`,
          errorType: "model_unavailable",
        },
        { status: 403 }
      );
    }

    try {
      const result = await callLLMWithProviderAndModel(
        providerId,
        modelId,
        prompt
      );

      console.log("LLM response successful");
      return NextResponse.json(result);
    } catch (llmErr: any) {
      console.error("Error in LLM processing:", llmErr);
      throw llmErr; // Re-throw to be caught by the outer catch
    }
  } catch (err: any) {
    console.error("Error in API route:", err);
    const errorMessage = err.message || "Unknown error";
    const errorStack = err.stack || "";
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: errorMessage,
        errorType: err.name || typeof err,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}

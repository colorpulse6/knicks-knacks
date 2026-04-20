import { NextRequest, NextResponse } from "next/server";
import { callLLMWithProviderAndModel } from "../../utils/llm/index";
import { isModelAvailable, LLM_REGISTRY } from "../../core/llm-registry";
import { STREAMABLE_PROVIDERS, openAIStreamToNDJSON } from "../../utils/llm/streaming";
import { getApiKey } from "../../utils/llm/api-keys";

const PROVIDER_STREAM_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  xai: "https://api.x.ai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/v1/chat/completions",
  groq: "https://api.groq.com/openai/v1/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
};
const PROVIDER_ENV_KEY: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  xai: "XAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
};

export async function POST(req: NextRequest) {
  try {
    console.log("LLM API route called");

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { providerId, modelId, prompt, effort, isReasoning, stream } = body;

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
    if (process.env.ANTHROPIC_API_KEY) availableApiKeys.anthropic = true;
    if (process.env.MISTRAL_API_KEY) availableApiKeys.mistral = true;
    if (process.env.DEEPSEEK_API_KEY) availableApiKeys.deepseek = true;
    if (process.env.QWEN_API_KEY) availableApiKeys.qwen = true;
    if (process.env.XAI_API_KEY) availableApiKeys.xai = true;

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

    if (stream === true && STREAMABLE_PROVIDERS.has(providerId)) {
      const endpoint = PROVIDER_STREAM_ENDPOINTS[providerId];
      const envKeyName = PROVIDER_ENV_KEY[providerId];
      const apiKey = getApiKey(providerId, process.env[envKeyName]);
      const modelSpec = LLM_REGISTRY.find((p) => p.id === providerId)
        ?.models.find((m) => m.id === modelId);
      const isStreamReasoning = modelSpec?.modelType === "reasoning";
      const startedAt = Date.now();
      const providerRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          stream: true,
          ...(isStreamReasoning && effort ? { reasoning: { effort } } : {}),
        }),
      });
      if (!providerRes.ok) {
        const text = await providerRes.text().catch(() => "");
        return NextResponse.json(
          { error: `${providerRes.status}: ${text.slice(0, 200)}` },
          { status: providerRes.status }
        );
      }
      const ndjson = openAIStreamToNDJSON(providerRes, startedAt);
      return new Response(ndjson, {
        headers: { "content-type": "application/x-ndjson" },
      });
    }

    try {
      const result = await callLLMWithProviderAndModel(
        providerId,
        modelId,
        prompt,
        { effort, isReasoning }
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

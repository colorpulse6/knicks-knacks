import { NextRequest, NextResponse } from "next/server";
import { callLLMWithProviderAndModel } from "../../utils/llm/index";
import { isModelAvailable } from "../../core/llm-registry";

export async function POST(req: NextRequest) {
  try {
    console.log("LLM API route called");

    const body = await req.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    const { providerId, modelId, prompt, effort } = body;

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

    try {
      const result = await callLLMWithProviderAndModel(
        providerId,
        modelId,
        prompt,
        { effort }
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

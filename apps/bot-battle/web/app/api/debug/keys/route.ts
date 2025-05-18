import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Only available in development mode for security
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Debug endpoints only available in development" },
      { status: 403 }
    );
  }

  // Check for API keys and mask them
  const apiKeys = {
    groq: process.env.GROQ_API_KEY
      ? maskApiKey(process.env.GROQ_API_KEY)
      : null,
    nextPublicGroq: process.env.NEXT_PUBLIC_GROQ_API_KEY
      ? maskApiKey(process.env.NEXT_PUBLIC_GROQ_API_KEY)
      : null,
    openai: process.env.OPENAI_API_KEY
      ? maskApiKey(process.env.OPENAI_API_KEY)
      : null,
    gemini: process.env.GEMINI_API_KEY
      ? maskApiKey(process.env.GEMINI_API_KEY)
      : null,
    openrouter: process.env.OPENROUTER_API_KEY
      ? maskApiKey(process.env.OPENROUTER_API_KEY)
      : null,
  };

  // Gather environmental information
  const environment = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV || "local",
    apiKeysPresent: {
      groq: !!process.env.GROQ_API_KEY,
      nextPublicGroq: !!process.env.NEXT_PUBLIC_GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    },
  };

  return NextResponse.json({
    status: "API key debug information",
    apiKeys,
    environment,
    message:
      "Add your API keys to .env.local file. Make sure there are no extra spaces or quotes around the keys.",
  });
}

// Utility to mask API keys for security
function maskApiKey(key: string): string {
  if (!key) return "missing";
  if (key.length < 8) return "***invalid-format***";

  // Only show the first 4 and last 4 characters
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}

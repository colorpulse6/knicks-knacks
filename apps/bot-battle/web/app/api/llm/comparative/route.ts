import { NextRequest, NextResponse } from "next/server";
import {
  parseGroqError,
  getFriendlyErrorMessage,
} from "../../../utils/apiErrors";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: "Missing GROQ_API_KEY" },
      { status: 500 }
    );
  }

  const { prompt, results } = await req.json();
  if (!prompt || !Array.isArray(results) || results.length < 2) {
    return NextResponse.json(
      { error: "Prompt and at least two results required." },
      { status: 400 }
    );
  }

  // Format model names from new provider/model format if available
  const responsesText = results
    .map((r, i) => {
      let modelName;
      if (r.providerId && r.modelId) {
        // New format with separate provider and model IDs
        modelName = `${r.providerId}/${r.modelId}`;
      } else if (r.model) {
        // Legacy format with single model string
        modelName = r.model;
      } else {
        modelName = `Model ${i + 1}`;
      }
      return `Model ${i + 1} (${modelName}):\n${r.response}`;
    })
    .join("\n\n");

  const judgePrompt = `You are an expert LLM evaluator. Given the following prompt and the responses from multiple models, provide a comparative analysis.\n\n**Formatting Instructions:**\n- Use clear, bold section titles for each model (e.g., **Model 1 (OpenAI/gpt-4o)**), and for the overall analysis and ranking.\n- For each model, include a short summary, then list strengths and weaknesses as bullet points.\n- At the end, provide a clearly titled, ranked list of models (best to worst) with a one-sentence justification for each rank.\n- Use Markdown for all formatting.\n- Do NOT use Markdown tables.\n- Use only headings, bold, italics, and bullet points.\n- Do NOT include any raw HTML.\n- Do NOT repeat the prompt or responses in your output.\n\n**Prompt:** ${prompt}\n\n**Responses:**\n${responsesText}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: judgePrompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      const error = parseGroqError(errorData);
      return NextResponse.json(
        { error: getFriendlyErrorMessage(error) },
        { status: res.status }
      );
    }

    const data = await res.json();
    const analysis = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ analysis });
  } catch (error) {
    const parsedError = parseGroqError(error);
    return NextResponse.json(
      { error: getFriendlyErrorMessage(parsedError) },
      { status: 500 }
    );
  }
}

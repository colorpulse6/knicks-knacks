import { NextRequest, NextResponse } from "next/server";

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

  // Compose a comparative judging prompt
  const responsesText = results
    .map((r, i) => `Model ${i + 1} (${r.model}):\n${r.response}`)
    .join("\n\n");
  const judgePrompt = `You are an expert LLM evaluator. Given the following prompt and the responses from multiple models, provide a comparative analysis. Highlight the strengths, weaknesses, and overall ranking of each response.\n\nPrompt: ${prompt}\n\nResponses:\n${responsesText}\n\nReturn your analysis as a readable critique, and then provide a ranked list of models (best to worst).`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: judgePrompt }],
        max_tokens: 512,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
    const data = await res.json();
    const analysis = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ analysis });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "../../utils/llm";

export async function POST(req: NextRequest) {
  try {
    const { model, prompt } = await req.json();
    const result = await callLLM(model, prompt);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

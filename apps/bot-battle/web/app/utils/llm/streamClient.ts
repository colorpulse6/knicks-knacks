import { parseNDJSONStream } from "./ndjson";

export interface LLMRequestBody {
  providerId: string;
  modelId: string;
  prompt: string;
  effort?: "low" | "medium" | "high";
  stream?: boolean;
}

export interface StreamHandlers {
  onChunk: (delta: string) => void;
  onDone: (metrics: Record<string, number | undefined>, thinking?: string) => void;
  onError: (message: string) => void;
}

export async function streamLLMResponse(
  body: LLMRequestBody,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/llm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (e: any) {
    handlers.onError(e?.message ?? "Network error");
    return;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error) msg = j.error;
    } catch {}
    handlers.onError(msg);
    return;
  }

  const ctype = res.headers.get("content-type") ?? "";

  if (ctype.includes("application/x-ndjson") && res.body) {
    for await (const ev of parseNDJSONStream(res.body)) {
      if (ev.type === "chunk") handlers.onChunk(ev.delta);
      else if (ev.type === "done") handlers.onDone(ev.metrics, ev.thinking);
      else handlers.onError(ev.error);
    }
    return;
  }

  // JSON fallback path — unified handling
  try {
    const data = await res.json();
    if (typeof data.response === "string") handlers.onChunk(data.response);
    handlers.onDone(data.metrics ?? {}, data.thinking);
  } catch (e: any) {
    handlers.onError(e?.message ?? "Invalid response");
  }
}

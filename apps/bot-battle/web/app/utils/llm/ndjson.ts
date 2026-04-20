export type StreamEvent =
  | { type: "chunk"; delta: string }
  | { type: "done"; metrics: Record<string, number | undefined>; thinking?: string }
  | { type: "error"; error: string };

export async function* parseNDJSONStream(
  stream: ReadableStream<Uint8Array>
): AsyncIterable<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newlineIdx).trim();
      buffer = buffer.slice(newlineIdx + 1);
      if (!line) continue;
      yield parseLine(line);
    }
  }

  const trailing = buffer.trim();
  if (trailing) yield parseLine(trailing);
}

function parseLine(line: string): StreamEvent {
  try {
    const obj = JSON.parse(line);
    if (obj && typeof obj === "object" && "type" in obj) return obj as StreamEvent;
    return { type: "error", error: `Invalid event shape: ${line.slice(0, 80)}` };
  } catch {
    return { type: "error", error: `Invalid JSON: ${line.slice(0, 80)}` };
  }
}

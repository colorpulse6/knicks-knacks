import { describe, it, expect } from "vitest";
import { parseNDJSONStream, StreamEvent } from "./ndjson";

function toStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      for (const c of chunks) ctrl.enqueue(encoder.encode(c));
      ctrl.close();
    },
  });
}

async function collect(events: AsyncIterable<StreamEvent>): Promise<StreamEvent[]> {
  const out: StreamEvent[] = [];
  for await (const e of events) out.push(e);
  return out;
}

describe("parseNDJSONStream", () => {
  it("parses complete JSON lines", async () => {
    const s = toStream([
      '{"type":"chunk","delta":"Hello "}\n',
      '{"type":"chunk","delta":"world"}\n',
      '{"type":"done","metrics":{"latencyMs":100}}\n',
    ]);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([
      { type: "chunk", delta: "Hello " },
      { type: "chunk", delta: "world" },
      { type: "done", metrics: { latencyMs: 100 } },
    ]);
  });

  it("buffers lines split across chunks", async () => {
    const s = toStream([
      '{"type":"chunk","del',
      'ta":"split"}\n{"type":"done","metrics":{}}\n',
    ]);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toHaveLength(2);
    expect((events[0] as any).delta).toBe("split");
  });

  it("skips blank lines", async () => {
    const s = toStream(['\n', '{"type":"chunk","delta":"x"}\n', '\n']);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([{ type: "chunk", delta: "x" }]);
  });

  it("emits error event for malformed JSON", async () => {
    const s = toStream(['not json\n']);
    const events = await collect(parseNDJSONStream(s));
    expect(events[0].type).toBe("error");
  });

  it("handles a trailing line without newline", async () => {
    const s = toStream(['{"type":"chunk","delta":"tail"}']);
    const events = await collect(parseNDJSONStream(s));
    expect(events).toEqual([{ type: "chunk", delta: "tail" }]);
  });
});

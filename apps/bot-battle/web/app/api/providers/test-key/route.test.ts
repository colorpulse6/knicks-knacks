import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "./route";

function makeReq(body: unknown) {
  return new Request("http://local/api/providers/test-key", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  }) as any;
}

describe("POST /api/providers/test-key", () => {
  const realFetch = global.fetch;
  beforeEach(() => { global.fetch = vi.fn(); });
  afterEach(() => { global.fetch = realFetch; });

  it("returns 400 when provider missing", async () => {
    const res = await POST(makeReq({ key: "x" }));
    expect(res.status).toBe(400);
  });

  it("returns ok:true on 2xx from provider", async () => {
    (global.fetch as any).mockResolvedValue({ ok: true, status: 200 });
    const res = await POST(makeReq({ provider: "openai", key: "sk-..." }));
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it("returns ok:false with error on 401", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false, status: 401,
      text: async () => "invalid api key",
      statusText: "Unauthorized",
    });
    const res = await POST(makeReq({ provider: "openai", key: "bad" }));
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBeTruthy();
  });

  it("returns ok:false for unknown provider", async () => {
    const res = await POST(makeReq({ provider: "bogus", key: "x" }));
    const json = await res.json();
    expect(json.ok).toBe(false);
  });
});

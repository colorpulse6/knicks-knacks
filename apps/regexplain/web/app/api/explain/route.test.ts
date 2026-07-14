import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const originalApiKey = process.env.GROQ_API_KEY;
const originalModel = process.env.GROQ_MODEL;

function completionResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      id: "chatcmpl-route-test",
      object: "chat.completion",
      created: 1_725_000_000,
      model: "openai/gpt-oss-20b",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content },
          finish_reason: "stop",
        },
      ],
      usage: {
        queue_time: 0.01,
        prompt_tokens: 42,
        prompt_time: 0.02,
        completion_tokens: 12,
        completion_time: 0.03,
        total_tokens: 54,
        total_time: 0.05,
      },
      system_fingerprint: "fp_route_test",
      x_groq: { id: "req_route_test" },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function requestWithBody(body: string): Request {
  return new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

function jsonRequest(body: unknown): Request {
  return requestWithBody(JSON.stringify(body));
}

async function expectError(
  response: Response,
  status: number,
  code: string,
  message: string,
) {
  expect(response.status).toBe(status);
  await expect(response.json()).resolves.toEqual({
    error: { code, message },
  });
}

beforeEach(() => {
  delete process.env.GROQ_API_KEY;
  delete process.env.GROQ_MODEL;
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalApiKey === undefined) {
    delete process.env.GROQ_API_KEY;
  } else {
    process.env.GROQ_API_KEY = originalApiKey;
  }
  if (originalModel === undefined) {
    delete process.env.GROQ_MODEL;
  } else {
    process.env.GROQ_MODEL = originalModel;
  }
});

describe("POST /api/explain", () => {
  it("rejects malformed JSON before reading server configuration", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(requestWithBody("{"));

    await expectError(
      response,
      400,
      "invalid_json",
      "Request body must be valid JSON.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", { flags: "" }, "Pattern must be a non-empty string."],
    [
      "wrong type",
      { pattern: 42, flags: "" },
      "Pattern must be a non-empty string.",
    ],
    [
      "empty",
      { pattern: "   ", flags: "" },
      "Pattern must be a non-empty string.",
    ],
    [
      "too long",
      { pattern: "a".repeat(1001), flags: "" },
      "Pattern must be 1,000 characters or fewer.",
    ],
  ])("rejects a %s pattern", async (_label, body, message) => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(jsonRequest(body));

    await expectError(response, 400, "invalid_pattern", message);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["missing", { pattern: "a" }],
    ["wrong type", { pattern: "a", flags: null }],
    ["duplicate", { pattern: "a", flags: "ii" }],
    ["unsupported", { pattern: "a", flags: "x" }],
    ["runtime-incompatible", { pattern: "a", flags: "uv" }],
  ])("rejects %s flags", async (_label, body) => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(jsonRequest(body));

    await expectError(
      response,
      400,
      "invalid_flags",
      "Use unique JavaScript flags: d, g, i, m, s, u, v, y.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when the server API key is missing", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(jsonRequest({ pattern: "^\\d+$", flags: "" }));

    await expectError(
      response,
      503,
      "service_unavailable",
      "The explanation service is not configured.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a summary and applies the server model override", async () => {
    process.env.GROQ_API_KEY = "server-secret";
    process.env.GROQ_MODEL = "custom/server-model";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        completionResponse('{"summary":"  Matches digits.  "}'),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(jsonRequest({ pattern: "^\\d+$", flags: "i" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      summary: "Matches digits.",
    });
    const upstreamBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { model: string };
    expect(upstreamBody.model).toBe("custom/server-model");
  });

  it("maps an aborted upstream request to a safe 504", async () => {
    process.env.GROQ_API_KEY = "server-secret";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(
        new DOMException("provider timeout detail", "AbortError"),
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      jsonRequest({ pattern: "sensitive-pattern", flags: "" }),
    );
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(504);
    expect(JSON.parse(body)).toEqual({
      error: {
        code: "upstream_timeout",
        message: "The explanation service timed out.",
      },
    });
    expect(body).not.toContain("provider timeout detail");
    expect(body).not.toContain("sensitive-pattern");
    expect(body).not.toContain("server-secret");
  });

  it("maps a non-OK upstream response to a safe 502", async () => {
    process.env.GROQ_API_KEY = "server-secret";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"error":{"message":"provider-secret-body"}}', {
        status: 500,
        statusText: "Internal Server Error",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      jsonRequest({ pattern: "sensitive-pattern", flags: "" }),
    );
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(502);
    expect(JSON.parse(body)).toEqual({
      error: {
        code: "upstream_error",
        message: "The explanation service is unavailable.",
      },
    });
    expect(body).not.toContain("provider-secret-body");
    expect(body).not.toContain("sensitive-pattern");
    expect(body).not.toContain("server-secret");
  });

  it("maps a malformed upstream response to a safe 502", async () => {
    process.env.GROQ_API_KEY = "server-secret";
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(completionResponse('{"summary":"   "}'));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      jsonRequest({ pattern: "sensitive-pattern", flags: "" }),
    );
    const body = JSON.stringify(await response.json());

    expect(response.status).toBe(502);
    expect(JSON.parse(body)).toEqual({
      error: {
        code: "invalid_upstream_response",
        message: "The explanation service returned an invalid response.",
      },
    });
    expect(body).not.toContain("sensitive-pattern");
    expect(body).not.toContain("server-secret");
  });
});

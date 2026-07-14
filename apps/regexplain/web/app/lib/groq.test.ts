import { describe, expect, it, vi } from "vitest";

import { GroqError, requestGroqSummary } from "./groq";

const endpoint = "https://api.groq.com/openai/v1/chat/completions";

function completionResponse(content: unknown): Response {
  return new Response(
    JSON.stringify({
      id: "chatcmpl-test",
      object: "chat.completion",
      created: 1_725_000_000,
      model: "openai/gpt-oss-20b",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content,
          },
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
      system_fingerprint: "fp_test",
      x_groq: { id: "req_test" },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

function abortedBodyResponse(): Response {
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.error(
          new DOMException("provider timeout detail", "AbortError"),
        );
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function captureError(action: () => Promise<unknown>) {
  try {
    await action();
  } catch (error) {
    return error;
  }

  throw new Error("Expected action to reject");
}

describe("requestGroqSummary", () => {
  it("uses the default model and returns a trimmed summary", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        completionResponse('{"summary":"  Matches digits.  "}'),
      );

    const summary = await requestGroqSummary(
      { pattern: "^\\d+$", flags: "", apiKey: "server-secret" },
      fetchMock,
    );

    expect(summary).toBe("Matches digits.");
    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { model: string };
    expect(requestBody.model).toBe("openai/gpt-oss-20b");
  });

  it("uses the supplied server model override", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(completionResponse('{"summary":"Matches a."}'));

    await requestGroqSummary(
      {
        pattern: "a",
        flags: "i",
        apiKey: "server-secret",
        model: "custom/server-model",
      },
      fetchMock,
    );

    const requestBody = JSON.parse(
      String(fetchMock.mock.calls[0]?.[1]?.body),
    ) as { model: string };
    expect(requestBody.model).toBe("custom/server-model");
  });

  it("sends the regex, timeout signal, low reasoning effort, and exact summary schema", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(completionResponse('{"summary":"Matches digits."}'));

    await requestGroqSummary(
      { pattern: "^\\d+$", flags: "gi", apiKey: "server-secret" },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(endpoint);
    const init = fetchMock.mock.calls[0]?.[1];
    expect(init).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer server-secret",
      },
    });
    expect(init?.signal).toBeInstanceOf(AbortSignal);

    const requestBody = JSON.parse(String(init?.body)) as {
      messages: Array<{ role: string; content: string }>;
      reasoning_effort: string;
      response_format: unknown;
    };
    expect(requestBody.messages.at(-1)?.content).toContain("/^\\d+$/gi");
    expect(JSON.stringify(requestBody)).not.toContain("breakdown");
    expect(requestBody.reasoning_effort).toBe("low");
    expect(requestBody.response_format).toEqual({
      type: "json_schema",
      json_schema: {
        name: "regex_explanation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
          },
          required: ["summary"],
          additionalProperties: false,
        },
      },
    });
  });

  it("returns a typed safe error for a non-OK upstream response", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('{"error":{"message":"provider-secret-body"}}', {
        status: 429,
        statusText: "Too Many Requests",
      }),
    );

    const error = await captureError(() =>
      requestGroqSummary(
        {
          pattern: "sensitive-pattern",
          flags: "",
          apiKey: "server-secret",
        },
        fetchMock,
      ),
    );

    expect(error).toBeInstanceOf(GroqError);
    expect(error).toMatchObject({
      code: "upstream_error",
      message: "The explanation service is unavailable.",
    });
    expect(String(error)).not.toContain("provider-secret-body");
    expect(String(error)).not.toContain("sensitive-pattern");
    expect(String(error)).not.toContain("server-secret");
  });

  it("returns a typed safe timeout error for an aborted request", async () => {
    const aborted = new DOMException("provider timeout detail", "AbortError");
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(aborted);

    const error = await captureError(() =>
      requestGroqSummary(
        {
          pattern: "sensitive-pattern",
          flags: "",
          apiKey: "server-secret",
        },
        fetchMock,
      ),
    );

    expect(error).toBeInstanceOf(GroqError);
    expect(error).toMatchObject({
      code: "upstream_timeout",
      message: "The explanation service timed out.",
    });
    expect(String(error)).not.toContain("provider timeout detail");
    expect(String(error)).not.toContain("sensitive-pattern");
    expect(String(error)).not.toContain("server-secret");
  });

  it("classifies an abort while consuming the response body as a timeout", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(abortedBodyResponse());

    const error = await captureError(() =>
      requestGroqSummary(
        {
          pattern: "sensitive-pattern",
          flags: "",
          apiKey: "server-secret",
        },
        fetchMock,
      ),
    );

    expect(error).toBeInstanceOf(GroqError);
    expect(error).toMatchObject({
      code: "upstream_timeout",
      message: "The explanation service timed out.",
    });
    expect(String(error)).not.toContain("provider timeout detail");
    expect(String(error)).not.toContain("sensitive-pattern");
    expect(String(error)).not.toContain("server-secret");
  });

  it.each([
    ["missing content", undefined],
    ["non-string content", 42],
    ["malformed JSON", "not-json"],
    ["missing summary", "{}"],
    ["non-string summary", '{"summary":42}'],
    ["empty summary", '{"summary":"   "}'],
  ])("rejects %s without leaking response details", async (_label, content) => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(completionResponse(content));

    const error = await captureError(() =>
      requestGroqSummary(
        {
          pattern: "sensitive-pattern",
          flags: "",
          apiKey: "server-secret",
        },
        fetchMock,
      ),
    );

    expect(error).toBeInstanceOf(GroqError);
    expect(error).toMatchObject({
      code: "invalid_upstream_response",
      message: "The explanation service returned an invalid response.",
    });
    expect(String(error)).not.toContain(String(content));
    expect(String(error)).not.toContain("sensitive-pattern");
    expect(String(error)).not.toContain("server-secret");
  });
});
